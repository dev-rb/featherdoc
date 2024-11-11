import { RouteSectionProps } from '@solidjs/router';
import { createSignal } from 'solid-js';
import { SideNav } from '~/components/layout/sidenav';
import { Button } from '~/components/ui/Button';
import { ToggleButton } from '~/components/ui/ToggleButton';

export default function Layout(props: RouteSectionProps) {
  const [sidenavOpen, setSidenavOpen] = createSignal(false);
  return (
    <div class="bg-background w-screen h-screen">
      <div class="w-full h-full grid grid-cols-1 lg:grid-cols-[auto_1fr] grid-rows-[auto_1fr] lg:grid-rows-1">
        <div class="w-full flex lg:hidden py-2 bg-muted">
          <ToggleButton size="icon" class="text-white text-xl" pressed={sidenavOpen()} onChange={setSidenavOpen}>
            <i class="i-lucide-menu inline-block" />
          </ToggleButton>
        </div>
        <SideNav open={sidenavOpen()} onClose={() => setSidenavOpen(false)} />
        {props.children}
      </div>
    </div>
  );
}
