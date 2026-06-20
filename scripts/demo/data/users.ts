export const DEMO_USERS: ReadonlyArray<{ name: string; roleKey: string }> = [
  // dedicated login for the demo instance's `demo` / `demo` credentials.
  // name derives to email `demo@demo.lumexia` (see seedUsers); auth.ts looks it up.
  { name: 'Demo', roleKey: 'systemAdmin' },
  { name: 'Morgra Hearthbreaker', roleKey: 'systemAdmin' },
  { name: 'Valen Duskwalker', roleKey: 'purchasing' },
  { name: 'Zix Many-Sides', roleKey: 'purchasing' },
  { name: 'Bramble Thistledown', roleKey: 'production' },
  { name: 'Penelope Gearwhistle', roleKey: 'production' },
  { name: 'Kallista Ashworth', roleKey: 'productionQuality' },
  { name: 'Modron Whiskers', roleKey: 'systemAdmin' }
];

