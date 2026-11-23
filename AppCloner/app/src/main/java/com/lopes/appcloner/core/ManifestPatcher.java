package com.lopes.appcloner.core;

import com.reandroid.arsc.chunk.xml.AndroidManifestBlock;
import com.reandroid.arsc.chunk.xml.ResXmlAttribute;
import com.reandroid.arsc.chunk.xml.ResXmlElement;
import com.reandroid.arsc.value.ValueType;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Переписывает бинарный AndroidManifest.xml так, чтобы приложение
 * можно было установить рядом с оригиналом:
 *  - новое имя пакета;
 *  - относительные имена классов превращаются в абсолютные (иначе классы не найдутся);
 *  - authorities провайдеров, собственные permission, taskAffinity и process
 *    переименовываются, чтобы не конфликтовать с оригиналом;
 *  - убираются sharedUserId, testOnly и instrumentation;
 *  - опционально: новое имя, вырезанные разрешения, debuggable, allowBackup.
 */
public final class ManifestPatcher {

    // Идентификаторы атрибутов android:* (android.R.attr)
    static final int ID_label = 0x01010001;
    static final int ID_name = 0x01010003;
    static final int ID_manageSpaceActivity = 0x01010004;
    static final int ID_permission = 0x01010006;
    static final int ID_readPermission = 0x01010007;
    static final int ID_writePermission = 0x01010008;
    static final int ID_sharedUserId = 0x0101000b;
    static final int ID_process = 0x01010011;
    static final int ID_taskAffinity = 0x01010012;
    static final int ID_authorities = 0x01010018;
    static final int ID_targetActivity = 0x01010202;
    static final int ID_sharedUserLabel = 0x01010261;
    static final int ID_testOnly = 0x01010272;
    static final int ID_backupAgent = 0x0101027f;
    static final int ID_allowBackup = 0x01010280;
    static final int ID_parentActivityName = 0x010103a7;
    static final int ID_appComponentFactory = 0x0101057a;

    private static final String[] COMPONENT_TAGS = {
            "application", "activity", "activity-alias", "service", "receiver", "provider"
    };
    private static final int[] CLASS_ATTRS = {
            ID_backupAgent, ID_targetActivity, ID_parentActivityName,
            ID_manageSpaceActivity, ID_appComponentFactory
    };
    private static final int[] PERMISSION_REF_ATTRS = {
            ID_permission, ID_readPermission, ID_writePermission
    };

    public static final class Result {
        public byte[] bytes;
        public String oldPackage;
        public int minSdk = 1;
        public final List<String> log = new ArrayList<>();
    }

    private final CloneOptions opts;
    private String oldPkg;
    private String newPkg;
    private final List<String> log = new ArrayList<>();

    private ManifestPatcher(CloneOptions opts) {
        this.opts = opts;
    }

    public static Result patch(InputStream manifestStream, CloneOptions opts, boolean isBase)
            throws IOException {
        return new ManifestPatcher(opts).run(manifestStream, isBase);
    }

    /** Только прочитать имя пакета и minSdk, ничего не меняя. */
    public static String readPackage(InputStream manifestStream) throws IOException {
        return AndroidManifestBlock.load(manifestStream).getPackageName();
    }

