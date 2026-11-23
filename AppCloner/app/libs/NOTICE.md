# Сторонние библиотеки

| Файл | Откуда | Лицензия |
|---|---|---|
| `ARSCLib.jar` | https://github.com/REAndroid/ARSCLib, тег `V1.4.0`; из jar удалены заглушки `android.*` и `org.xmlpull.*` (эти классы есть в самом Android) | Apache License 2.0 |
| `apksig.jar` | AOSP `platform/tools/apksig` (зеркало https://github.com/LineageOS/android_tools_apksig, ветка `lineage-20.0`) | Apache License 2.0 |

Изменения в apksig (`ApkSigner.java`):
1. `ANDROID_COMMON_PAGE_ALIGNMENT_BYTES` = 16384 — несжатые `.so` выравниваются по 16 КБ (подходит для устройств с 4 КБ и 16 КБ страницами).
2. `outputInputJarEntryLfhRecordPreservingDataAlignment` — несжатые записи выравниваются всегда, даже если во входном архиве они не были выровнены (встроенный zipalign).
