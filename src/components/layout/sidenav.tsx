import { A } from '@solidjs/router';
import { VoidComponent } from 'solid-js';
import { Button } from '../ui/Button';
import { ThemeToggle } from './theme-toggle';

export const SideNav = () => {
  return (
    <aside class="py-8 px-4 h-full bg-background">
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
      activeClass="bg-primary text-white dark:text-primary-foreground hover:(bg-primary text-primary-foreground)"
      inactiveClass="text-primary/50"
      end={props.end ?? true}
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
          <NavLink href="/threads" iconClass="i-lucide-message-square" end={false} />
        </li>
        <ul class="mt-auto flex flex-col gap-6">
          <li>
            <ThemeToggle />
          </li>
          <li>
            <NavLink href="/settings" iconClass="i-lucide-settings" />
          </li>
        </ul>
      </ul>
    </nav>
  );
};
