import { v4 as uuid } from 'uuid';
import { insert } from '../lib/db';
import { refs } from '../lib/refs';
import { daysAgo, stamp } from '../lib/timeline';
import { DEMO_USERS } from '../data/users';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  roleKey: string;
}

// creates demo users + role assignments
// all emails use the @demo.lumexia domain so reset can identify and purge them
// without touching init's "Lumexia" system user.
export const seedUsers = async (): Promise<DemoUser[]> => {
  const users: DemoUser[] = DEMO_USERS.map((u) => ({
    id: uuid(),
    name: u.name,
    email: `${u.name.toLowerCase().replace(/[^a-z]+/g, '.')}@demo.lumexia`,
    roleKey: u.roleKey,
  }));

  const createdAt = daysAgo(200);
  await insert(
    'user',
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: null,
      ...stamp(createdAt),
    })),
  );

  await insert(
    'userRoleAssignment',
    users.map((u) => ({
      id: uuid(),
      userId: u.id,
      userRoleId: (refs.userRoles as Record<string, string>)[u.roleKey],
      ...stamp(createdAt),
    })),
  );

  return users;
};

export const usersByRole = (users: DemoUser[], roleKey: string): DemoUser[] =>
  users.filter((u) => u.roleKey === roleKey);
