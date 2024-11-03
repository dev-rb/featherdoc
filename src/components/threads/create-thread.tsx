import { createForm } from '@felte/solid';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from '../ui/TextField';
import { ParentComponent } from 'solid-js';
import { Button } from '../ui/Button';
import { createMutation } from '~/lib/pocketbase';
import { usePocketbase } from '../pocketbase-context';

const CreateThreadSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.optional(v.string()),
});

type CreateThreadValues = v.InferInput<typeof CreateThreadSchema>;

export const CreateThreadForm: ParentComponent = (props) => {
  const pb = usePocketbase();
  const createThread = createMutation('threads', 'create');

  const { form, isDirty } = createForm<CreateThreadValues>({
    extend: validator({ schema: CreateThreadSchema }),
    onSubmit(values) {
      // createThread.mutate({
      //   author: '',
      //   title: values.title,
      //   content: values.description,
      // })
      //
    },
  });

  form;

  return (
    <form use:form class="flex flex-col gap-2 bg-muted-foreground/20 p-2 rounded-lg">
      <TextField name="title" class="text-foreground">
        <TextFieldTextArea class="resize-none min-h-30" placeholder="Title..." />
      </TextField>
      <TextField name="description" class="text-foreground">
        <TextFieldTextArea class="resize-none min-h-xs" placeholder="Description..." />
      </TextField>

      <Button class="gap-2 w-fit self-end mt-5" type="submit" disabled={!isDirty()}>
        <i class="i-lucide-message-square inline-block" />
        Post
      </Button>

      {props.children}
    </form>
  );
};
