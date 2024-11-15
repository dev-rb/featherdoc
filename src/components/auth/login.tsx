import { createForm } from '@felte/solid';
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel } from '../ui/TextField';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { children, Component, JSX } from 'solid-js';
import { TypedPocketBase } from '~/types/pocketbase-gen';
import Pocketbase from 'pocketbase';
import { getRequestEvent } from 'solid-js/web';
import { revalidate } from '@solidjs/router';
import { API_URL } from '~/lib/constants';

const LoginSchema = v.object({
  email: v.pipe(v.string('Email is required'), v.email('Enter a valid email')),
  password: v.pipe(v.string('Password is required'), v.minLength(1, 'Password must be at least 1 character.')),
});

type LoginData = v.InferInput<typeof LoginSchema>;

const login = async (data: LoginData) => {
  'use server';
  const pb = new Pocketbase(API_URL) as TypedPocketBase;
  try {
    await pb.collection('users').authWithPassword(data.email, data.password);
    await pb.collection('users').authRefresh();
    const event = getRequestEvent();
    if (event) {
      event.locals.pb = pb;
      const cookie = pb.authStore.exportToCookie();

      event.response.headers.set('Set-Cookie', cookie);
    }
  } catch (err) {
    throw err;
  }
};

interface LoginFormProps {
  children: JSX.Element | ((state: { pending: () => boolean }) => JSX.Element);
}

export const LoginForm: Component<LoginFormProps> = (props) => {
  const { form, isSubmitting, errors, setErrors } = createForm({
    initialValues: {
      email: '',
      password: '',
    },
    extend: validator({ schema: LoginSchema }),
    onError(e) {
      setErrors('email', 'Email or password was incorrect');
      setErrors('password', 'Email or password was incorrect');
    },
    async onSubmit(values) {
      await login(values);
      await revalidate('session', true);
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
      <TextField id="email" required validationState={errors('email')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-foreground">
          Email
          <TextFieldInput type="email" name="email" />
          <TextFieldErrorMessage>{errors('email')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      <TextField required validationState={errors('password')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-foreground">
          Password
          <TextFieldInput type="password" name="password" />
          <TextFieldErrorMessage>{errors('password')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      {resolvedChildren()}
    </form>
  );
};
