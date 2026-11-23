// Story, themes, heroes and shop data for «Облачко: Большой забег»

export const HEROES = [
  { id: 'oblachko', name: 'Облачко', price: 0, desc: 'Пушистый барашек в бирюзовом шарфе. Бегает на задних копытцах и всегда спешит на помощь.', color: '#2f8f8a' },
  { id: 'pugovka', name: 'Пуговка', price: 300, desc: 'Младший брат Облачка. Жёлтая шапочка, короткие ножки и огромное любопытство.', color: '#f4b13e' },
  { id: 'bella', name: 'Белла', price: 500, desc: 'Розовый бант, ягодный шарф и смелое сердце.', color: '#ec6f9f' },
];

export const ITEMS = {
  letter: { name: 'письма', icon: '✉️' },
  ticket: { name: 'талоны доставки', icon: '🎫' },
  seeds: { name: 'пакетики семян', icon: '🌱' },
  lantern: { name: 'фонарики', icon: '🏮' },
  gift: { name: 'подарки', icon: '🎁' },
  backpack: { name: 'рюкзачок', icon: '🎒' },
  star: { name: 'звёздочки', icon: '⭐' },
  squish: { name: 'сквиш', icon: '🧸' },
  moon: { name: 'лунные искры', icon: '🌙' },
};

