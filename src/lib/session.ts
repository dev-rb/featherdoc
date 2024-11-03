import { reload, revalidate } from '@solidjs/router';
import { useSession } from 'vinxi/http';

export interface AppSession {
  token: string
}

export const getAppSession = async () => {
  'use server';

  return await useSession<AppSession>({ password: process.env.SESSION_SECRET! });
};

export const createAppSession = async (data: AppSession) => {
  'use server';
  const session = await getAppSession();

  await session.update(data);
  return reload({ revalidate: 'session' })
};

export const clearSession = async () => {
  'use server';
  const session = await getAppSession();

  session.clear();
};

export const updateSession = async (data: Partial<AppSession>) => {
  'use server';
  const session = await getAppSession();

  await session.update(data);
  revalidate('session')
}