    private Result run(InputStream in, boolean isBase) throws IOException {
        AndroidManifestBlock manifest = AndroidManifestBlock.load(in);
        oldPkg = manifest.getPackageName();
        newPkg = opts.newPackage;
        if (oldPkg == null) throw new IOException("В манифесте нет имени пакета");
        if (!CloneOptions.isValidPackageName(newPkg)) {
            throw new IOException("Некорректное имя пакета: " + newPkg);
        }
        if (newPkg.equals(oldPkg)) throw new IOException("Новый пакет совпадает с оригиналом");

        List<ResXmlElement> all = collectAll(manifest);

        // 1. Абсолютные имена классов (считаем от СТАРОГО пакета, до переименования)
        int fixedClasses = 0;
        for (ResXmlElement el : all) {
            if (isOneOf(el.getName(), COMPONENT_TAGS)) {
                if (absolutize(el.searchAttributeByResourceId(ID_name))) fixedClasses++;
            }
            for (int id : CLASS_ATTRS) {
                if (absolutize(el.searchAttributeByResourceId(id))) fixedClasses++;
            }
        }
        log.add("Имена классов приведены к полным: " + fixedClasses);

        // 2. Собственные permission / permission-group / permission-tree
        java.util.Map<String, String> permMap = new java.util.HashMap<>();
        for (ResXmlElement el : all) {
            String tag = el.getName();
            if ("permission".equals(tag) || "permission-group".equals(tag)
                    || "permission-tree".equals(tag)) {
                ResXmlAttribute a = el.searchAttributeByResourceId(ID_name);
                String v = str(a);
                if (v != null) {
                    String nv = uniqueName(v);
                    permMap.put(v, nv);
                    a.setValueAsString(nv);
                }
            }
        }
        // ссылки на переименованные permission
        for (ResXmlElement el : all) {
            String tag = el.getName();
            if ("uses-permission".equals(tag) || "uses-permission-sdk-23".equals(tag)
                    || "uses-permission-sdk-m".equals(tag)) {
                ResXmlAttribute a = el.searchAttributeByResourceId(ID_name);
                String v = str(a);
                if (v != null && permMap.containsKey(v)) a.setValueAsString(permMap.get(v));
            }
            for (int id : PERMISSION_REF_ATTRS) {
                ResXmlAttribute a = el.searchAttributeByResourceId(id);
                String v = str(a);
                if (v != null && permMap.containsKey(v)) a.setValueAsString(permMap.get(v));
            }
        }
        if (!permMap.isEmpty()) log.add("Собственных разрешений переименовано: " + permMap.size());

        // 3. authorities провайдеров
        int auth = 0;
        for (ResXmlElement el : all) {
            if (!"provider".equals(el.getName())) continue;
            ResXmlAttribute a = el.searchAttributeByResourceId(ID_authorities);
            String v = str(a);
            if (v == null) continue;
            String[] parts = v.split(";");
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < parts.length; i++) {
                if (i > 0) sb.append(';');
                sb.append(uniqueName(parts[i].trim()));
            }
            a.setValueAsString(sb.toString());
            auth++;
        }
        if (auth > 0) log.add("Провайдеров (authorities) переименовано: " + auth);

        // 4. taskAffinity и process с именем пакета внутри
        for (ResXmlElement el : all) {
            for (int id : new int[]{ID_taskAffinity, ID_process}) {
                ResXmlAttribute a = el.searchAttributeByResourceId(id);
                String v = str(a);
                if (v == null) continue;
                String nv = renameIdent(v);
                if (nv != null) a.setValueAsString(nv);
            }
        }

        // 5. Удаляем то, что мешает установке рядом с оригиналом
        for (ResXmlElement el : all) {
            removeAttr(el, ID_sharedUserId);
            removeAttr(el, ID_sharedUserLabel);
            removeAttr(el, ID_testOnly);
        }
        ResXmlElement root = manifest.getManifestElement();
        if (root != null) {
            root.removeElementsIf(e -> "instrumentation".equals(e.getName()));
        }

        // 6. Вырезаем выбранные пользователем разрешения
        if (isBase && !opts.removePermissions.isEmpty() && root != null) {
            final int[] removed = {0};
            root.removeElementsIf(e -> {
                String tag = e.getName();
                if (!"uses-permission".equals(tag) && !"uses-permission-sdk-23".equals(tag)) {
                    return false;
                }
                String v = str(e.searchAttributeByResourceId(ID_name));
                boolean rm = v != null && opts.removePermissions.contains(v);
                if (rm) removed[0]++;
                return rm;
            });
            log.add("Разрешений вырезано: " + removed[0]);
        }

