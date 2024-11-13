import { createAsync } from '@solidjs/router';
import { createSignal, Index, Match, ParentComponent, Show, Suspense, Switch, VoidComponent } from 'solid-js';
import { useApp } from '../app-context';
import { Button } from '../ui/Button';
import { SimpleTooltip } from '../ui/Tooltip';
import { AttachmentLightbox } from '../ui/AttachmentLightbox';
import { cn } from '~/lib/utils';

type AttachmentOption = { name: string; url: string };

type AttachmentType =
  | { type: 'text'; text: string; option: AttachmentOption }
  | { type: 'image'; option: AttachmentOption }
  | { type: 'video'; option: AttachmentOption };

interface AttachmentCollageProps {
  author: string;
  attachments: AttachmentOption[];
  onRemovePress: (attachment: string) => void;
}

export const AttachmentCollage: VoidComponent<AttachmentCollageProps> = (props) => {
  const resolvedFiles = createAsync(async () => {
    const resolved: AttachmentType[] = [];

    for (const attachment of props.attachments) {
      try {
        const response = await fetch(attachment.url);
        const contentType = response.headers.get('Content-Type');

        if (!contentType) continue;

        if (contentType.includes('image')) {
          resolved.push({ type: 'image', option: attachment });
        } else if (contentType.includes('text')) {
          resolved.push({ type: 'text', text: await response.text(), option: attachment });
        } else if (contentType.includes('video')) {
          resolved.push({ type: 'video', option: attachment });
        }
      } catch {
        continue;
      }
    }

    return resolved;
  });

  return (
    <div
      class={cn(
        'w-full grid grid-cols-[repeat(auto-fill,12rem)] grid-rows-[auto_auto] gap-4',
        props.attachments.length === 1 && 'grid-cols-1'
      )}
    >
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
                  <AttachmentCard {...resolved()} author={props.author} onRemovePress={props.onRemovePress} />
                )}
              </Show>
            );
          }}
        </Index>
      </Suspense>
    </div>
  );
};

type AttachmentCard = AttachmentType & Pick<AttachmentCollageProps, 'author' | 'onRemovePress'>;

export const AttachmentCard: VoidComponent<AttachmentCard> = (props) => {
  const app = useApp();
  return (
    <Switch>
      <Match when={props.type === 'image'}>
        <ImageCard src={props.option.url}>
          <Show when={app.session().userId === props.author}>
            <Button
              variant="destructive"
              size="icon"
              class="group-hover/image:(size-6) flex size-0 overflow-hidden absolute top-0 right-0 rounded-full translate-x-1/2 -translate-y-1/2 z-2"
              disabled={app.session().userId !== props.author}
              onClick={() => props.onRemovePress(props.option.name)}
            >
              <SimpleTooltip content="Remove attachment">
                <i class="i-lucide-x block pointer-events-none" />
              </SimpleTooltip>
            </Button>
          </Show>
        </ImageCard>
      </Match>

      <Match when={props.type === 'video'}>
        <VideoCard src={props.option.url}>
          <Show when={app.session().userId === props.author}>
            <Button
              variant="destructive"
              size="icon"
              class="group-hover/image:(size-6) flex size-0 overflow-hidden absolute top-0 right-0 rounded-full translate-x-1/2 -translate-y-1/2 z-2"
              disabled={app.session().userId !== props.author}
              onClick={() => props.onRemovePress(props.option.name)}
            >
              <SimpleTooltip content="Remove attachment">
                <i class="i-lucide-x block pointer-events-none" />
              </SimpleTooltip>
            </Button>
          </Show>
        </VideoCard>
      </Match>

      <Match when={props.type === 'text' && props}>
        {(resolvedText) => <TextCard text={resolvedText().text}></TextCard>}
      </Match>
    </Switch>
  );
};

interface ImageCardProps {
  src: string;
}

const ImageCard: ParentComponent<ImageCardProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <AttachmentLightbox open={open()} onOpenChange={setOpen}>
        <img class="h-auto" src={props.src} />
      </AttachmentLightbox>
      <div
        class="group/image relative w-fit bg-secondary rounded-lg cursor-zoom-in"
        onClick={() => {
          setOpen(true);
        }}
      >
        <img class="w-auto max-h-90 h-full object-contain rounded-lg" src={props.src} />
        {props.children}
      </div>
    </>
  );
};

interface VideoCardProps {
  src: string;
}

const VideoCard: ParentComponent<VideoCardProps> = (props) => {
  return (
    <div class="group/image relative w-full bg-secondary rounded-lg cursor-zoom-in">
      <video class="object-cover rounded-lg" src={props.src} controls muted />
      {props.children}
    </div>
  );
};

interface TextCardProps {
  text: string;
}

const TextCard: ParentComponent<TextCardProps> = (props) => {
  const [open, setOpen] = createSignal(false);
  return (
    <>
      <AttachmentLightbox open={open()} onOpenChange={setOpen}>
        <div class="max-w-screen max-h-85vh overflow-auto bg-secondary text-white rounded-lg p-2">
          <div class="w-full h-full whitespace-pre">{props.text}</div>
        </div>
      </AttachmentLightbox>
      <div class="group/image relative w-full bg-secondary rounded-lg max-h-48 overflow-auto">
        <div class="whitespace-pre grid relative">
          <span class="h-full w-full">{props.text}</span>
          <div class="col-start-1 col-end-1 block absolute top-0 left-0 w-full h-full bg-black/50"></div>
        </div>
        <Button class="absolute top-2 right-2 rounded-full size-6" size="icon" onClick={() => setOpen(true)}>
          <i class="i-lucide-expand inline-block text-sm" />
        </Button>

        {props.children}
      </div>
    </>
  );
};
