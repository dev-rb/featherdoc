import { A } from '@solidjs/router';
import { VoidComponent } from 'solid-js';
import { Button } from '../ui/Button';
import { ThemeToggle } from './theme-toggle';

export const SideNav = () => {
  return (
    <aside class="flex flex-col min-w-18 h-full bg-background border-r-1 border-r-secondary">
      <div class="py-8 w-full bg-primary/20" />
      <Navigation />
    </aside>
  );
};

interface NavLinkProps {
  href: string;
  iconClass: string;
  end?: boolean;
}

const NavLink: VoidComponent<NavLinkProps> = (props) => {
  return (
    <Button
      as={A}
      variant="ghost"
      size="icon"
      href={props.href}
      class="w-full rounded-none py-8 border-y border-y-secondary"
      activeClass="bg-primary text-white dark:text-primary-foreground hover:(bg-primary text-primary-foreground)"
      inactiveClass="text-secondary-foreground/40"
      end={props.end ?? true}
    >
      <i class={`${props.iconClass} text-2xl`} />
    </Button>
  );
};

const Navigation = () => {
  return (
    <nav class="w-full h-full">
      <ul class="w-full h-full flex flex-col items-center">
        <li class="w-full">
          <NavLink href="/" iconClass="i-lucide-home" />
        </li>
        <li class="w-full">
          <NavLink href="/notebook" iconClass="i-lucide-notebook" />
        </li>
        <li class="w-full">
          <NavLink href="/threads" iconClass="i-lucide-message-square" end={false} />
        </li>
        <ul class="w-full mt-auto flex flex-col">
          <li class="w-full">
            <ThemeToggle />
          </li>
          <li class="w-full">
            <NavLink href="/settings" iconClass="i-lucide-settings" />
          </li>
        </ul>
      </ul>
    </nav>
  );
};
