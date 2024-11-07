import { For, Show, VoidComponent } from 'solid-js';
import { createMutation, createRealtimeResource, invalidateQuery } from '~/lib/pocketbase';
import { CommentsResponse, ThreadsResponse, UsersResponse } from '~/types/pocketbase-gen';
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
          switch (event.action) {
            case 'create': {
              current.items.push(event.record);
              current.totalItems += 1;
              break;
            }
            case 'delete': {
              current.items = current.items.filter((c) => c.id !== event.record.id);
              current.totalItems -= 1;
              break;
            }
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

      const result = await createComment.mutateAsync({
        thread: props.id,
        content: values.content,
        author: session.userId,
      });

      return result;
    },
    onSuccess() {
      reset();
    },
  });

  form;

  const deleteComment = createMutation('comments', 'delete', {
    async onSuccess() {
      await invalidateQuery('comments/getList');
    },
  });

  const handleDelete = (commentId: string, authorId: string) => {
    if (app.session().userId === authorId) {
      deleteComment.mutate(commentId);
    }
  };

  return (
    <div class="w-full h-full grid grid-rows-[auto_1fr_auto] grid-cols-1 gap-8">
      <div class="w-full max-h-min flex flex-col gap-2 pt-4 pb-8 border-b-muted-foreground/50 border-b-2">
        <div class="w-full flex items-start gap-4">
          <div class="bg-blue-600/50 w-10 h-10 aspect-square rounded-full" />
          <div class="w-full flex flex-col gap-2">
            <div class="w-full flex items-center gap-1">
              <span class="text-blue-500 text-sm">{props.expand?.author.name || props.expand?.author.username}</span>
              <span class="text-xs text-foreground/50">{dayjs(props.created).fromNow()}</span>
              <Button variant="default" size="icon" class="size-6 ml-auto">
                <i class="i-lucide-edit inline-block" />
              </Button>
            </div>

            <h1 class="text-foreground font-medium text-lg">{props.title}</h1>
            <p class="text-sm text-foreground/70">{props.content}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-8 h-full overflow-auto">
        <For
          each={comments.data()?.items}
          fallback={<div class="text-muted-foreground text-center">Be the first to reply to this post</div>}
        >
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

              <Show when={app.session().userId === comment.author}>
                <Button
                  class="ml-auto size-8"
                  size="icon"
                  onClick={() => handleDelete(comment.id, comment.author)}
                  loading={deleteComment.isPending}
                >
                  <i class="i-lucide-trash inline-block" />
                </Button>
              </Show>
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
            submitOnEnter={true}
          />
        </TextField>
        <Button type="submit" size="icon" class="rounded-full">
          <i class="i-lucide-send-horizontal" />
        </Button>
      </form>
    </div>
  );
};