// theme: ground/path materials, sky, light, scenery & obstacle tables
export const THEMES = {
  farm: {
    name: 'Луговая станция', sky: ['#9fd3e6', '#e9f4e8'], fog: '#d7ebe6', fogNear: 40, fogFar: 170,
    sun: '#fff1d6', sunI: 2.6, hemi: ['#dff1ff', '#7c9a5c'], hemiI: 1.1, night: false,
    ground: 'grass', path: 'gravel', rails: true, music: 'farm',
    scenery: [['tree_a', 3], ['tree_b', 3], ['tree_c', 2], ['bush_a', 3], ['bush_b', 3], ['flowers', 3], ['fence', 4], ['sunflowers', 2], ['hay', 1]],
    landmarks: [['barn', 1], ['farmhouse', 1], ['windmill', 1], ['station', 1]],
    jump: ['hay', 'crate', 'barrier'], slide: ['arch_flags', 'arch'], block: ['crate_stack', 'wagon', 'wagon2'], moving: ['tractor'], platform: true,
    clouds: true,
  },
  festival: {
    name: 'Праздничная ферма', sky: ['#f2b98a', '#fbe6c4'], fog: '#f6dcb8', fogNear: 40, fogFar: 160,
    sun: '#ffd7a0', sunI: 2.2, hemi: ['#ffe9cc', '#9a8456'], hemiI: 1.0, night: false,
    ground: 'grass', path: 'dirt', music: 'festival',
    scenery: [['garland_post', 4], ['balloons', 2], ['sunflowers', 3], ['tree_a', 2], ['tree_autumn', 2], ['flowers', 3], ['fence', 3], ['bush_b', 2]],
    landmarks: [['barn', 1], ['farmhouse', 1], ['windmill', 1]],
    jump: ['hay', 'crate', 'barrels'], slide: ['arch_flags'], block: ['crate_stack', 'gift_pile'], moving: ['tractor'], clouds: true,
  },
  city: {
    name: 'Проспект Каштанов', sky: ['#a9d3ea', '#eef4f2'], fog: '#dbe9ee', fogNear: 45, fogFar: 180,
    sun: '#fff4e0', sunI: 2.5, hemi: ['#e6f2ff', '#8a8f86'], hemiI: 1.1, night: false,
    ground: 'pavement', path: 'asphalt', music: 'city',
    scenery: [['lamp', 5], ['tree_b', 3], ['bus_stop', 1], ['bush_a', 2]],
    landmarks: [['bld_a', 2], ['bld_b', 2], ['bld_c', 2], ['bld_d', 2]], buildings: true,
    jump: ['barrier', 'cones'], slide: ['arch'], block: ['car', 'car2', 'car3', 'van'], moving: ['car', 'car2', 'car3', 'van', 'bus'], clouds: true,
  },
  market: {
    name: 'Зелёная корзина', sky: ['#e9efe2', '#f6f7ef'], fog: '#eef1e6', fogNear: 30, fogFar: 120,
    sun: '#fff8ea', sunI: 1.4, hemi: ['#ffffff', '#c9cdb8'], hemiI: 1.6, night: false, indoor: true,
    ground: 'tiles', path: 'tiles', music: 'market',
    scenery: [], landmarks: [],
    jump: ['crate', 'cones'], slide: ['arch'], block: ['crate_stack', 'cart'], moving: ['cart'],
  },
  depot: {
    name: 'Вечернее депо', sky: ['#2c3558', '#a3738a'], fog: '#5b5370', fogNear: 30, fogFar: 140,
    sun: '#ffc79a', sunI: 1.0, hemi: ['#8d8fd0', '#3a3540'], hemiI: 0.9, night: true,
    ground: 'gravel_dark', path: 'gravel_dark', rails: true, music: 'depot',
    scenery: [['lamp', 6], ['crate_stack', 1], ['barrels', 1]],
    landmarks: [['bld_a', 1], ['bld_b', 1], ['bld_c', 1], ['station', 1]], buildings: true,
    jump: ['barrier', 'crate', 'barrels'], slide: ['arch'], block: ['wagon', 'wagon2', 'wagon3'], moving: ['wagon3'], platform: true, stars: true,
  },
  forest: {
    name: 'Сосновый лес', sky: ['#a6d0c4', '#e8f1df'], fog: '#cfe3d4', fogNear: 30, fogFar: 140,
    sun: '#fff0cf', sunI: 2.2, hemi: ['#dff3e6', '#5d7a4c'], hemiI: 1.1, night: false,
    ground: 'forest', path: 'dirt', music: 'forest',
    scenery: [['pine_a', 5], ['pine_b', 4], ['tree_c', 2], ['mushroom', 2], ['fern', 4], ['stump', 2], ['bush_a', 2]],
    landmarks: [['cliff_a', 1], ['cliff_b', 1]],
    jump: ['log', 'log', 'stump'], slide: ['arch_branch'], block: ['rock'], moving: [], clouds: true,
  },
  coast: {
    name: 'Морская набережная', sky: ['#8fcfe6', '#eef8f6'], fog: '#d6eef0', fogNear: 45, fogFar: 190,
    sun: '#fff6e2', sunI: 2.7, hemi: ['#e6f6ff', '#c9b78a'], hemiI: 1.15, night: false,
    ground: 'sand', path: 'planks', sea: true, music: 'coast',
    scenery: [['umbrella', 3], ['beach_hut', 2], ['pier_post', 3], ['bench', 1], ['barrels', 1]],
    landmarks: [['lighthouse', 1], ['boat', 2]],
    jump: ['barrels', 'bench', 'crate'], slide: ['arch_flags'], block: ['crate_stack'], moving: [], clouds: true,
  },
  snow: {
    name: 'Снежная деревня', sky: ['#bcd6ea', '#f3f7fa'], fog: '#e4eef5', fogNear: 35, fogFar: 150,
    sun: '#fffaf0', sunI: 2.2, hemi: ['#f0f6ff', '#b8c8d0'], hemiI: 1.3, night: false,
    ground: 'snow', path: 'snowpath', music: 'snow', snowfall: true,
    scenery: [['pine_snow', 6], ['lamp', 2], ['snowman', 1], ['fence', 2]],
    landmarks: [['house_snow', 3], ['xmas_tree', 1]],
    jump: ['snowdrift', 'snowdrift', 'barrier'], slide: ['arch_ice'], block: ['snowman', 'gift_pile'], moving: [], clouds: true,
  },
  newyear: {
    name: 'Площадь большой ёлки', sky: ['#1e2b55', '#5a6aa0'], fog: '#34406b', fogNear: 30, fogFar: 140,
    sun: '#c7d6ff', sunI: 0.9, hemi: ['#8ea6ff', '#4a5070'], hemiI: 1.0, night: true,
    ground: 'snow', path: 'snowpath', music: 'snow', snowfall: true, stars: true,
    scenery: [['pine_snow', 4], ['xmas_tree', 2], ['lamp', 3], ['garland_post', 3], ['snowman', 1]],
    landmarks: [['house_snow', 3]],
    jump: ['snowdrift', 'snowdrift', 'crate'], slide: ['arch_ice'], block: ['gift_pile', 'snowman'], moving: [],
  },
  sakura: {
    name: 'Сад сакуры', sky: ['#f0c7d6', '#f8eef0'], fog: '#f2e2e6', fogNear: 35, fogFar: 150,
    sun: '#fff0ea', sunI: 2.3, hemi: ['#fff0f6', '#8aa27a'], hemiI: 1.15, night: false,
    ground: 'grass_light', path: 'stones', music: 'sakura', petals: true,
    scenery: [['sakura_a', 4], ['sakura_b', 4], ['stone_lantern', 3], ['bush_b', 2], ['flowers', 2]],
    landmarks: [['gate', 1]],
    jump: ['bench', 'barrels'], slide: ['arch_lantern'], block: ['rock', 'crate_stack'], moving: [], clouds: true,
  },
  halloween: {
    name: 'Тыквенная аллея', sky: ['#2b2140', '#7a4f72'], fog: '#4a3a58', fogNear: 25, fogFar: 120,
    sun: '#ffb27a', sunI: 0.8, hemi: ['#9c86d8', '#2f2838'], hemiI: 0.9, night: true,
    ground: 'grass_dark', path: 'dirt_dark', music: 'halloween', stars: true,
    scenery: [['dead_tree', 4], ['pumpkins', 3], ['fence', 2], ['ghost', 2], ['lamp', 2]],
    landmarks: [['spooky_house', 2]],
    jump: ['pumpkins', 'crate'], slide: ['arch_web'], block: ['crate_stack', 'barrels'], moving: ['ghost'],
  },
  night: {
    name: 'Ночная ферма', sky: ['#1a2448', '#41557e'], fog: '#2b3656', fogNear: 30, fogFar: 140,
    sun: '#b8c8ff', sunI: 0.8, hemi: ['#7d93e0', '#2a3244'], hemiI: 0.95, night: true,
    ground: 'grass_dark', path: 'dirt_dark', music: 'depot', stars: true, fireflies: true,
    scenery: [['tree_a', 3], ['tree_c', 2], ['bush_a', 2], ['fence', 3], ['lamp', 2], ['flowers', 2]],
    landmarks: [['farmhouse', 2], ['barn', 1], ['windmill', 1]],
    jump: ['hay', 'crate'], slide: ['arch_flags'], block: ['crate_stack'], moving: [],
  },
};

