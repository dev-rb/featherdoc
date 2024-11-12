import { createSignal, For, Match, Show, Switch, VoidComponent } from 'solid-js';
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
import { showToast } from '../ui/Toast';
import { useNavigate } from '@solidjs/router';
import { ACCEPTED_FILE_TYPES } from '~/lib/constants';

const CreateCommentSchema = v.object({
  content: v.pipe(v.string(), v.minLength(1)),
  attachments: v.optional(
    v.pipe(
      v.array(v.pipe(v.file(), v.maxSize(5 * 1024 * 1024, 'Files can not be larger than 5mb'))),
      v.maxLength(5, 'You can only upload 5 files at a time')
    )
  ),
});

type CreateCommentValues = v.InferInput<typeof CreateCommentSchema>;

type ExpandedThread = ThreadsResponse<{
  author: UsersResponse;
}>;

interface ThreadViewProps extends ExpandedThread {
  onClose?: VoidFunction;
}

export const ThreadView: VoidComponent<ThreadViewProps> = (props) => {
  const pb = usePocketbase();
  const app = useApp();

  const navigate = useNavigate();

  const [fileUploadRef, setFileUploadRef] = createSignal<HTMLInputElement>();
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

  const { form, data, reset, setFields } = createForm<CreateCommentValues>({
    initialValues: {
      content: '',
    },
    extend: validator({ schema: CreateCommentSchema }),
    async onSubmit(values) {
      const session = app.session();

      if (!session.userId) return;

      const formData = new FormData();

      for (const file of values.attachments ?? []) {
        formData.append('attachments', file);
      }

      formData.set('thread', props.id);
      formData.set('content', values.content);
      formData.set('author', session.userId);

      const result = await createComment.mutateAsync(formData);

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
      navigate('/threads');
      showToast({ title: 'Thread deleted', variant: 'success' });
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
      showToast({ title: 'Comment deleted', variant: 'success' });
    },
  });

  const updateComment = createMutation('comments', 'update', {
    async onSuccess(id, values) {
      if (typeof values === 'object' && 'attachments-' in values) {
        const attachmentsToRemove = values['attachments-'] as string[];

        if (attachmentsToRemove && attachmentsToRemove.length) {
          comments.fineMutate(
            'items',
            (p) => p.id === id,
            'attachments',
            (p) => p.filter((attachment) => !attachmentsToRemove.includes(attachment))
          );
        }
      }
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

  const handleRemoveAttachment = (commentId: string, authorId: string, attachment: string) => {
    if (app.session().userId !== authorId) return;
    updateComment.mutate(commentId, { 'attachments-': attachment });
  };

  return (
    <div class="w-full h-full grid grid-rows-[auto_1fr_auto] grid-cols-1 gap-4">
      <div class="w-full flex gap-4 items-center">
        <Button variant="secondary" size="icon" class="rounded-full aspect-square" onClick={props.onClose}>
          <i class="i-lucide-x inline-block" />
        </Button>
        <div class="flex items-center gap-2 p-1 lg:px-2 lg:py-1 rounded-full bg-secondary text-foreground text-sm">
          <Switch>
            <Match when={comments.connectionStatus() === 'connecting'}>
              <i class="i-svg-spinners-pulse-2 inline-block text-xl text-primary" />
            </Match>
            <Match when={comments.connectionStatus() === 'connected'}>
              <div class={'bg-primary size-5 lg:size-4 rounded-full'} />
            </Match>
            <Match when={comments.connectionStatus() === 'disconnected'}>
              <div class={'bg-destructive size-5 lg:size-4 rounded-full'} />
            </Match>
          </Switch>
          <span class="lg:block hidden">
            {comments.connectionStatus() === 'connected'
              ? 'Connected'
              : comments.connectionStatus() === 'connecting'
                ? 'Connecting...'
                : 'No connection'}
          </span>
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
            class="flex items-center gap-2 h-8 whitespace-nowrap"
            disabled={app.session().userId !== props.author}
            loading={updateThread.isPending}
            onClick={handleResolvedToggle}
          >
            <i class="i-lucide-check inline-block" />
            Mark as {props.resolved ? 'Unresolved' : 'Resolved'}
          </Button>
        </div>
      </div>
      <div ref={setContainerRef} class="w-full h-full overflow-auto">
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

        <div class="flex flex-col gap-8 w-full h-min py-4">
          <For
            each={comments.data()?.items}
            fallback={<div class="text-muted-foreground text-center">Be the first to reply to this thread</div>}
          >
            {(comment) => (
              <div class="group w-full flex items-start gap-4">
                <div class="bg-blue-600/50 w-10 h-10 aspect-square rounded-full"></div>
                <div class="w-full flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-foreground/70 text-xs">{comment.author}</span>
                    <span class="text-xs text-foreground/50">{dayjs(comment.created).fromNow()}</span>
                  </div>

                  <div class="w-full flex flex-col gap-4 h-max text-foreground/70">
                    <p>{comment.content}</p>
                    <Show
                      when={comment.attachments.length > 1}
                      fallback={
                        <Show when={comment.attachments.length === 1}>
                          <div class="group/image relative w-fit bg-secondary rounded-lg cursor-zoom-in">
                            <img
                              class="w-auto max-h-80 object-cover rounded-lg"
                              src={pb.files.getUrl(comment, comment.attachments[0])}
                            />
                            <Show when={app.session().userId === comment.author}>
                              <Button
                                variant="destructive"
                                size="icon"
                                class="group-hover/image:flex hidden size-6 absolute top-0 right-0 rounded-full translate-x-1/2 -translate-y-1/2 z-2"
                                disabled={app.session().userId !== comment.author}
                                onClick={() =>
                                  handleRemoveAttachment(comment.id, comment.author, comment.attachments[0])
                                }
                              >
                                <i class="i-lucide-x inline-block pointer-events-none" />
                              </Button>
                            </Show>
                          </div>
                        </Show>
                      }
                    >
                      <div class="w-full flex flex-wrap gap-4">
                        <For each={comment.attachments}>
                          {(attachment) => (
                            <div class="group/image relative w-fit bg-secondary rounded-lg cursor-zoom-in">
                              <img class="size-28 object-cover rounded-lg" src={pb.files.getUrl(comment, attachment)} />
                              <Show when={app.session().userId === comment.author}>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  class="group-hover/image:flex hidden size-6 absolute top-0 right-0 rounded-full translate-x-1/2 -translate-y-1/2"
                                  onClick={() => handleRemoveAttachment(comment.id, comment.author, attachment)}
                                  disabled={app.session().userId !== comment.author}
                                >
                                  <i class="i-lucide-x inline-block" />
                                </Button>
                              </Show>
                            </div>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
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
      </div>

      <div class="row-start-4 w-full flex flex-col gap-4">
        <div class="w-full flex gap-4">
          <For each={data('attachments')}>
            {(file) => (
              <Show when={file.type}>
                <div class="relative w-max h-max">
                  <img class="size-24 object-cover rounded-lg" src={URL.createObjectURL(file)} />
                  <Button
                    variant="destructive"
                    size="icon"
                    class="size-6 absolute top-0 right-0 rounded-full translate-x-1/2 -translate-y-1/2"
                    onClick={() => {
                      setFields(
                        'attachments',
                        data('attachments')?.filter((f) => f !== file)
                      );
                    }}
                  >
                    <i class="i-lucide-x inline-block" />
                  </Button>
                </div>
              </Show>
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

          <Button
            as={'div'}
            variant="ghost"
            size="icon"
            class="h-full max-h-12 text-muted-foreground hover:(bg-secondary text-primary) text-xl"
            onClick={() => {
              fileUploadRef()?.click();
            }}
          >
            <input
              ref={setFileUploadRef}
              type="file"
              class="text-0 size-0"
              multiple
              accept={ACCEPTED_FILE_TYPES.join(',')}
              onChange={(e) => {
                const files = e.currentTarget.files;

                if (!files) return;

                const _files = Array.from(files);

                if (_files.length > 5) {
                  showToast({
                    title: "Can't upload more than 5 files",
                    variant: 'error',
                  });
                  return;
                }

                const validated = v.safeParse(CreateCommentSchema, { content: 'S', attachments: _files });

                if (!validated.success) {
                  const failedFiles: File[] = validated.issues.filter((i) => i.type === 'max_size').map((i) => i.input);
                  showToast({
                    title: `File(s) too large: ${failedFiles.map((f) => f.name).join(', ')}`,
                    description: validated.issues.map((i) => i.message).join('. '),
                    variant: 'error',
                  });
                }

                setFields('attachments', _files);
              }}
            />
            <i class="i-lucide-image-plus inline-block" />
          </Button>
          <Button type="submit" size="icon" class="h-full max-h-12 text-xl" disabled={data().content.length === 0}>
            <i class="i-lucide-send-horizontal inline-block" />
          </Button>
        </form>
      </div>
    </div>
  );
};
