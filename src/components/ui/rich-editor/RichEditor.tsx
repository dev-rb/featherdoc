import { JSX, createEffect, createSignal, on, onMount, splitProps } from 'solid-js';
import { StarterKit } from '@tiptap/starter-kit';
import { Editor } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import ListKeymap from '@tiptap/extension-list-keymap';
import { CustomHorizontalRule } from './horizontal-rule';
import { makeClickOutside } from '~/lib/primitives';
import './editor.css';

type DivProps = JSX.HTMLAttributes<HTMLDivElement>;

interface RichEditorProps extends Omit<DivProps, 'onInput'> {
  onInput?: (text: string) => void;
  contents?: string;
  setClearFn?: (fn: (() => void) | undefined) => void;
  wrapperClass?: string;
  editable?: boolean;
  onClickOutside?: () => void;
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

  const inputId = () => props.id ?? 'note-input';

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
            HTMLAttributes: {
              class: 'my-2',
            },
          },
          horizontalRule: false,
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
            'first:before:(content-[attr(data-placeholder)] mix-blend-difference absolute text-neutral-200 top-0 left-0)',
          emptyNodeClass: 'before:(content-[attr(data-placeholder)] mix-blend-difference absolute text-neutral-200)',
        }),
        ListKeymap,
        CustomHorizontalRule,
      ],
      content: props.contents,
      editorProps: {
        attributes: {
          class: self.class ?? '',
        },
      },
      onUpdate(props) {
        this.editable = props.editor.isEditable;
        save();
      },
    });

    const editorElement = input.querySelector('.tiptap') as HTMLElement;

    setEditorRef(editorElement);

    props.setClearFn?.(() => editor?.commands.clearContent());
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

  return <div ref={setRef} id={inputId()} class={self.wrapperClass ?? 'h-full w-full flex-1 flex my-2'} {...other} />;
};