export const ACTS = [
  { title: 'Семена для праздника', copy: 'Мешочек редких семян уехал с городским грузовиком. Облачко отправляется в путь — от станции до города и обратно.' },
  { title: 'Большие маленькие дела', copy: 'Праздник позади, а дела не кончаются: найти рюкзачок, успеть в школу и вернуть сквиш.' },
  { title: 'Тёплое волшебство', copy: 'Приходит зима. Днём — подарок для Пуговки, ночью — Белла становится лунной феей.' },
  { title: 'Праздники долины', copy: 'Добрые тени Хэллоуина и звезда для самой большой ёлки.' },
];

// q: quests (3 stars). 'finish' is always the first star.
export const CHAPTERS = [
  {
    act: 0, title: 'Письмо с фермы', themes: ['farm'], len: 1100, speed: 15, reward: 40, item: 'letter', items: 5,
    q: [{ t: 'coins', n: 60 }, { t: 'items' }],
    intro: 'Завтра — Праздник Лугов. Но мешочек редких семян по ошибке уехал с городским грузовиком! Ветер разнёс по станции письма с адресом доставки — по ним Облачко узнает, куда ехать.',
    goal: 'Собери 5 писем и добеги до шлагбаума. По рампам можно забежать на крыши вагонов.',
    lines: ['Красная лента на дороге! Грузовик проезжал здесь.', 'Ещё немного — и станция позади!'],
    ending: 'Все письма собраны: грузовик едет в супермаркет «Зелёная корзина». Придётся впервые выйти в большой город.',
  },
  {
    act: 0, title: 'Город на колёсах', themes: ['city'], len: 1300, speed: 16.5, reward: 50, item: 'ticket', items: 5,
    q: [{ t: 'coins', n: 80 }, { t: 'nohit' }],
    intro: 'Проспект Каштанов шумит моторами. Машины едут навстречу, а водитель грузовика по дороге растерял талоны доставки.',
    goal: 'Машины движутся навстречу — уходи с их полосы заранее. Собери талоны доставки.',
    lines: ['Машины действительно едут навстречу! Смотри вперёд.', 'Вдали уже видна вывеска магазина!'],
    ending: 'Вот и «Зелёная корзина»! Водитель говорит: мешочек отнесли в отдел сада. Осталось пройти между огромными стеллажами.',
  },
  {
    act: 0, title: 'Операция «Супермаркет»', themes: ['market'], len: 1100, speed: 14.5, reward: 60, item: 'seeds', items: 5,
    q: [{ t: 'coins', n: 70 }, { t: 'items' }],
    intro: 'Для маленького барашка супермаркет — целый город. Тележки как автобусы, коробки выше забора, а на полках — пакетики семян для праздничной клумбы.',
    goal: 'Ящики — прыжком, тележки — в обход. Собери 5 пакетиков семян для клумбы.',
    lines: ['Отдел сада — в самом конце зала!', 'Касса уже рядом!'],
    ending: 'Кассир узнаёт красную ленту и отдаёт мешочек. «Последний поезд до Луговой ещё не ушёл!» Облачко прячет семена под шарф и мчится на вокзал.',
  },
  {
    act: 0, title: 'Последний поезд', themes: ['depot'], len: 1400, speed: 16.5, reward: 75, item: 'lantern', items: 5,
    q: [{ t: 'coins', n: 90 }, { t: 'items' }],
    intro: 'Над городом зажигаются фонари. Последний состав вот-вот уйдёт в долину, а путь к платформе лежит через грузовое депо.',
    goal: 'Беги по крышам вагонов и собирай фонарики проводника — они показывают дорогу к поезду.',
    lines: ['Мешочек на месте. Ещё немного!', 'Слышишь гудок? Поезд уже на платформе!'],
    ending: 'Облачко успевает! Поезд привозит его к знакомому лугу. На ферме уже зажгли гирлянды, но без семян праздник не начнётся.',
  },
  {
    act: 0, title: 'Домой, к празднику', themes: ['festival'], len: 1200, speed: 16, reward: 100, item: 'gift', items: 5,
    q: [{ t: 'coins', n: 90 }, { t: 'nohit' }],
    intro: 'Ферма светится гирляндами. Друзья ждут у сада, а по дороге рассыпались подарки для праздника. Последний рывок!',
    goal: 'Собери подарки и донеси семена к праздничной клумбе.',
    lines: ['Слышна музыка праздника!', 'Друзья машут у клумбы!'],
    ending: 'Семена спасены! Друзья вместе высаживают их в саду и открывают Праздник Лугов. Даже самый маленький барашек способен на большое дело.',
    finale: true,
  },
  {
    act: 1, title: 'Пуговка и потерянный рюкзачок', themes: ['forest', 'coast'], len: 1500, speed: 15, reward: 60, item: 'backpack', items: 1, hero: 'pugovka',
    q: [{ t: 'coins', n: 90 }, { t: 'items' }],
    intro: 'После прогулки Пуговка заметил: его рюкзачок остался у маяка! На этот раз малыш сам отправляется за пропажей — через сосновый лес на набережную.',
    goal: 'Играешь за Пуговку. Пройди лес и набережную и подбери рюкзачок у маяка.',
    lines: ['Брёвна — прыжком, ветки — подкатом!', 'Пахнет морем! Маяк уже близко.'],
    ending: 'Рюкзачок нашёлся у маяка — целый и невредимый. Пуговка гордо несёт его домой: сам справился!',
  },
  {
    act: 1, title: 'Облачко спешит в школу', themes: ['city'], len: 1400, speed: 17.5, reward: 70, item: 'letter', itemName: 'листки домашнего задания', items: 5, hero: 'oblachko',
    q: [{ t: 'coins', n: 100 }, { t: 'items' }],
    intro: 'Облачко заигрался и вспомнил про урок слишком поздно! Ветер выхватил из рюкзака листки с домашним заданием. Только бы Апполинария Александровна не ругала за опоздание!',
    goal: 'Беги через город и собери 5 листков домашнего задания.',
    lines: ['Звонок через пять минут!', 'Школьное крыльцо уже видно!'],
    ending: 'Облачко влетает в класс со звонком и кладёт на парту все листки. Апполинария Александровна улыбается: «Успел!»',
  },
  {
    act: 1, title: 'Пуговка, верни сквиш!', themes: ['sakura'], len: 1200, speed: 16, reward: 70, item: 'star', items: 5, chase: 'pugovka',
    q: [{ t: 'coins', n: 80 }, { t: 'items' }],
    intro: 'Пуговка схватил любимый сквиш Облачка и умчался в сад сакуры! Догони малыша — по дороге он роняет звёздочки-наклейки.',
    goal: 'Догони Пуговку до конца сада. Под фонарными арками — подкат.',
    lines: ['Пуговка смеётся впереди!', 'Почти догнал!'],
    ending: 'Пуговка сдаётся и возвращает сквиш. Братья вместе смеются под розовыми лепестками.',
  },
  {
    act: 2, title: 'Подарок для Пуговки', themes: ['snow'], len: 1400, speed: 16, reward: 90, item: 'gift', items: 5, hero: 'oblachko',
    q: [{ t: 'coins', n: 100 }, { t: 'nohit' }],
    intro: 'Пришла зима. Облачко собирает подарок для младшего брата: детали спрятаны по всей снежной деревне.',
    goal: 'Перепрыгивай сугробы, скользи под ледяными арками и собери 5 частей подарка.',
    lines: ['Снежинки танцуют вокруг!', 'Дом уже светится окошками!'],
    ending: 'Подарок собран и упакован. Пуговка не может уснуть от счастья — а ночью начинается другая сказка.',
  },
  {
    act: 2, title: 'Белла — лунная фея', themes: ['night'], len: 1300, speed: 15.5, reward: 90, item: 'moon', items: 5, hero: 'bella',
    q: [{ t: 'coins', n: 90 }, { t: 'items' }],
    intro: 'Когда все спят, Белла становится лунной феей. Ей нужно собрать лунные искры, чтобы каждому на ферме приснился добрый сон.',
    goal: 'Играешь за Беллу. Собери 5 лунных искр на ночной ферме.',
    lines: ['Светлячки показывают дорогу.', 'Луна уже высоко!'],
    ending: 'Белла рассыпает лунные искры над крышами. Этой ночью всем снятся только хорошие сны.',
  },
  {
    act: 3, title: 'Хэллоуин · фонарь добрых теней', themes: ['halloween'], len: 1500, speed: 16.5, reward: 120, item: 'lantern', items: 5, hero: 'bella',
    q: [{ t: 'coins', n: 110 }, { t: 'items' }],
    intro: 'Белла несёт фонарь к старому домику. Здесь живут только добрые привидения: они приготовили конфеты, тыквы и смешных летучих мышей.',
    goal: 'Перепрыгивай тыквы, скользи под паутинками и собери 5 фонариков.',
    lines: ['Белла: «Эти привидения совсем не страшные!»', 'До домика с конфетами — рукой подать!'],
    ending: 'Тени оказались добрыми! Белла зажгла фонарь, привидения угостили друзей конфетами. А скоро долину укроет снег.',
  },
  {
    act: 3, title: 'Новый год · звезда для ёлки', themes: ['newyear'], len: 1600, speed: 17, reward: 150, item: 'star', items: 5, hero: 'oblachko',
    q: [{ t: 'coins', n: 120 }, { t: 'nohit' }],
    intro: 'Облачко несёт звезду для самой большой ёлки. Площадь сияет гирляндами, а до полуночи совсем немного.',
    goal: 'Обходи подарки, перепрыгивай сугробы и собери 5 звёздочек.',
    lines: ['Звезда должна зажечься до полуночи!', 'Площадь уже близко!'],
    ending: 'Звезда засияла на большой ёлке. Облачко, Пуговка и Белла снова вместе — впереди целый год новых больших маленьких дел.',
    finale: true,
  },
];

