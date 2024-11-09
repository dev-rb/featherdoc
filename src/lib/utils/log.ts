import { isDev } from 'solid-js/web';

const APP_NAME = 'support-world';
const LOG_ICONS: Record<LogType, string> = {
  log: '',
  info: 'ℹ',
  error: '❌',
  warn: '⚠',
  debug: '🐛',
};
type LogType = keyof Pick<Console, 'log' | 'info' | 'warn' | 'error' | 'debug'>;
export const log = (type: LogType, ...msg: any[]) => {
  if (!isDev) return;

  console[type](`%c[${LOG_ICONS[type]} ${APP_NAME}]: `, 'color:lightblue', ...msg);
};

export function assertDefined<T>(value: T | undefined, msg?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(msg);
  }
}
