import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel } from '../ui/TextField';
import { createForm } from '@felte/solid';
import { children, Component, JSX } from 'solid-js';
import { ClientResponseError } from 'pocketbase';
import { TypedPocketBase } from '~/types/pocketbase-gen';
import { getRequestEvent } from 'solid-js/web';
import Pocketbase from 'pocketbase';
import { API_URL } from '~/lib/constants';

const SignupSchema = v.pipe(
  v.object({
    email: v.pipe(v.string('Email is required'), v.email('Enter a valid email')),
    password: v.pipe(v.string('Password is required'), v.minLength(8, 'Password must be at least 8 characters long.')),
    confirmPassword: v.string(),
  }),
  v.rawCheck((context) => {
    if (context.dataset.typed) {
      const { password, confirmPassword } = context.dataset.value;

      if (confirmPassword !== password) {
        context.addIssue({
          path: [
            {
              key: 'confirmPassword',
              origin: 'value',
              type: 'object',
              value: confirmPassword,
              input: context.dataset.value,
            },
          ],
          message: 'Passwords must match',
        });
      }
    }
  })
);

type SignupData = v.InferInput<typeof SignupSchema>;

const signup = async (data: SignupData) => {
  'use server';
  const pb = new Pocketbase(API_URL) as TypedPocketBase;
  try {
    await pb.collection('users').create({
      email: data.email,
      password: data.password,
      passwordConfirm: data.confirmPassword,
    });
    const event = getRequestEvent();
    if (event) {
      event.locals.pb = pb;

      const cookie = event.locals.pb.authStore.exportToCookie();

      event.response.headers.set('Set-Cookie', cookie);
    }
  } catch (err) {
    const e = err as ClientResponseError;
    console.error(e.data);
    throw e as ClientResponseError;
  }
};

interface SignupFormProps {
  children: JSX.Element | ((state: { pending: () => boolean }) => JSX.Element);
}

export const SignupForm: Component<SignupFormProps> = (props) => {
  const { form, errors, setErrors, touched, isSubmitting } = createForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    extend: validator({ schema: SignupSchema }),
    onError() {
      setErrors('email', 'Something went wrong');
      setErrors('password', 'Something went wrong');
      setErrors('confirmPassword', 'Something went wrong');
    },
    async onSubmit(values) {
      return await signup(values);
    },
  });
  form;

  const resolvedChildren = children(() => {
    const c = props.children;

    if (typeof c === 'function') {
      return c({ pending: () => isSubmitting() });
    }

    return c;
  });

  return (
    <form use:form class="grid grid-cols-1 grid-rows-2 gap-8 py-4 px-8">
      <TextField
        id="email"
        required
        validationState={touched('email') && errors('email')?.length ? 'invalid' : 'valid'}
      >
        <TextFieldLabel class="flex flex-col gap-2 text-foreground">
          Email
          <TextFieldInput type="email" name="email" />
          <TextFieldErrorMessage>{errors('email')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      <TextField required validationState={touched('password') && errors('password')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-foreground">
          Password
          <TextFieldInput type="password" name="password" />
          <TextFieldErrorMessage>{errors('password')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      <TextField
        required
        validationState={touched('confirmPassword') && errors('confirmPassword')?.length ? 'invalid' : 'valid'}
      >
        <TextFieldLabel class="flex flex-col gap-2 text-foreground">
          Confirm Password
          <TextFieldInput type="password" name="confirmPassword" />
          <TextFieldErrorMessage>{errors('confirmPassword')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      {resolvedChildren()}
    </form>
  );
};
