// Taken and modified from:
// https://github.com/timomeh/tiptap-extension-code-block-shiki/

import { BundledLanguage, BundledTheme } from 'shiki';
import { findChildren } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node as ProsemirrorNode } from '@tiptap/pm/model';
import { CodeBlock } from '@tiptap/extension-code-block';
import { getHighlighter } from '~/lib/shiki';

function getDecorations({ doc, name }: { doc: ProsemirrorNode; name: string }) {
  const decorations: Decoration[] = [];

  const codeBlocks = findChildren(doc, (node) => node.type.name === name);

  codeBlocks.forEach((block) => {
    const language = block.node.attrs.language || 'plaintext';

    const highlighter = getHighlighter();

    if (!highlighter) return;

    const themeToApply = highlighter.getLoadedThemes()[0];

    const tokens = highlighter.codeToTokensBase(block.node.textContent, {
      lang: language,
      theme: themeToApply,
    });

    let from = block.pos + 1;

    for (const line of tokens) {
      for (const token of line) {
        const to = from + token.content.length;

        const decoration = Decoration.inline(from, to, {
          style: `color: ${token.color}`,
        });

        decorations.push(decoration);

        from = to;
      }

      from += 1;
    }
  });

  return DecorationSet.create(doc, decorations);
}

export function ShikiPlugin({ name }: { name: string }) {
  const shikiPlugin: Plugin<any> = new Plugin({
    key: new PluginKey('shiki'),

    state: {
      init: (_, { doc }) => {
        return getDecorations({
          doc,
          name,
        });
      },
      apply: (transaction, value, prevState, newState) => {
        const prevName = prevState.selection.$head.parent.type.name;
        const newName = newState.selection.$head.parent.type.name;

        const prevNodes = findChildren(prevState.doc, (node) => node.type.name === name);
        const newNodes = findChildren(newState.doc, (node) => node.type.name === name);

        const codeBlockChanged =
          transaction.docChanged && ([prevName, newName].includes(name) || newNodes.length !== prevNodes.length);

        if (!codeBlockChanged) {
          return value.map(transaction.mapping, transaction.doc);
        }

        return getDecorations({
          doc: transaction.doc,
          name,
        });
      },
    },

    props: {
      decorations(state) {
        return shikiPlugin.getState(state);
      },
    },
  });

  return shikiPlugin;
}

export const CodeBlockShiki = CodeBlock.extend({
  addOptions() {
    return {
      ...this.parent?.(),
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
      }),
    ];
  },
});
