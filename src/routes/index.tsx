import { A } from '@solidjs/router';
import { VoidComponent } from 'solid-js';
import { Button } from '~/components/ui/Button';

interface NavLinkProps {
  href: string;
  iconClass: string;
}

const NavLink: VoidComponent<NavLinkProps> = (props) => {
  return (
    <Button
      as={A}
      variant="ghost"
      size="icon"
      href={props.href}
      activeClass="bg-primary text-white hover:(bg-primary text-primary-foreground)"
      inactiveClass="text-primary/50"
    >
      <i class={`${props.iconClass} text-2xl`} />
    </Button>
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
        <ul class="mt-auto">
          <li>
            <Button variant="ghost" size="icon" class="text-2xl">
              <i class="i-lucide-sun dark:i-lucide-moon" />
            </Button>
          </li>
          <li>
            <NavLink href="/settings" iconClass="i-lucide-settings" />
          </li>
        </ul>
      </ul>
    </nav>
  );
};

export default function Home() {
  return (
    <div class="bg-background w-screen h-screen">
      <div class="w-full h-full grid grid-cols-[auto_1fr] grid-rows-1">
        <aside class="py-8 px-4 h-full border-r-2 border-r-border bg-background">
          <Navigation />
        </aside>
        <main class="w-full h-full grid grid-cols-[auto_2fr_1fr]">
          <aside class="bg-muted min-w-md"></aside>
          <article class="bg-muted border-x-2 border-x-border"></article>
          <div class="grid grid-cols-1 grid-rows-2 w-full h-full">
            <div class="bg-background" />
            <div class="bg-background" />
          </div>
        </main>
      </div>
    </div>
  );
}
