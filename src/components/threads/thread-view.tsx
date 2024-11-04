import { For, onCleanup, onMount, VoidComponent } from 'solid-js';
import { createMutation, createQuery, createRealtimeResource } from '~/lib/pocketbase';
import { CommentsResponse, ThreadsResponse, UsersResponse } from '~/types/pocketbase-gen';
import { usePocketbase } from '../pocketbase-context';
import { createForm } from '@felte/solid';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { useApp } from '../app-context';
import { TextField, TextFieldInput, TextFieldTextArea } from '../ui/TextField';
import { Button } from '../ui/Button';
import { createStore } from 'solid-js/store';

const CreateCommentSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1)),
});

type CreateCommentValues = v.InferInput<typeof CreateCommentSchema>;

type ExpandedThread = ThreadsResponse<{
  author: UsersResponse;
}>;

interface ThreadViewProps extends ExpandedThread {}

export const ThreadView: VoidComponent<ThreadViewProps> = (props) => {
  const pb = usePocketbase();
  const app = useApp();

  const comments = createRealtimeResource(
    'comments',
    'getList',
    (s) =>
      s(0, 50, {
        expand: 'author',

        query: { filter: pb.filter('thread = {:threadId}', { threadId: props.id }), expand: 'author' },
      }),
    {
      realtime: {
        sendOptions: {
          query: { filter: pb.filter('thread = {:threadId}', { threadId: props.id }), expand: 'author' },
        },

        callback(event, current) {
          if (event.action === 'create') {
            current.items.push(event.record);
            current.totalItems += 1;
          }
        },
      },
    }
  );

  const createComment = createMutation('comments', 'create');

  const { form, isDirty, touched, reset } = createForm<CreateCommentValues>({
    initialValues: {
      content: '',
    },
    extend: validator({ schema: CreateCommentSchema }),
    async onSubmit(values) {
      const session = app.session();

      if (!session.userId) return;
      console.log('Do create', values, props.id, session.userId);

      await createComment.mutateAsync({
        thread: props.id,
        content: values.content,
        author: session.userId,
      });
    },
    onSuccess() {
      reset();
    },
  });

  form;

  return (
    <div class="max-w-2xl w-full h-full grid grid-rows-[1fr_auto] grid-cols-1">
      <div class="flex flex-col gap-4">
        <For each={comments.data()?.items}>{(comment) => <div class="text-white">{comment.content}</div>}</For>
      </div>
      <form use:form class="row-start-3 w-full flex gap-2 items-center justify-between">
        <TextField name="content" class="flex-1 text-foreground">
          <TextFieldTextArea />
        </TextField>
        <Button type="submit" size="icon">
          <i class="i-lucide-send-horizontal" />
        </Button>
      </form>
    </div>
  );
};
