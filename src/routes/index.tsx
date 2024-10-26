import { A } from '@solidjs/router';

export default function Home() {
  return (
    <div class="bg-gray-900 w-screen h-screen">
      <div class="w-full h-full grid grid-cols-[auto_1fr] grid-rows-1">
        <aside class="py-8 px-4 h-full border-r-2 border-r-gray-800">
          <ul class="w-full h-full flex flex-col items-center gap-6">
            <li>
              <A
                class="flex items-center justify-center p-2 rounded-lg text-slate-400"
                href="/"
                activeClass="bg-gray-700 text-white"
                inactiveClass="hover:(bg-gray-800 text-gray-200)"
              >
                <i class="i-lucide-home text-2xl" />
              </A>
            </li>
            <li>
              <A
                class="flex items-center justify-center p-2 rounded-lg text-slate-400"
                href="/notebook"
                activeClass="bg-gray-700 text-white"
                inactiveClass="hover:(bg-gray-800 text-gray-200)"
              >
                <i class="i-lucide-notebook text-2xl" />
              </A>
            </li>
            <li>
              <A
                class="flex items-center justify-center p-2 rounded-lg text-slate-400"
                href="/threads"
                activeClass="bg-gray-700 text-white"
                inactiveClass="hover:(bg-gray-800 text-gray-200)"
              >
                <i class="i-lucide-message-square text-2xl" />
              </A>
            </li>
            <li class="mt-auto">
              <A
                class="flex items-center justify-center p-2 rounded-lg text-slate-400"
                href="/settings"
                activeClass="bg-gray-700 text-white"
                inactiveClass="hover:(bg-gray-800 text-gray-200)"
              >
                <i class="i-lucide-settings text-2xl" />
              </A>
            </li>
          </ul>
        </aside>
        <main class="w-full h-full grid grid-cols-[auto_2fr_1fr]">
          <aside class="bg-gray-700 min-w-md"></aside>
          <article class="bg-gray-600"></article>
          <div class="bg-gray-400 grid grid-cols-1 grid-rows-2 w-full h-full">
            <div class="bg-gray-800" />
            <div class="bg-slate-900" />
          </div>
        </main>
      </div>
    </div>
  );
}