        // 7. Имя пакета
        manifest.setPackageName(newPkg);
        log.add("Пакет: " + oldPkg + " → " + newPkg);

        // 8. Опции только для базового APK
        if (isBase) {
            if (opts.newLabel != null && !opts.newLabel.trim().isEmpty()) {
                String label = opts.newLabel.trim();
                manifest.setApplicationLabel(label);
                for (ResXmlElement el : all) {
                    String tag = el.getName();
                    if (("activity".equals(tag) || "activity-alias".equals(tag)) && isLauncher(el)) {
                        el.getOrCreateAndroidAttribute("label", ID_label).setValueAsString(label);
                    }
                }
                log.add("Название: " + label);
            }
            if (opts.debuggable) {
                manifest.setDebuggable(true);
                log.add("debuggable = true");
            }
            if (opts.allowBackup) {
                ResXmlElement app = manifest.getApplicationElement();
                if (app != null) {
                    app.getOrCreateAndroidAttribute("allowBackup", ID_allowBackup)
                            .setValueAsBoolean(true);
                    log.add("allowBackup = true");
                }
            }
        }

        manifest.refresh();
        Result r = new Result();
        r.bytes = manifest.getBytes();
        r.oldPackage = oldPkg;
        Integer min = manifest.getMinSdkVersion();
        r.minSdk = min != null ? min : 1;
        r.log.addAll(log);
        return r;
    }

    // ---------- helpers ----------

    private static List<ResXmlElement> collectAll(AndroidManifestBlock manifest) {
        List<ResXmlElement> list = new ArrayList<>();
        Iterator<ResXmlElement> it = manifest.recursiveElements();
        while (it.hasNext()) list.add(it.next());
        return list;
    }

    private static boolean isOneOf(String s, String[] arr) {
        for (String a : arr) if (a.equals(s)) return true;
        return false;
    }

    private static String str(ResXmlAttribute a) {
        if (a == null || a.getValueType() != ValueType.STRING) return null;
        return a.getValueAsString();
    }

    private static void removeAttr(ResXmlElement el, int id) {
        if (el.searchAttributeByResourceId(id) != null) el.removeAttributesWithId(id);
    }

    /** ".Main" или "Main" → "old.pkg.Main". */
    private boolean absolutize(ResXmlAttribute a) {
        String v = str(a);
        if (v == null || v.isEmpty()) return false;
        String full;
        if (v.charAt(0) == '.') full = oldPkg + v;
        else if (v.indexOf('.') < 0) full = oldPkg + "." + v;
        else return false;
        a.setValueAsString(full);
        return true;
    }

    /** Заменяет вхождение старого пакета на новый; null — если пакета в строке нет. */
    String renameIdent(String v) {
        if (v == null) return null;
        if (v.equals(oldPkg)) return newPkg;
        if (v.startsWith(oldPkg + ".") || v.startsWith(oldPkg + ":")) {
            return newPkg + v.substring(oldPkg.length());
        }
        if (v.contains(oldPkg)) return v.replace(oldPkg, newPkg);
        return null;
    }

    /** Всегда возвращает имя, гарантированно отличное от оригинального. */
    String uniqueName(String v) {
        String r = renameIdent(v);
        return r != null ? r : newPkg + "." + v;
    }

    private static boolean isLauncher(ResXmlElement activity) {
        Iterator<ResXmlElement> filters = activity.getElements("intent-filter");
        while (filters.hasNext()) {
            Iterator<ResXmlElement> cats = filters.next().getElements("category");
            while (cats.hasNext()) {
                String v = str(cats.next().searchAttributeByResourceId(ID_name));
                if ("android.intent.category.LAUNCHER".equals(v)
                        || "android.intent.category.LEANBACK_LAUNCHER".equals(v)) {
                    return true;
                }
            }
        }
        return false;
    }
}
