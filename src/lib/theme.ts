import { createSignal } from 'solid-js';
import { isServer } from 'solid-js/web';
import { getCookie, setCookie } from 'vinxi/server';

export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

const themePreference = (): AppTheme => {
  if (localStorage.getItem(THEME_STORAGE_KEY)) {
    return localStorage.getItem(THEME_STORAGE_KEY)! as AppTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getServerCookieTheme = (): AppTheme => {
  'use server';

  const theme = getCookie('theme');

  return (theme || 'light') as AppTheme;
};

const setServerCookie = (name: string, value: string) => {
  'use server';

  setCookie(name, value);
};

const getClientCookieTheme = () => {
  if (!document.cookie) return undefined;
  const match = document.cookie.match(new RegExp('\\W?theme=(?<value>\\w+)'));
  return match?.groups?.value as AppTheme;
};

const getInitialAppTheme = () => {
  if (isServer) {
    return 'dark';
  }

  return getClientCookieTheme() ?? themePreference();
};

const [appTheme, _setAppTheme] = createSignal<AppTheme>(getInitialAppTheme());

export const getAppTheme = () => appTheme();

export const setAppTheme = (theme: AppTheme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
  setServerCookie('theme', theme);

  _setAppTheme(theme);

  return theme;
};
