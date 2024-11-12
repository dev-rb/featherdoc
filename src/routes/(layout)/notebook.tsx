import { Title } from '@solidjs/meta';
import { debounce } from '@solid-primitives/scheduled';
import { createMemo, ErrorBoundary, Show } from 'solid-js';
import { useApp } from '~/components/app-context';
import { usePocketbase } from '~/components/pocketbase-context';
import { Button } from '~/components/ui/Button';
import { RichEditor } from '~/components/ui/rich-editor';
import { createMutation, createQuery, invalidateQuery } from '~/lib/pocketbase';
import { cn } from '~/lib/utils';

export default function Notebook() {
  const app = useApp();
  const pb = usePocketbase();

  const notebook = createQuery(
    'notebooks',
    'getFirstListItem',
    (s) => s(pb.filter('author = {:authorId}', { authorId: app.session().userId })),
    { enabled: () => app.session().userId !== undefined }
  );

  const createNotebook = createMutation('notebooks', 'create', {
    async onSuccess() {
      await invalidateQuery('notebooks/getFirstListItem');
    },
  });
  const updateNotebook = createMutation('notebooks', 'update');

  const handleCreate = () => {
    const userId = app.session().userId;

    if (!userId) return;

    createNotebook.mutate({ author: userId });
  };

  const handleUpdate = (value: string) => {
    const id = notebook.data()?.id;
    if (!id) return;
    updateNotebook.mutate(id, { content: value });
  };

  const debouncedUpdate = debounce((value: string) => {
    handleUpdate(value);
  }, 225);

  return (
    <>
      <Title>Notebook | Support World</Title>
      <div class="w-full h-full grid grid-rows-1 lg:grid-cols-[1fr_2fr_1fr] lg:p-4">
        <div class="relative col-start-1 lg:col-start-2 w-full h-full bg-muted lg:rounded-lg p-4">
          <div
            class={cn(
              'absolute top-2 right-2 text-primary flex items-center gap-2 opacity-0 transition-opacity',
              updateNotebook.isPending && 'opacity-100'
            )}
          >
            <i class="i-svg-spinners-bars-rotate-fade inline-block text-lg" />
            Saving...
          </div>
          <ErrorBoundary
            fallback={(e) => {
              const isNotFoundError = () => {
                if ('status' in e) {
                  return e.status === 404;
                }
                return false;
              };

              return (
                <div class="flex flex-col gap-4 w-full h-full items-center justify-center text-white text-xl">
                  <span class="font-bold">ಥ_ಥ</span>
                  <Show when={isNotFoundError()} fallback={'Failed to load custom'}>
                    Notebook not found
                  </Show>

                  <Button class="gap-2" loading={createNotebook.isPending} onClick={handleCreate}>
                    <i class="i-lucide-plus inline-block" />
                    Create one
                  </Button>
                </div>
              );
            }}
          >
            <RichEditor
              class="w-full h-full focus:outline-none text-white"
              contents={notebook.data.latest?.content}
              onInput={(value) => debouncedUpdate(value)}
            />
          </ErrorBoundary>
        </div>
      </div>
    </>
  );
}
