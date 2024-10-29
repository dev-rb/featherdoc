import { createForm } from '@felte/solid';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { TextField, TextFieldInput, TextFieldLabel } from '../ui/TextField';
import { action, useAction } from '@solidjs/router';
import * as v from 'valibot';
import { validator } from '~/lib/felte';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Please enter your email'), v.email('Enter a valid email')),
  password: v.pipe(v.string(), v.minLength(1, 'Password must be at least 1 charachter')),
});

const loginAction = action(async (form: FormData) => {
  console.log('Login action', [...form.entries()]);
});

export const LoginForm = () => {
  const login = useAction(loginAction);

  const { form, errors } = createForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: validator(LoginSchema),
    onSubmit(values) {
      console.log('Submit', values);
    },
  });
  form;

  return (
    <Dialog open={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="text-center">Login</DialogTitle>
        </DialogHeader>
        <form class="grid grid-cols-1 grid-rows-2 gap-8 px-8" action={loginAction} method="post">
          <TextField required>
            <TextFieldLabel class="flex flex-col gap-2 text-white">
              Email
              <TextFieldInput type="email" name="email" />
            </TextFieldLabel>
          </TextField>
          <TextField required>
            <TextFieldLabel class="flex flex-col gap-2 text-white">
              Password
              <TextFieldInput type="password" name="password" />
            </TextFieldLabel>
          </TextField>
          <DialogFooter>
            <Button type="submit">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
