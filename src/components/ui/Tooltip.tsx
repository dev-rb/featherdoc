import type { JSX, ParentComponent, ValidComponent } from 'solid-js';
import { splitProps, type Component } from 'solid-js';

import type { PolymorphicProps } from '@kobalte/core/polymorphic';
import * as TooltipPrimitive from '@kobalte/core/tooltip';

import { cn } from '~/lib/utils';

const TooltipTrigger = TooltipPrimitive.Trigger;

const Tooltip: Component<TooltipPrimitive.TooltipRootProps> = (props) => {
  return <TooltipPrimitive.Root gutter={4} {...props} />;
};

type TooltipContentProps<T extends ValidComponent = 'div'> = TooltipPrimitive.TooltipContentProps<T> & {
  class?: string | undefined;
};

const TooltipContent = <T extends ValidComponent = 'div'>(props: PolymorphicProps<T, TooltipContentProps<T>>) => {
  const [local, others] = splitProps(props as TooltipContentProps, ['class']);
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        class={cn(
          'z-50 origin-[var(--kb-popover-content-transform-origin)] overflow-hidden rounded-md border-secondary-foreground/10 border-1 bg-secondary px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
          local.class
        )}
        {...others}
      />
    </TooltipPrimitive.Portal>
  );
};

const SimpleTooltip: ParentComponent<{ content: string | JSX.Element }> = (props) => {
  return (
    <Tooltip>
      <TooltipTrigger class="inline-block" as="div">
        {props.children}
      </TooltipTrigger>
      <TooltipContent>{props.content}</TooltipContent>
    </Tooltip>
  );
};

export { Tooltip, TooltipTrigger, TooltipContent, SimpleTooltip };
