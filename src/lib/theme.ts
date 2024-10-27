import { createSignal } from 'solid-js';
import { isServer } from 'solid-js/web';
import { getCookie, setCookie } from 'vinxi/server';

export type AppTheme = 'light' | 'dark';
const [appTheme, _setAppTheme] = createSignal<AppTheme>('light');

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
  return (match?.groups?.value as AppTheme) || undefined;
};

export const getAppTheme = () => {
  if (isServer) {
    return getServerCookieTheme();
  }

  const cookie = getClientCookieTheme() ?? themePreference();

  if (appTheme() !== cookie) {
    _setAppTheme(cookie);
  }

  return appTheme();
};

export const setAppTheme = (theme: AppTheme) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  setServerCookie('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);

  _setAppTheme(theme);

  return theme;
};
