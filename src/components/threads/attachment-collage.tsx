import { createAsync } from '@solidjs/router';
import { For, Index, Show, Suspense, VoidComponent } from 'solid-js';
import { useApp } from '../app-context';
import { Button } from '../ui/Button';
import { SimpleTooltip } from '../ui/Tooltip';

type AttachmentType = { name: string; url: string };

interface AttachmentCollageProps {
  author: string;
  attachments: AttachmentType[];
  onRemovePress: (attachment: string) => void;
}

export const AttachmentCollage: VoidComponent<AttachmentCollageProps> = (props) => {
  const app = useApp();

  const resolvedFiles = createAsync(async () => {
    const resolved: ({ original: AttachmentType; type: string } | { original: AttachmentType; type: null })[] = [];

    for (const attachment of props.attachments) {
      try {
        const blob = await (await fetch(attachment.url)).blob();

        resolved.push({ original: attachment, type: blob.type });
      } catch {
        resolved.push({ original: attachment, type: null });
      }
    }
    return resolved;
  });

  return (
    <div class="grid grid-cols-3 grid-rows-[auto_auto] gap-2">
      <Suspense>
        <Index each={resolvedFiles.latest}>
          {(file) => {
            const _file = () => {
              const f = file();

              if (f.type !== null) {
                return f;
              }
            };

            return (
              <Show when={_file()}>
                {(resolved) => (
                  <Show when={resolved().type.includes('image')}>
                    <div class="group/image relative w-fit bg-secondary rounded-lg cursor-zoom-in">
                      <img class="size-48 object-cover rounded-lg" src={resolved().original.url} />
                      <Show when={app.session().userId === props.author}>
                        <Button
                          variant="destructive"
                          size="icon"
                          class="group-hover/image:(size-6) flex size-0 overflow-hidden absolute top-0 right-0 rounded-full translate-x-1/2 -translate-y-1/2 z-2"
                          disabled={app.session().userId !== props.author}
                          onClick={() => props.onRemovePress(resolved().original.name)}
                        >
                          <SimpleTooltip content="Remove attachment">
                            <i class="i-lucide-x block pointer-events-none" />
                          </SimpleTooltip>
                        </Button>
                      </Show>
                    </div>
                  </Show>
                )}
              </Show>
            );
          }}
        </Index>
      </Suspense>
    </div>
  );
};
