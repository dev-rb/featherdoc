export default function Home() {
  return (
    <div class="bg-gray-900 w-screen h-screen">
      <div class="w-full h-full grid grid-cols-[auto_1fr] grid-rows-1">
        <aside class="p-8 h-full border-r-2 border-r-gray-800">
          <ul class="w-full flex flex-col gap-6">
            <li class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:(bg-gray-800 text-gray-200)">
              <button class="i-lucide-home text-2xl" />
            </li>
            <li class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:(bg-gray-800 text-gray-200)">
              <button class="i-lucide-notebook text-2xl" />
            </li>
            <li class="flex items-center justify-center p-2 rounded-lg text-slate-400 hover:(bg-gray-800 text-gray-200)">
              <button class="i-lucide-message-square text-2xl" />
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
