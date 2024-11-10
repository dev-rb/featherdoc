import { useApp } from '~/components/app-context';
import { usePocketbase } from '~/components/pocketbase-context';
import { RichEditor } from '~/components/ui/rich-editor';
import { createMutation, createQuery } from '~/lib/pocketbase';

export default function Notebook() {
  const app = useApp();
  const pb = usePocketbase();

  const notebook = createQuery(
    'notebooks',
    'getFirstListItem',
    (s) => s(pb.filter('author = {:authorId}', { authorId: app.session().userId })),
    { enabled: () => app.session().userId !== undefined }
  );

  const updateNotebook = createMutation('notebooks', 'update');

  const handleUpdate = (value: string) => {
    const id = notebook.data()?.id;
    if (!id) return;
    updateNotebook.mutate(id, { content: value });
  };

  return (
    <div class="w-full h-full grid grid-cols-[1fr_2fr_1fr] p-4">
      <div />
      <div class="w-full h-full bg-muted rounded-lg p-4">
        <RichEditor
          class="w-full h-full focus:outline-none text-white"
          contents={notebook.data.latest?.content}
          onInput={(value) => handleUpdate(value)}
        />
      </div>
      <div />
    </div>
  );
}
