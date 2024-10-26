import { RouteSectionProps } from '@solidjs/router';
import { SideNav } from '~/components/layout/sidenav';

export default function Layout(props: RouteSectionProps) {
  return (
    <div class="bg-background w-screen h-screen">
      <div class="w-full h-full grid grid-cols-[auto_1fr] grid-rows-1">
        <SideNav />
        {props.children}
      </div>
    </div>
  );
}
