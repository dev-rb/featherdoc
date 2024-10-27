import { useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { ThreadCard } from '~/components/threads/thread-card';

export default function Threads() {
  const params = useParams<{ id: string }>();

  return (
    <main class="w-full h-full grid grid-cols-[auto_1fr_auto] overflow-hidden">
      <aside class="bg-muted max-w-md overflow-hidden pt-4">
        <div class="w-full h-full custom-v-scrollbar pb-4 px-2 flex flex-col gap-2 overflow-auto">
          <ThreadCard
            id={1}
            title="function Component vs arrow function name preference with a really long title just for testing purposes"
            author="dev-rb"
            description="What function form should you use for components? I know it's all preference but I'd like to know what the standard is or what other people prefer and why."
            totalReplies={5}
          />

          <ThreadCard
            id={2}
            title="function Component vs arrow function name preference with a really long title just for testing purposes"
            author="dev-rb"
            description="What function form should you use for components? I know it's all preference but I'd like to know what the standard is or what other people prefer and why."
            totalReplies={5}
          />
          <ThreadCard
            id={3}
            title="function Component vs arrow function name preference with a really long title just for testing purposes"
            author="dev-rb"
            description="What function form should you use for components? I know it's all preference but I'd like to know what the standard is or what other people prefer and why."
            totalReplies={5}
          />
          <ThreadCard
            id={4}
            title="function Component vs arrow function name preference with a really long title just for testing purposes"
            author="dev-rb"
            description="What function form should you use for components? I know it's all preference but I'd like to know what the standard is or what other people prefer and why."
            totalReplies={5}
          />
          <ThreadCard
            id={5}
            title="function Component vs arrow function name preference with a really long title just for testing purposes"
            author="dev-rb"
            description="What function form should you use for components? I know it's all preference but I'd like to know what the standard is or what other people prefer and why."
            totalReplies={5}
          />
          <ThreadCard
            id={6}
            title="function Component vs arrow function name preference with a really long title just for testing purposes"
            author="dev-rb"
            description="What function form should you use for components? I know it's all preference but I'd like to know what the standard is or what other people prefer and why."
            totalReplies={5}
          />
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
        <article class="bg-muted rounded-lg m-4"></article>
        {/* <div class="grid grid-cols-1 grid-rows-2 w-full h-full"> */}
        {/*   <div class="bg-background" /> */}
        {/*   <div class="bg-background" /> */}
        {/* </div> */}
      </Show>
    </main>
  );
}
