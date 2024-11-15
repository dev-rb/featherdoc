// Taken from: https://github.com/pablo-abc/felte/blob/main/packages/validator-zod/src/index.ts
//
// Modified to use with valibot
import type { Obj, AssignableErrors, ValidationFunction, ExtenderHandler, CurrentForm, Extender } from '@felte/common';
import { _update } from '@felte/common';
import { type ValiError, type GenericSchema, parseAsync } from 'valibot';

export type ValidatorConfig = {
  schema: GenericSchema<any, any, any>;
  level?: 'error' | 'warning';
};

export function validateSchema<Data extends Obj>(schema: GenericSchema<any, any, any>): ValidationFunction<Data> {
  function shapeErrors(errors: ValiError<GenericSchema<any, any, any>>): AssignableErrors<Data> {
    return errors.issues.reduce((err, value) => {
      /* istanbul ignore next */
      if (!value.path) return err;
      // @ts-expect-error I don't know how to type this :)
      return _update(err, value.path.map((p) => p.key).join('.'), (currentValue: undefined | string[]) => {
        if (!currentValue || !Array.isArray(currentValue)) return [value.message];
        return [...currentValue, value.message];
      });
    }, {} as AssignableErrors<Data>);
  }
  return async function validate(values: Data): Promise<AssignableErrors<Data> | undefined> {
    try {
      await parseAsync(schema, values);
    } catch (error) {
      return shapeErrors(error as ValiError<any>);
    }
  };
}

export function validator<Data extends Obj = Obj>({ schema, level = 'error' }: ValidatorConfig): Extender<Data> {
  return function extender(currentForm: CurrentForm<Data>): ExtenderHandler<Data> {
    if (currentForm.stage !== 'SETUP') return {};
    const validateFn = validateSchema<Data>(schema);
    currentForm.addValidator(validateFn, { level });
    return {};
  };
}