export const ENDLESS_THEMES = ['farm', 'city', 'forest', 'coast', 'snow', 'sakura', 'depot', 'festival', 'halloween', 'market'];

export const UPGRADES = [
  { id: 'magnet', name: 'Магнит', icon: '🧲', base: 7, step: 1.5, desc: 'Притягивает монеты' },
  { id: 'shield', name: 'Щит', icon: '🛡️', base: 9, step: 2, desc: 'Защищает от одного удара' },
  { id: 'x2', name: 'Двойные монеты', icon: '×2', base: 9, step: 2, desc: 'Каждая монета считается дважды' },
  { id: 'boots', name: 'Прыгучие копытца', icon: '👟', base: 8, step: 1.5, desc: 'Высокие прыжки' },
];
export const UPGRADE_COST = [150, 300, 550, 900, 1400];

export const BOOSTS = [
  { id: 'startShield', name: 'Щит на старте', icon: '🛡️', price: 120, desc: 'Забег начинается со щитом' },
  { id: 'startMagnet', name: 'Магнит на старте', icon: '🧲', price: 100, desc: 'Первые секунды монеты летят к тебе' },
  { id: 'extraLife', name: 'Запасное сердечко', icon: '❤️', price: 200, desc: '+1 жизнь на один забег' },
];

export const DIFFICULTY = {
  easy: { name: 'Лёгкий', lives: 5, speed: 0.88, density: 0.8, desc: '5 жизней и спокойный темп' },
  normal: { name: 'Средний', lives: 3, speed: 1.0, density: 1.0, desc: '3 жизни, обычный темп' },
  hard: { name: 'Сложный', lives: 2, speed: 1.14, density: 1.18, desc: '2 жизни, быстро и плотно' },
};
