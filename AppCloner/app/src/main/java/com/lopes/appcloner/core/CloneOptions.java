package com.lopes.appcloner.core;

import java.util.LinkedHashSet;
import java.util.Set;

/** Настройки одного клона. Чистая Java — без зависимостей от Android. */
public final class CloneOptions {
    /** Новое имя пакета (обязательно, должно отличаться от оригинала). */
    public String newPackage;
    /** Новое имя на рабочем столе. null — оставить как есть. */
    public String newLabel;
    /** Разрешения, которые нужно вырезать из клона (uses-permission). */
    public final Set<String> removePermissions = new LinkedHashSet<>();
    /** Сделать клон отлаживаемым (android:debuggable=true). */
    public boolean debuggable = false;
    /** Разрешить резервное копирование (android:allowBackup=true). */
    public boolean allowBackup = false;

    public CloneOptions() {
    }

    public CloneOptions(String newPackage, String newLabel) {
        this.newPackage = newPackage;
        this.newLabel = newLabel;
    }

    /** Проверка имени пакета по правилам Android. */
    public static boolean isValidPackageName(String name) {
        if (name == null || name.length() < 3 || name.length() > 200) return false;
        String[] parts = name.split("\\.", -1);
        if (parts.length < 2) return false;
        for (String p : parts) {
            if (p.isEmpty()) return false;
            char c = p.charAt(0);
            if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z'))) return false;
            for (int i = 1; i < p.length(); i++) {
                char ch = p.charAt(i);
                boolean ok = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
                        || (ch >= '0' && ch <= '9') || ch == '_';
                if (!ok) return false;
            }
        }
        return true;
    }
}
