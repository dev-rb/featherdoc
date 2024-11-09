import clsx from 'clsx/lite';
import { ClassNameValue, extendTailwindMerge } from 'tailwind-merge';

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'border-style': [{ border: ['b-solid', 't-solid', 'l-solid', 'r-solid', 'solid', 'y-solid', 'x-solid'] }],
    },
  },
});

export const cn = (...args: ClassNameValue[]) => {
  return customTwMerge(clsx(...args));
};

export const copy = <T extends object>(value: T): T => {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value)) as T;
  }
};

export function keys<T extends Record<any, unknown>>(obj: T): Array<keyof T> {
  return Object.keys(obj);
}

export function values<T extends Record<any, any>>(obj: T): Array<T[keyof T]> {
  return Object.values(obj);
}

export function entries<T extends Record<any, any>>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj);
}

export const isObject = (v: any): v is Record<any, any> => {
  return typeof v === 'object';
};

export const isArray = (v: any): v is Array<any> => {
  return Array.isArray(v);
};

export const isNullish = <T>(v: T | null | undefined): v is null | undefined => {
  return v === null || v === undefined;
};

export const isDefined = <T>(v: T | undefined): v is T => {
  return v !== undefined;
};

export const isNull = <T>(v: T | null): v is null => {
  return v === null;
};
