# «Ну и сходил…» — Android-версия

Игра целиком лежит в `app/src/main/assets/www/index.html` (three.js, модели и шрифты внутри — интернет не нужен).
Приложение — это полноэкранный WebView, который открывает этот файл.

## Как получить APK через GitHub (без Android Studio)

1. Создайте новый репозиторий на GitHub и загрузите в него **всё содержимое этой папки**
   (включая скрытую папку `.github`). Проще всего: `git init`, `git add .`, `git commit -m "init"`,
   `git remote add origin …`, `git push -u origin main`.
2. Откройте вкладку **Actions** → workflow **«Собрать APK»**. Он запускается сам при каждом push
   (или вручную кнопкой **Run workflow**).
3. Через 3–5 минут в карточке запуска внизу появится артефакт **nu-i-shodil-apk** — скачайте zip,
   внутри `app-debug.apk`. Установите его на телефон (разрешите установку из неизвестных источников).

## Подписанный release-APK (необязательно)

Debug-APK подходит для установки на свои устройства. Если нужен подписанный релиз:

```
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nuisxodil
base64 -w0 release.jks   # скопируйте вывод
```

В репозитории: **Settings → Secrets and variables → Actions → New repository secret**:
`KEYSTORE_BASE64` (вывод base64), `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`nuisxodil`), `KEY_PASSWORD`.
После этого workflow соберёт ещё и `app-release.apk`. Файл `release.jks` в репозиторий не кладите.

## Как менять игру

Исходники — в `game-src/src` (`head.html` — разметка и стили, `game.js` — код игры).
При каждом push GitHub сам пересобирает `index.html` командой
`python3 game-src/build/build.py app/src/main/assets/www/index.html`.
Локально можно сделать то же самое и открыть получившийся `index.html` в Chrome.

## Свои 3D-модели

Встроены модели Kenney (дома и грузовики; лицензия CC0/MIT, см. `game-src/build/KENNEY_LICENSE.md`).
Чтобы заменить их своими `.glb`: положите файлы в `app/src/main/assets/www/models/` и перечислите в
`models.json`, например:

```json
{ "truck_red": "my_truck.glb", "house_a": "my_house.glb" }
```

Имена, которые использует игра: `house_a`…`house_d`, `truck_red`, `truck_green`, `truck_yellow`, `truck_purple`.
Модель автоматически ставится на землю и масштабируется под нужный размер.
Подходящие бесплатные модели: kenney.nl, quaternius.com, poly.pizza (берите формат glTF/GLB, лицензия CC0).
