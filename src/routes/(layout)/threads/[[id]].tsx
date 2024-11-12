import { Collapsible } from '@kobalte/core';
import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { ClientResponseError } from 'pocketbase';
import { createEffect, createMemo, createSignal, ErrorBoundary, For, Show, Suspense } from 'solid-js';
import { usePocketbase } from '~/components/pocketbase-context';
import { CreateThreadForm } from '~/components/threads/create-thread';
import { ThreadCard } from '~/components/threads/thread-card';
import { ThreadView } from '~/components/threads/thread-view';
import { Button } from '~/components/ui/Button';
import { TextField, TextFieldInput } from '~/components/ui/TextField';
import { createQuery } from '~/lib/pocketbase';
import { CommentsResponse, UsersResponse } from '~/types/pocketbase-gen';

export default function Threads() {
  const pb = usePocketbase();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = createMemo(() => {
    const page = Number(searchParams.page);

    if (Number.isNaN(page) || !Number.isFinite(page) || !Number.isSafeInteger(page)) {
      return 0;
    }

    return page;
  });

  const threads = createQuery<
    { author: UsersResponse; comments_via_thread?: CommentsResponse[] },
    'threads',
    'getList'
  >('threads', 'getList', (s) =>
    s(currentPage(), 50, {
      expand: 'author,comments_via_thread',
    })
  );

  const threadWithId = createQuery<{ author: UsersResponse }, 'threads', 'getOne'>(
    'threads',
    'getOne',
    (s) => s(params.id, { expand: 'author' }),
    { enabled: () => params.id !== undefined }
  );

  return (
    <main class="w-full h-full grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] overflow-hidden">
      <aside class="flex flex-col bg-muted w-full lg:(min-w-md max-w-md) overflow-hidden lg:pt-4 border-r-1 border-r-secondary">
        <div class="w-full p-2 flex flex-col gap-2">
          <Collapsible.Root class="flex flex-col gap-2 w-full p-2 rounded-lg">
            <div class="flex items-center justify-center gap-4">
              <TextField class="flex-1">
                <TextFieldInput class="bg-muted-foreground/50" type="search" placeholder="Search threads..." />
              </TextField>
              <Collapsible.Trigger
                as={Button}
                size="sm"
                class="group w-fit h-full ui-expanded:(p-0 aspect-square rounded-full) ui-closed:self-end gap-2 transition-all"
              >
                <i class="group-data-[expanded]:i-lucide-x i-lucide-message-square inline-block text-lg" />
                <span class="max-lg:hidden group-data-[expanded]:hidden">New Thread</span>
              </Collapsible.Trigger>
            </div>
            <Collapsible.Content>
              <CreateThreadForm />
            </Collapsible.Content>
          </Collapsible.Root>
        </div>
        <div class="w-full h-full custom-v-scrollbar pb-4 flex flex-col overflow-auto">
          <Suspense>
            <For each={threads.data()?.items} fallback={<div class="text-white">No threads available</div>}>
              {(thread) => (
                <ThreadCard
                  id={thread.id}
                  author={thread.expand!.author}
                  description={thread.content}
                  title={thread.title}
                  resolved={thread.resolved}
                  timestamp={thread.created}
                  totalReplies={thread.expand?.comments_via_thread?.length ?? 0}
                />
              )}
            </For>
          </Suspense>
        </div>
      </aside>
      <Show
        when={params.id !== undefined}
        fallback={
          <div class="max-lg:hidden w-full h-full flex-center flex-col gap-4 text-primary text-xl">
            ＼（〇_ｏ）／
            <span>No thread loaded</span>
          </div>
        }
      >
        <article class="w-full h-full overflow-hidden bg-muted rounded-lg p-2 lg:p-4 max-lg:(fixed top-0 left-0)">
          <ErrorBoundary
            fallback={(e) => {
              const isNotFoundError = createMemo(() => {
                if ('status' in e) {
                  return e.status === 404;
                }
                return false;
              });
              return (
                <div class="flex flex-col gap-4 w-full h-full items-center justify-center text-primary text-xl">
                  <span class="font-bold">ಥ_ಥ</span>
                  <Show when={isNotFoundError()} fallback={'Failed to load custom'}>
                    Thread not found
                  </Show>
                </div>
              );
            }}
          >
            <Suspense>
              <Show when={threadWithId.data.latest}>
                {(thread) => (
                  <ThreadView
                    {...thread()}
                    onClose={() => {
                      navigate('/threads');
                    }}
                  />
                )}
              </Show>
            </Suspense>
          </ErrorBoundary>
        </article>
        {/* <div class="grid grid-cols-1 grid-rows-2 w-full h-full"> */}
        {/*   <div class="bg-background" /> */}
        {/*   <div class="bg-background" /> */}
        {/* </div> */}
      </Show>
    </main>
  );
}
