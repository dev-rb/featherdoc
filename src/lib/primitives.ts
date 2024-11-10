import { Accessor, createEffect, createMemo, createSignal, onCleanup, onMount } from 'solid-js';
import { isServer } from 'solid-js/web';

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

  let observer: MutationObserver | undefined;
  createEffect(() => {
    const ref = el();

    if (!ref || init) return;

    init = true;

    observer = new MutationObserver(onMutate);

    observer.observe(ref, { childList: true });
  });

  onCleanup(() => {
    observer?.disconnect();
  });
};

export const createOnlineStatus = () => {
  const initialOnline = () => {
    if (isServer) return true;

    return navigator.onLine;
  };

  const [isOnline, setOnline] = createSignal(initialOnline());

  const online = () => setOnline(true);
  const offline = () => setOnline(false);

  onMount(() => {
    window.addEventListener('online', online);
    window.addEventListener('offiline', offline);

    onCleanup(() => {
      window.removeEventListener('online', online);
      window.removeEventListener('offiline', offline);
    });
  });

  return isOnline;
};

interface ClickOutsideOptions {
  ref: () => HTMLElement | null | undefined;
  callbackFn: (event: PointerEvent) => void;
  ignore?: Accessor<(string | (HTMLElement | undefined))[]>;
}

export const makeClickOutside = (props: ClickOutsideOptions) => {
  onMount(() => {
    const listener = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const shouldIgnore =
        !document.body.contains(target) ||
        (props.ignore !== undefined &&
          props.ignore().some((s) => {
            if (!s) return;
            if (s instanceof HTMLElement) {
              return target.isSameNode(s);
            }

            return target.className.toString().includes(s);
          }));
      const shouldTrigger = props.ref() !== undefined && !props.ref()!.contains(target);
      shouldTrigger && !shouldIgnore && props.callbackFn(event);
    };

    document.addEventListener('pointerdown', listener);
    onCleanup(() => {
      document.removeEventListener('pointerdown', listener);
    });
  });
};
