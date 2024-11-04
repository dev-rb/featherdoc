import { For, VoidComponent } from 'solid-js';
import { createMutation, createRealtimeResource } from '~/lib/pocketbase';
import { ThreadsResponse, UsersResponse } from '~/types/pocketbase-gen';
import { usePocketbase } from '../pocketbase-context';
import { createForm } from '@felte/solid';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { useApp } from '../app-context';
import { TextField, TextFieldTextArea } from '../ui/TextField';
import { Button } from '../ui/Button';
import dayjs from 'dayjs';

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

  const { form, reset } = createForm<CreateCommentValues>({
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
      <div class="flex flex-col gap-8">
        <For each={comments.data()?.items}>
          {(comment) => (
            <div class="w-full flex items-start gap-4">
              <div class="bg-blue-600/50 w-10 h-10 aspect-square rounded-full"></div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-1">
                  <span class="text-blue-500 text-sm">{comment.author}</span>
                  <span class="text-xs text-foreground/50">{dayjs(comment.created).fromNow()}</span>
                </div>

                <div class="w-full h-max text-foreground">{comment.content}</div>
              </div>
            </div>
          )}
        </For>
      </div>
      <form
        use:form
        class="row-start-3 w-full flex gap-2 items-center justify-between p-2 bg-foreground/10 focus-within:(ring ring-ring) rounded-md"
      >
        <TextField name="content" class="flex-1 text-foreground rounded-0">
          <TextFieldTextArea
            class="p-0 resize-none bg-transparent rounded-0 border-none focus-visible:ring-none min-h-[50px] max-h-xs"
            autoResize
            placeholder="Send a message..."
          />
        </TextField>
        <Button type="submit" size="icon" class="rounded-full">
          <i class="i-lucide-send-horizontal" />
        </Button>
      </form>
    </div>
  );
};
