export const COLORS = {
  golden:   { name: 'Золотистый',        fur: '#d98a3d', belly: '#fbefe2', ear: '#f2b3a3', pattern: 'belly' },
  white:    { name: 'Белоснежка',        fur: '#f4efe6', belly: '#ffffff', ear: '#f7c6c6', pattern: 'plain' },
  grey:     { name: 'Серый джунгарик',   fur: '#a19b94', belly: '#f4f1ec', ear: '#e8c0b5', stripe: '#4b4642', pattern: 'stripe' },
  cream:    { name: 'Кремовый',          fur: '#efcf9d', belly: '#fff6e8', ear: '#f5c0ae', pattern: 'belly' },
  spotted:  { name: 'Пятнистый',         fur: '#c47a3c', belly: '#fffaf2', ear: '#f4b8a8', pattern: 'spots' },
  black:    { name: 'Чёрный мишка',      fur: '#3d3633', belly: '#6a5d56', ear: '#c09088', pattern: 'belly' },
  cinnamon: { name: 'Корица',            fur: '#b8683a', belly: '#f3dcc5', ear: '#f1ab98', pattern: 'belly' },
  sapphire: { name: 'Сапфировый',        fur: '#8f99ae', belly: '#eef0f5', ear: '#dcb8b8', stripe: '#555c6e', pattern: 'stripe' },
};
export const COLOR_KEYS = Object.keys(COLORS);

export const NAMES_M = ['Пушок','Бублик','Персик','Орешек','Кексик','Тиша','Шустрик','Хрумчик','Пончик','Тимоша',
  'Арахис','Сухарик','Фунтик','Бисквит','Мармелад','Кузя','Финик','Пряник','Шоколад','Тофик','Чапа','Мякиш','Боня','Крош'];
export const NAMES_F = ['Ромашка','Пуговка','Булочка','Ириска','Карамелька','Соня','Маруся','Зефирка','Плюшка','Кнопочка',
  'Ванилька','Звёздочка','Ягодка','Пышка','Лапушка','Тучка','Изюминка','Конфетка','Белочка','Снежинка','Фасолька','Тыковка','Мята','Масяня'];

export function randomName(gender, taken = []) {
  const pool = gender === 'f' ? NAMES_F : NAMES_M;
  const free = pool.filter(n => !taken.includes(n));
  const list = free.length ? free : pool;
  return list[Math.floor(Math.random() * list.length)];
}
