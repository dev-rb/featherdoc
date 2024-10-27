import { Polymorphic, PolymorphicProps } from '@kobalte/core';
import type { Component, ComponentProps, ValidComponent } from 'solid-js';
import { splitProps } from 'solid-js';

import { cn } from '~/lib/utils';

interface CardProps {
  class?: string | undefined;
}
const Card = <T extends ValidComponent = 'div'>(props: PolymorphicProps<T, CardProps>) => {
  const [local, others] = splitProps(props, ['class']);
  return (
    <Polymorphic
      as="div"
      class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', local.class)}
      {...others}
    />
  );
};

const CardHeader: Component<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={cn('flex flex-col gap-1.5 p-4', local.class)} {...others} />;
};

const CardTitle: Component<ComponentProps<'h3'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <h3 class={cn('text-lg font-semibold leading-none tracking-tight', local.class)} {...others} />;
};

const CardDescription: Component<ComponentProps<'p'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <p class={cn('text-sm text-muted-foreground', local.class)} {...others} />;
};

const CardContent: Component<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={cn('p-4 pt-0', local.class)} {...others} />;
};

const CardFooter: Component<ComponentProps<'div'>> = (props) => {
  const [local, others] = splitProps(props, ['class']);
  return <div class={cn('flex items-center p-4 pt-0', local.class)} {...others} />;
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
