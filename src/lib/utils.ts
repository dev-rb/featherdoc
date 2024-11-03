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
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}
