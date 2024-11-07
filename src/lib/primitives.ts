import { Accessor, createEffect, createMemo, onCleanup, onMount } from 'solid-js';

export const createScrollBottom = (element: Accessor<HTMLElement | undefined>) => {
  const scrollBottom = () => {
    const el = element();

    if (!el) return;

    el.scrollTop = el.scrollHeight;
  };

  onMount(() => {
    scrollBottom();
  });

  let init = false;

  const el = createMemo((prev: HTMLElement | undefined) => {
    const _element = element();

    if (prev && !_element) {
      init = false;
    }

    return _element;
  }, undefined);

  const onMutate: MutationCallback = () => {
    scrollBottom();
  };

  let observer: MutationObserver;
  createEffect(() => {
    const ref = el();

    if (!ref || init) return;

    init = true;

    observer = new MutationObserver(onMutate);

    observer.observe(ref, { childList: true });
  });

  onCleanup(() => {
    observer.disconnect();
  });
};
