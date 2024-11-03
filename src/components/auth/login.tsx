import { createForm } from '@felte/solid';
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel } from '../ui/TextField';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { FlowComponent } from 'solid-js';
import { TypedPocketBase } from '~/types/pocketbase-gen';
import Pocketbase from 'pocketbase';

const LoginSchema = v.object({
  email: v.pipe(v.string('Email is required'), v.email('Enter a valid email')),
  password: v.pipe(v.string('Password is required'), v.minLength(1, 'Password must be at least 1 character.')),
});

type LoginData = v.InferInput<typeof LoginSchema>;

const login = async (data: LoginData) => {
  'use server'
  const pb = new Pocketbase('http://127.0.0.1:8090') as TypedPocketBase;
  try {
    await pb.collection('users').authWithPassword(data.email, data.password);
    await pb.collection('users').authRefresh()
  } catch (err) {
    throw err;
  }
};

export const LoginForm: FlowComponent = (props) => {
  const { form, errors, setErrors } = createForm({
    initialValues: {
      email: '',
      password: '',
    },
    extend: validator({ schema: LoginSchema }),
    onError(e) {
      console.log("Fail", e)
      setErrors('email', 'Email or password was incorrect');
      setErrors('password', 'Email or password was incorrect');
    },
    async onSubmit(values) {
      await login(values);
    },
  });
  form;

  return (
    <form use:form class="grid grid-cols-1 grid-rows-2 gap-8 py-4 px-8">
      <TextField required validationState={errors('email')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-white">
          Email
          <TextFieldInput type="email" name="email" />
          <TextFieldErrorMessage>{errors('email')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      <TextField required validationState={errors('password')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-white">
          Password
          <TextFieldInput type="password" name="password" />
          <TextFieldErrorMessage>{errors('password')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      {props.children}
    </form>
  );
};
