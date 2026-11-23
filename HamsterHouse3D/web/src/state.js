// Общее состояние игры (заполняется в main.js)
export const G = {
  scene: null, camera: null, world: null,
  hamsters: [], treats: [], droppings: [],
  food: 80, water: 80,
  time: 17 * 60,               // игровые минуты с начала (день 1, 17:00)
  nextId: 1,
  memorial: [],
  selected: null,
  settings: {
    breeding: false, lifecycle: false, life: 'normal',
    speed: 1, daynight: true, labels: true, sound: true,
  },
  seenWelcome: false,
  toast: () => {}, onHamsterGone: () => {}, onBirth: () => {},
};

export const GAME_MIN_PER_SEC = 3;  // 1 игровой день = 480 c = 8 минут при ×1
export const ADULT_DAYS = 3;        // взрослеют за 3 игровых дня
export const GESTATION_DAYS = 1;    // беременность 1 игровой день
export const BIRTH_COOLDOWN = 2;
export const MAX_HAMSTERS = 12;
export const LIFE_DAYS = { short: 12, normal: 30, long: 90 };
