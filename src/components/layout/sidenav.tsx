import { A } from '@solidjs/router';
import { VoidComponent } from 'solid-js';
import { Button } from '../ui/Button';
import { ThemeToggle } from './theme-toggle';
import { cn } from '~/lib/utils';

interface SideNavProps {
  open: boolean;
  onClose: VoidFunction;
}

export const SideNav: VoidComponent<SideNavProps> = (props) => {
  return (
    <aside
      class={cn(
        'flex flex-col min-w-18 h-full bg-background border-r-1 border-r-secondary max-lg:(fixed z-1 top-0 left-0 -translate-x-full w-full) transition-transform',
        props.open && 'max-md:translate-x-0'
      )}
    >
      <div class="flex items-center w-full max-sm:pl-4">
        <Button variant="secondary" size="icon" class="rounded-full lg:hidden" onClick={props.onClose}>
          <i class="i-lucide-x inline-block" />
        </Button>
        <div class="py-8 px-8 lg:(w-full px-0) ml-auto bg-primary/20" />
      </div>
      <Navigation />
    </aside>
  );
};

interface NavLinkProps {
  label: string;
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
      class={
        'w-full rounded-none py-8 border-y border-y-secondary max-lg:(flex justify-start items-center gap-4 px-8 text-lg)'
      }
      activeClass="bg-primary text-white dark:text-primary-foreground hover:(bg-primary text-primary-foreground)"
      inactiveClass="text-secondary-foreground/40 bg-background"
      end={props.end ?? true}
    >
      <i class={`${props.iconClass} text-2xl`} />
      <span class="lg:hidden">{props.label}</span>
    </Button>
  );
};

const Navigation = () => {
  return (
    <nav class="w-full h-full">
      <ul class="w-full h-full flex flex-col items-center">
        <li class="w-full">
          <NavLink href="/" iconClass="i-lucide-home" label="Home" />
        </li>
        <li class="w-full">
          <NavLink href="/notebook" iconClass="i-lucide-notebook" label="Notebook" />
        </li>
        <li class="w-full">
          <NavLink href="/threads" iconClass="i-lucide-message-square" label="Threads" end={false} />
        </li>
        <ul class="w-full mt-auto flex flex-col">
          {/* <li class="w-full"> */}
          {/*   <ThemeToggle /> */}
          {/* </li> */}
          <li class="w-full">
            <NavLink href="/settings" iconClass="i-lucide-settings" label="Settings" />
          </li>
        </ul>
      </ul>
    </nav>
  );
};
