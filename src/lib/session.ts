import { useSession } from 'vinxi/http';

export interface AppSession {}

export const getAppSession = async () => {
  'use server';

  return await useSession<AppSession>({ password: '123' });
};

export const createAppSession = async (data: AppSession) => {
  'use server';
  const session = await getAppSession();

  await session.update(data);
};

export const clearSession = async () => {
  'use server';
  const session = await getAppSession();

  session.clear();
};
