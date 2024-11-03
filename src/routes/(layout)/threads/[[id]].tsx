import { Collapsible } from '@kobalte/core';
import { useParams, useSearchParams } from '@solidjs/router';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { usePocketbase } from '~/components/pocketbase-context';
import { CreateThreadForm } from '~/components/threads/create-thread';
import { ThreadCard } from '~/components/threads/thread-card';
import { Button } from '~/components/ui/Button';
import { TextField, TextFieldInput } from '~/components/ui/TextField';
import { createQuery } from '~/lib/pocketbase';
import { UsersResponse } from '~/types/pocketbase-gen';

export default function Threads() {
  const pb = usePocketbase();
  const params = useParams<{ id: string }>();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = createMemo(() => {
    const page = Number(searchParams.page);

    if (Number.isNaN(page) || !Number.isFinite(page) || !Number.isSafeInteger(page)) {
      return 0;
    }

    return page;
  });

  const threads = createQuery<{ author: UsersResponse }, 'threads', 'getList'>(
    'threads',
    'getList',
    currentPage,
    () => 50,
    () => ({
      expand: 'author',
    })
  );

  const threadWithId = createQuery<{ author: UsersResponse }, 'threads', 'getOne'>(
    'threads',
    'getOne',
    () => params.id,
    () => ({
      expand: 'author',
    }),
    { enabled: () => params.id !== undefined }
  );

  return (
    <main class="w-full h-full grid grid-cols-[auto_1fr_auto] overflow-hidden">
      <aside class="flex flex-col bg-muted min-w-md max-w-md overflow-hidden pt-4">
        <div class="w-full p-2 flex flex-col gap-2">
          <Collapsible.Root class="flex flex-col gap-2 w-full ui-expanded:bg-muted-foreground/20 p-2 rounded-lg">
            <Collapsible.Trigger
              as={Button}
              size="sm"
              class="group w-fit ui-expanded:(p-0 aspect-square rounded-full) self-end gap-2 transition-all"
            >
              <i class="group-data-[expanded]:i-lucide-x i-lucide-message-square inline-block text-lg" />
              <span class="group-data-[expanded]:hidden">New Thread</span>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <CreateThreadForm />
            </Collapsible.Content>
          </Collapsible.Root>

          <TextField>
            <TextFieldInput class="bg-muted-foreground/50" type="search" placeholder="Search threads..." />
          </TextField>
        </div>
        <div class="w-full h-full custom-v-scrollbar pb-4 px-2 flex flex-col gap-2 overflow-auto">
          <For each={threads.data.latest?.items}>
            {(thread) => (
              <ThreadCard
                id={thread.id}
                author={thread.expand?.author.name || thread.expand?.author.username || ''}
                title={thread.title}
                resolved={thread.resolved}
                timestamp={thread.created}
                totalReplies={0}
              />
            )}
          </For>
        </div>
      </aside>
      <Show
        when={params.id !== undefined}
        fallback={
          <div class="w-full h-full flex-center flex-col gap-2 text-muted-foreground">
            ＼（〇_ｏ）／
            <span>No thread loaded</span>
          </div>
        }
      >
        <article class="bg-muted rounded-lg m-4">
          <Show when={threadWithId.data()}>
            {(thread) => (
              <ThreadCard
                id={thread().id}
                author={thread().expand?.author.name || thread().expand?.author.username || 'Anonymous'}
                title={thread().title}
                resolved={thread().resolved}
                timestamp={thread().created}
                totalReplies={0}
              />
            )}
          </Show>
        </article>
        {/* <div class="grid grid-cols-1 grid-rows-2 w-full h-full"> */}
        {/*   <div class="bg-background" /> */}
        {/*   <div class="bg-background" /> */}
        {/* </div> */}
      </Show>
    </main>
  );
}
