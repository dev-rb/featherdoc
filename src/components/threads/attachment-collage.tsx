import { createAsync } from '@solidjs/router';
import { For, Show, Suspense, VoidComponent } from 'solid-js';

interface AttachmentCollageProps {
  attachments: string[];
}

export const AttachmentCollage: VoidComponent<AttachmentCollageProps> = (props) => {
  const resolvedFiles = createAsync(async () => {
    const resolved: ({ original: string; type: string } | { original: string; type: null })[] = [];

    for (const attachment of props.attachments) {
      try {
        const blob = await (await fetch(attachment)).blob();

        resolved.push({ original: attachment, type: blob.type });
      } catch {
        resolved.push({ original: attachment, type: null });
      }
    }
    return resolved;
  });

  return (
    <div class="grid grid-cols-3 grid-rows-2 gap-2">
      <Suspense>
        <For each={resolvedFiles()}>
          {(file) => (
            <Show when={file.type !== null && file}>
              {(resolved) => (
                <Show when={resolved().type.includes('image')}>
                  <div class="group/image relative w-fit bg-secondary rounded-lg cursor-zoom-in">
                    <img class="size-48 object-cover rounded-lg" src={resolved().original} />
                  </div>
                </Show>
              )}
            </Show>
          )}
        </For>
      </Suspense>
    </div>
  );
};
