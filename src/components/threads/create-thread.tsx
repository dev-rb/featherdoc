import { createForm } from '@felte/solid';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from '../ui/TextField';
import { ParentComponent } from 'solid-js';
import { Button } from '../ui/Button';
import { createMutation } from '~/lib/pocketbase';
import { usePocketbase } from '../pocketbase-context';
import { useApp } from '../app-context';

const CreateThreadSchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  description: v.optional(v.string()),
});

type CreateThreadValues = v.InferInput<typeof CreateThreadSchema>;

export const CreateThreadForm: ParentComponent = (props) => {
  const app = useApp();
  const createThread = createMutation('threads', 'create');

  const { form, isDirty, isSubmitting, setIsSubmitting, reset } = createForm<CreateThreadValues>({
    initialValues: {
      title: '',
      description: undefined,
    },
    extend: validator({ schema: CreateThreadSchema }),
    async onSubmit(values) {
      const data = app.session();
      if (!data.userId) return;
      setIsSubmitting(true);
      await createThread.mutateAsync({
        author: data.userId,
        title: values.title,
        content: values.description,
      });
      reset();
    },
    onSuccess() {
      setIsSubmitting(false);
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

      <Button
        class="gap-2 w-fit self-end mt-5"
        type="submit"
        disabled={!isDirty() || isSubmitting()}
        loading={isSubmitting()}
      >
        <i class="i-lucide-message-square inline-block" />
        Post
      </Button>

      {props.children}
    </form>
  );
};
