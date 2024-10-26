import { A } from '@solidjs/router';
import { VoidComponent } from 'solid-js';

interface NavLinkProps {
  href: string;
  iconClass: string;
}

const NavLink: VoidComponent<NavLinkProps> = (props) => {
  return (
    <A
      class="flex items-center justify-center p-2 rounded-lg text-slate-400"
      href={props.href}
      activeClass="bg-gray-700 text-white"
      inactiveClass="hover:(bg-gray-800 text-gray-200)"
    >
      <i class={`${props.iconClass} text-2xl`} />
    </A>
  );
};

const Navigation = () => {
  return (
    <nav class="w-full h-full">
      <ul class="w-full h-full flex flex-col items-center gap-6">
        <li>
          <NavLink href="/" iconClass="i-lucide-home" />
        </li>
        <li>
          <NavLink href="/notebook" iconClass="i-lucide-notebook" />
        </li>
        <li>
          <NavLink href="/threads" iconClass="i-lucide-message-square" />
        </li>
        <li class="mt-auto">
          <NavLink href="/settings" iconClass="i-lucide-settings" />
        </li>
      </ul>
    </nav>
  );
};

export default function Home() {
  return (
    <div class="bg-gray-900 w-screen h-screen">
      <div class="w-full h-full grid grid-cols-[auto_1fr] grid-rows-1">
        <aside class="py-8 px-4 h-full border-r-2 border-r-gray-800 bg-gray-900">
          <Navigation />
        </aside>
        <main class="w-full h-full grid grid-cols-[auto_2fr_1fr]">
          <aside class="bg-gray-800 min-w-md"></aside>
          <article class="bg-gray-800 border-x-2 border-x-gray-700"></article>
          <div class="bg-gray-400 grid grid-cols-1 grid-rows-2 w-full h-full">
            <div class="bg-gray-800" />
            <div class="bg-slate-900" />
          </div>
        </main>
      </div>
    </div>
  );
}
