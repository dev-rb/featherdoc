import { JSX, createEffect, createSignal, on, onMount, splitProps } from 'solid-js';
import { StarterKit } from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import ListKeymap from '@tiptap/extension-list-keymap';
import ImageExtension from '@tiptap/extension-image';
import { CustomHorizontalRule } from './horizontal-rule';
import { makeClickOutside } from '~/lib/primitives';
import './editor.css';
import { showToast } from '../Toast';
import { Fragment } from '@tiptap/pm/model';

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

interface RichEditorProps extends Omit<DivProps, 'onInput'> {
  onInput?: (text: string) => void;
  contents?: string;
  initialContent?: string;
  wrapperClass?: string;
  editable?: boolean;
  onClickOutside?: () => void;
  onDropImage: (image: File) => Promise<string>;
  onImageDeleted: (imageSrc: string) => Promise<void>;
}
export const RichEditor = (props: RichEditorProps) => {
  const [self, other] = splitProps(props, [
    'onClickOutside',
    'editable',
    'wrapperClass',
    'class',
    'ref',
    'onInput',
    'contents',
  ]);

  const [wrapperRef, setWrapperRef] = createSignal<HTMLDivElement>();
  const [editorRef, setEditorRef] = createSignal<HTMLElement>();

  const save = () => {
    const editorR = editorRef();
    if (!editorR) return;

    const state = editor?.getHTML();
    props.onInput?.(state ?? '');
  };

  let editor: Editor | undefined;

  makeClickOutside({
    ref: editorRef,
    callbackFn: () => {
      self.onClickOutside?.();
      setTimeout(() => (editor?.isFocused ? editor.commands.blur() : undefined), 0);
    },
    ignore: () => [wrapperRef()],
  });

  createEffect(
    on(
      () => self.editable,
      (editable) => {
        if (editable !== undefined) {
          editor?.setOptions({ editable });
          const ref = editorRef();

          if (ref) {
            editable && ref.style.removeProperty('pointer-events');
            !editable && ref.style.setProperty('pointer-events', 'none');
          }
        }
      }
    )
  );

  createEffect(
    on(
      () => self.contents,
      (content) => {
        if (!content) return;

        if (editor && !self.editable) {
          editor.commands.setContent(content);
        }
      }
    )
  );

  onMount(() => {
    const input = wrapperRef();
    if (!input) return;

    editor = new Editor({
      editable: self.editable ?? true,
      element: input,
      extensions: [
        StarterKit.configure({
          bulletList: {
            HTMLAttributes: {
              class: 'ps-30px',
            },
          },
          heading: {
            HTMLAttributes: {},
          },
          horizontalRule: false,
          dropcursor: {
            class: 'text-muted-foreground',
          },
        }),
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder({ node, editor }) {
            if (node.type.name === 'paragraph' && !editor.isEmpty) {
              return 'Type...';
            }

            if (node.type.name === 'heading') {
              const level = node.attrs.level;

              return `${'#'.repeat(level)} Heading ${level}`;
            }
            return 'Make a note...';
          },
          emptyEditorClass:
            'first:before:(content-[attr(data-placeholder)] mix-blend-difference absolute text-muted-foreground/50 top-0 left-0)',
          emptyNodeClass:
            'before:(content-[attr(data-placeholder)] mix-blend-difference absolute text-muted-foreground/50)',
        }),
        ListKeymap,
        CustomHorizontalRule,
        ImageExtension,
      ],
      content: props.initialContent,
      editorProps: {
        attributes: {
          class: self.class ?? '',
        },
        handleDrop: (view, event, slice, moved) => {
          if (!moved && event.dataTransfer && event.dataTransfer.files) {
            if (event.dataTransfer.files.length === 0) return false;
            if (event.dataTransfer.files.length > 1) {
              showToast({ title: 'Can only drag in 1 file at a time', variant: 'error' });
              return true;
            }
            const file = event.dataTransfer.files[0];
            const fileSize = Math.trunc(file.size / 1024 / 1024);

            if (fileSize > 5) {
              showToast({
                title: `File too large: ${file.name}`,
                description: 'Files can not be larger than 5mb',
                variant: 'error',
              });
              return true;
            }

            if (!file.type.includes('image')) {
              return false;
            }

            props.onDropImage(file).then((src) => {
              const img = new Image();
              img.src = src;
              img.addEventListener(
                'load',
                function () {
                  const { schema } = view.state;
                  const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                  if (!coordinates) return;
                  const node = schema.nodes.image.create({ src: img.src });
                  const placeholder = schema.nodes.paragraph.create({ innerText: '' });
                  const transaction = view.state.tr.insert(coordinates.pos, [node, placeholder]);

                  return view.dispatch(transaction);
                },
                { once: true }
              );
            });

            return true;
          }

          return false;
        },
      },
      async onUpdate({ editor, transaction }) {
        this.editable = editor.isEditable;

        const getImageSrcs = (fragment: Fragment) => {
          const srcs = new Set<string>();
          fragment.forEach((node) => {
            if (node.type.name === 'image') {
              srcs.add(node.attrs.src);
            }
          });
          return srcs;
        };

        let currentSrcs = getImageSrcs(transaction.doc.content);
        let previousSrcs = getImageSrcs(transaction.before.content);

        if (currentSrcs.size === 0 && previousSrcs.size === 0) {
          save();
          return;
        }

        let deletedImageSrcs = [...previousSrcs].filter((src) => !currentSrcs.has(src));

        if (deletedImageSrcs.length > 0) {
          let promises = [];

          for (const src of deletedImageSrcs) {
            promises.push(props.onImageDeleted(src));
          }

          await Promise.all(promises);
        }
        save();
      },
    });

    const editorElement = input.querySelector('.tiptap') as HTMLElement;

    setEditorRef(editorElement);
  });

  const setRef = (el: HTMLDivElement) => {
    const propRef = self.ref;

    if (typeof propRef === 'function') {
      propRef?.(el);
    } else {
      self.ref = el;
    }

    setWrapperRef(el);
  };

  return <div ref={setRef} class={self.wrapperClass ?? 'h-full w-full flex-1 flex my-2'} {...other} />;
};
