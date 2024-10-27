import { ThreadCard } from '~/components/threads/thread-card';

export default function Threads() {
  return (
    <main class="w-full h-full grid grid-cols-[1fr_2fr_1fr] overflow-hidden">
      <aside class="bg-muted min-w-md border-r-indigo border-r-1 py-4 px-2 flex flex-col gap-2 overflow-auto">
        <ThreadCard />
        <ThreadCard />
        <ThreadCard />
        <ThreadCard />
        <ThreadCard />
        <ThreadCard />
      </aside>
      <article class="bg-blue border-x-2 border-x-border"></article>
      {/* <div class="grid grid-cols-1 grid-rows-2 w-full h-full"> */}
      {/*   <div class="bg-background" /> */}
      {/*   <div class="bg-background" /> */}
      {/* </div> */}
    </main>
  );
}
