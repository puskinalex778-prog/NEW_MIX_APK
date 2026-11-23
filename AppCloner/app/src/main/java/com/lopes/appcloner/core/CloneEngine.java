package com.lopes.appcloner.core;

import com.android.apksig.ApkSigner;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.Locale;
import java.util.zip.Deflater;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipOutputStream;

/**
 * Полный конвейер клонирования: для каждого APK (база + сплиты)
 * патчит манифест, пересобирает архив без старой подписи и подписывает заново.
 * Не зависит от Android SDK — можно тестировать на обычной JVM.
 */
public final class CloneEngine {

    public interface Listener {
        /** step — человекочитаемый этап, progress — 0..1 общего прогресса. */
        void onProgress(String step, float progress);

        void onLog(String line);
    }

    public static final class SigningKey {
        public final PrivateKey privateKey;
        public final List<X509Certificate> certificates;

        public SigningKey(PrivateKey privateKey, X509Certificate certificate) {
            this.privateKey = privateKey;
            this.certificates = Collections.singletonList(certificate);
        }
    }

    public static final class Output {
        public final List<File> apks = new ArrayList<>();
        public String oldPackage;
        public String newPackage;
    }

    private volatile boolean cancelled;

    public void cancel() {
        cancelled = true;
    }

    /**
     * @param inputs  первый элемент — base.apk, остальные — split APK
     * @param workDir пустая временная папка
     */
    public Output run(List<File> inputs, File workDir, CloneOptions opts, SigningKey key,
                      Listener l) throws Exception {
        if (inputs.isEmpty()) throw new IOException("Нет входных APK");
        if (!workDir.exists() && !workDir.mkdirs()) throw new IOException("Нет доступа к " + workDir);
        Output out = new Output();
        out.newPackage = opts.newPackage;
        int n = inputs.size();
        for (int i = 0; i < n; i++) {
            checkCancel();
            File src = inputs.get(i);
            boolean isBase = i == 0;
            String baseName = isBase ? "base" : stripExt(src.getName());
            File patched = new File(workDir, baseName + ".unsigned.apk");
            File signed = new File(workDir, baseName + ".apk");
            float from = (float) i / n;
            float span = 1f / n;

            l.onProgress((isBase ? "Пересборка base.apk" : "Пересборка " + src.getName()), from);
            ManifestPatcher.Result res = rewrite(src, patched, opts, isBase, p ->
                    l.onProgress(isBase ? "Пересборка base.apk" : "Пересборка " + src.getName(),
                            from + span * 0.6f * p));
            if (isBase) {
                out.oldPackage = res.oldPackage;
                for (String s : res.log) l.onLog(s);
            }
            checkCancel();
            l.onProgress("Подпись " + signed.getName(), from + span * 0.65f);
            sign(patched, signed, key, res.minSdk);
            //noinspection ResultOfMethodCallIgnored
            patched.delete();
            l.onLog("Подписан: " + signed.getName() + " (" + human(signed.length()) + ")");
            out.apks.add(signed);
        }
        l.onProgress("Готово", 1f);
        return out;
    }

    private void checkCancel() throws InterruptedException {
        if (cancelled) throw new InterruptedException("Отменено");
    }

    interface Progress {
        void on(float p);
    }

    /** Копирует APK, подменяя манифест и выбрасывая старую подпись. */
    static ManifestPatcher.Result rewrite(File in, File out, CloneOptions opts, boolean isBase,
                                          Progress progress) throws IOException {
        try (ZipFile zip = new ZipFile(in)) {
            ZipEntry manifestEntry = zip.getEntry("AndroidManifest.xml");
            if (manifestEntry == null) throw new IOException(in.getName() + ": нет AndroidManifest.xml");
            ManifestPatcher.Result res;
            try (InputStream is = zip.getInputStream(manifestEntry)) {
                res = ManifestPatcher.patch(is, opts, isBase);
            }

            long total = Math.max(1, in.length());
            long done = 0;
            byte[] buf = new byte[256 * 1024];
            try (ZipOutputStream zos = new ZipOutputStream(
                    new BufferedOutputStream(new FileOutputStream(out), 512 * 1024))) {
                zos.setLevel(Deflater.BEST_SPEED);
                java.util.HashSet<String> seen = new java.util.HashSet<>();
                Enumeration<? extends ZipEntry> en = zip.entries();
                while (en.hasMoreElements()) {
                    ZipEntry e = en.nextElement();
                    String name = e.getName();
                    if (e.isDirectory() || isOldSignature(name) || !seen.add(name)) continue;

                    if (name.equals("AndroidManifest.xml")) {
                        ZipEntry ne = new ZipEntry(name);
                        ne.setMethod(ZipEntry.DEFLATED);
                        zos.putNextEntry(ne);
                        zos.write(res.bytes);
                        zos.closeEntry();
                        continue;
                    }

                    ZipEntry ne = new ZipEntry(name);
                    if (e.getMethod() == ZipEntry.STORED) {
                        // resources.arsc и .so должны остаться несжатыми
                        ne.setMethod(ZipEntry.STORED);
                        ne.setSize(e.getSize());
                        ne.setCompressedSize(e.getSize());
                        ne.setCrc(e.getCrc());
                    } else {
                        ne.setMethod(ZipEntry.DEFLATED);
                    }
                    if (e.getTime() != -1) ne.setTime(e.getTime());
                    zos.putNextEntry(ne);
                    try (InputStream is = zip.getInputStream(e)) {
                        copy(is, zos, buf);
                    }
                    zos.closeEntry();
                    long c = e.getCompressedSize();
                    done += c > 0 ? c : 0;
                    progress.on(Math.min(1f, (float) done / total));
                }
            }
            return res;
        }
    }

    static boolean isOldSignature(String name) {
        String u = name.toUpperCase(Locale.ROOT);
        if (u.equals("STAMP-CERT-SHA256")) return true;
        if (!u.startsWith("META-INF/")) return false;
        String rest = u.substring(9);
        if (rest.contains("/")) return false;
        return rest.equals("MANIFEST.MF") || rest.endsWith(".SF") || rest.endsWith(".RSA")
                || rest.endsWith(".DSA") || rest.endsWith(".EC");
    }

    static void sign(File in, File out, SigningKey key, int minSdk) throws Exception {
        ApkSigner.SignerConfig signer = new ApkSigner.SignerConfig.Builder(
                "CERT", key.privateKey, key.certificates).build();
        int min = Math.max(1, minSdk);
        ApkSigner.Builder b = new ApkSigner.Builder(Collections.singletonList(signer))
                .setInputApk(in)
                .setOutputApk(out)
                .setMinSdkVersion(min)
                .setV1SigningEnabled(min < 24)
                .setV2SigningEnabled(true)
                .setV3SigningEnabled(true)
                .setV4SigningEnabled(false)
                .setCreatedBy("AppCloner");
        b.build().sign();
    }

    private static void copy(InputStream is, OutputStream os, byte[] buf) throws IOException {
        int r;
        while ((r = is.read(buf)) != -1) os.write(buf, 0, r);
    }

    private static String stripExt(String n) {
        int i = n.lastIndexOf('.');
        return i > 0 ? n.substring(0, i) : n;
    }

    public static String human(long bytes) {
        if (bytes < 1024) return bytes + " Б";
        double kb = bytes / 1024.0;
        if (kb < 1024) return String.format(Locale.ROOT, "%.0f КБ", kb);
        double mb = kb / 1024.0;
        if (mb < 1024) return String.format(Locale.ROOT, "%.1f МБ", mb);
        return String.format(Locale.ROOT, "%.2f ГБ", mb / 1024.0);
    }
}
