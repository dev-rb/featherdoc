import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel } from '../ui/TextField';
import { createForm } from '@felte/solid';
import { pb } from '~/lib/pocketbase';
import { FlowComponent } from 'solid-js';
import { ClientResponseError } from 'pocketbase';
import { createAppSession } from '~/lib/session';

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
  try {
    const response = await pb.collection('users').create({
      email: data.email,
      password: data.password,
      passwordConfirm: data.confirmPassword,
    });
    createAppSession({});
    console.log('Sign up', response);
  } catch (err) {
    const e = err as ClientResponseError;
    console.error(e.data);
    throw e as ClientResponseError;
  }
};

export const SignupForm: FlowComponent = (props) => {
  const { form, errors, setErrors, touched } = createForm({
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
  return (
    <form use:form class="grid grid-cols-1 grid-rows-2 gap-8 py-4 px-8">
      <TextField required validationState={touched('email') && errors('email')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-white">
          Email
          <TextFieldInput type="email" name="email" />
          <TextFieldErrorMessage>{errors('email')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      <TextField required validationState={touched('password') && errors('password')?.length ? 'invalid' : 'valid'}>
        <TextFieldLabel class="flex flex-col gap-2 text-white">
          Password
          <TextFieldInput type="password" name="password" />
          <TextFieldErrorMessage>{errors('password')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      <TextField
        required
        validationState={touched('confirmPassword') && errors('confirmPassword')?.length ? 'invalid' : 'valid'}
      >
        <TextFieldLabel class="flex flex-col gap-2 text-white">
          Confirm Password
          <TextFieldInput type="password" name="confirmPassword" />
          <TextFieldErrorMessage>{errors('confirmPassword')?.join(' ')}</TextFieldErrorMessage>
        </TextFieldLabel>
      </TextField>
      {props.children}
    </form>
  );
};
