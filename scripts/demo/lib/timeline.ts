// timeline & randomness helpers for the demo seed
//
// everything is computed relative to `new Date()` (meaning now) at seed time so the demo
// always looks like it has been active in the recent past, no matter when it
// is deployed or reset.

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

export const daysAgo = (n: number): Date => new Date(Date.now() - n * DAY_MS);
export const hoursAgo = (n: number): Date => new Date(Date.now() - n * HOUR_MS);
export const minutesAgo = (n: number): Date => new Date(Date.now() - n * MINUTE_MS);

export const addDays = (date: Date, n: number): Date => new Date(date.getTime() + n * DAY_MS);
export const addHours = (date: Date, n: number): Date => new Date(date.getTime() + n * HOUR_MS);
export const addMinutes = (date: Date, n: number): Date => new Date(date.getTime() + n * MINUTE_MS);

export const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randFloat = (min: number, max: number, decimals = 2): number => {
  const value = Math.random() * (max - min) + min;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

export const chance = (probability: number): boolean => Math.random() < probability;

export const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

export const shuffle = <T>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// pick `count` distinct items at random (capped at the array length)
export const sample = <T>(items: readonly T[], count: number): T[] =>
  shuffle(items).slice(0, Math.min(count, items.length));

// a studdered date between `minDaysAgo` and `maxDaysAgo` from now
export const randomPastDate = (minDaysAgo: number, maxDaysAgo: number): Date =>
  daysAgo(randFloat(minDaysAgo, maxDaysAgo, 3));


// Monday 00:00 of the current week (matches luxon startOf('week'))
export const startOfWeek = (): Date => {
  const d = new Date();
  const day = d.getDay();                 // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;  // days back to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// a random production slot Mon–Thu, this week or next, during working hours
export const productionSlot = (): Date => {
  const slot = addDays(startOfWeek(), randInt(0, 1) * 7 + randInt(0, 3)); // week 0/1, Mon–Thu
  slot.setHours(randInt(8, 14), pick([0, 15, 30, 45]), 0, 0);
  return slot;
};

export const spreadDates = (start: Date, end: Date, count: number): Date[] => {
  if (count <= 0) return [];
  const span = end.getTime() - start.getTime();
  const step = span / (count + 1);
  const dates: Date[] = [];
  for (let i = 1; i <= count; i++) {
    const base = start.getTime() + step * i;
    const jitter = (Math.random() - 0.5) * step * 0.6;
    dates.push(new Date(base + jitter));
  }
  return dates.sort((a, b) => a.getTime() - b.getTime());
};

export const stamp = (createdAt: Date, updatedAt?: Date) => ({
  createdAt,
  updatedAt: updatedAt ?? createdAt,
});
