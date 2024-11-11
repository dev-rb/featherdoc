import { createSignal, For, Show, VoidComponent } from 'solid-js';
import { createMutation, createRealtimeResource, invalidateQuery } from '~/lib/pocketbase';
import { ThreadsResponse, UsersResponse } from '~/types/pocketbase-gen';
import { usePocketbase } from '../pocketbase-context';
import { createForm } from '@felte/solid';
import * as v from 'valibot';
import { validator } from '~/lib/felte';
import { useApp } from '../app-context';
import { TextField, TextFieldTextArea } from '../ui/TextField';
import { Button } from '../ui/Button';
import dayjs from 'dayjs';
import { createScrollBottom } from '~/lib/primitives';
import { cn } from '~/lib/utils';

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

  const [containerRef, setContainerRef] = createSignal<HTMLElement>();

  createScrollBottom(containerRef);

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

  const { form, data, reset } = createForm<CreateCommentValues>({
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

  const deleteThread = createMutation('threads', 'delete', {
    async onSuccess() {
      await Promise.all([invalidateQuery('threads/getList'), invalidateQuery('threads/getOne')]);
    },
  });

  const updateThread = createMutation('threads', 'update', {
    async onSuccess() {
      await Promise.all([invalidateQuery('threads/getList'), invalidateQuery('threads/getOne')]);
    },
  });

  const deleteComment = createMutation('comments', 'delete', {
    async onSuccess() {
      await invalidateQuery('comments/getList');
    },
  });

  const handleDeleteComment = (commentId: string, authorId: string) => {
    if (app.session().userId === authorId) {
      deleteComment.mutate(commentId);
    }
  };

  const handleDeleteThread = () => {
    if (app.session().userId === props.author) {
      deleteThread.mutate(props.id);
    }
  };

  const handleResolvedToggle = () => {
    if (app.session().userId === props.author) {
      updateThread.mutate(props.id, { resolved: !props.resolved });
    }
  };

  return (
    <div class="w-full h-full grid grid-rows-[auto_auto_1fr_auto] grid-cols-1 gap-4">
      <div class="w-full flex items-center">
        <div class="flex items-center gap-2 px-2 py-1 rounded-full bg-secondary text-foreground text-sm">
          <div class={cn('bg-primary size-4 rounded-full', !comments.isConnected() && 'bg-destructive')} />
          {comments.isConnected() ? 'Connected' : 'No connection'}
        </div>
        <div class="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            class="size-8"
            disabled={app.session().userId !== props.author}
            loading={deleteThread.isPending}
            onClick={handleDeleteThread}
          >
            <i class="i-lucide-trash inline-block" />
          </Button>
          <Button variant="outline" size="icon" class="size-8">
            <i class="i-lucide-edit inline-block" />
          </Button>

          <Button variant="outline" size="icon" class="size-8">
            <i class="i-lucide-plus inline-block" />
          </Button>

          <Button
            variant={props.resolved ? 'default' : 'secondary'}
            class="flex items-center gap-2 h-8"
            disabled={app.session().userId !== props.author}
            loading={updateThread.isPending}
            onClick={handleResolvedToggle}
          >
            <i class="i-lucide-check inline-block" />
            Mark as {props.resolved ? 'Unresolved' : 'Resolved'}
          </Button>
        </div>
      </div>
      <div class="w-full max-h-min flex flex-col gap-2 p-4 bg-secondary rounded-lg">
        <div class="w-full flex items-start gap-4">
          <div class="bg-blue-600/50 w-10 h-10 aspect-square rounded-full" />
          <div class="w-full flex flex-col gap-2">
            <div class="w-full flex items-center gap-2">
              <span class="text-foreground/70 text-xs">{props.expand?.author.username || 'Unknown'}</span>
              <span class="text-xs text-foreground/50">{dayjs(props.created).fromNow()}</span>
            </div>

            <h1 class="text-foreground font-medium text-2xl">{props.title}</h1>
            <Show when={props.content}>
              <p class="text-sm text-foreground/70">{props.content}</p>
            </Show>
          </div>
        </div>
      </div>

      <div ref={setContainerRef} class="flex flex-col gap-8 h-full overflow-auto py-4">
        <For
          each={comments.data()?.items}
          fallback={<div class="text-muted-foreground text-center">Be the first to reply to this thread</div>}
        >
          {(comment) => (
            <div class="group w-full flex items-start gap-4">
              <div class="bg-blue-600/50 w-10 h-10 aspect-square rounded-full"></div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-foreground/70 text-xs">{comment.author}</span>
                  <span class="text-xs text-foreground/50">{dayjs(comment.created).fromNow()}</span>
                </div>

                <div class="w-full h-max text-foreground/70">{comment.content}</div>
              </div>

              <Show when={app.session().userId === comment.author}>
                <Button
                  class="ml-auto size-8 group-hover:flex hidden"
                  size="icon"
                  variant="secondary"
                  onClick={() => handleDeleteComment(comment.id, comment.author)}
                  loading={deleteComment.isPending}
                >
                  <i class="i-lucide-ellipsis-vertical inline-block" />
                </Button>
              </Show>
            </div>
          )}
        </For>
      </div>

      <form
        use:form
        class="row-start-4 w-full flex gap-2 justify-between p-2 bg-foreground/10 focus-within:(ring ring-ring) rounded-md"
      >
        <TextField name="content" class="h-fit flex-1 text-foreground rounded-0" value={data().content}>
          <TextFieldTextArea
            class="min-h-[1.5rem] p-0 resize-none bg-transparent rounded-0 border-none text-base focus-visible:ring-none max-h-xs"
            autoResize
            placeholder="Send a message..."
            submitOnEnter={true}
          />
        </TextField>
        <Button type="submit" size="icon" class="h-full max-h-12 text-xl">
          <i class="i-lucide-send-horizontal inline-block" />
        </Button>
      </form>
    </div>
  );
};
