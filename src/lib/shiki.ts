import { BundledLanguage, BundledTheme, createHighlighter, getSingletonHighlighter, HighlighterGeneric } from 'shiki';
import { assertDefined } from './utils/log';
import { getRequestEvent, isServer } from 'solid-js/web';

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | undefined = undefined;

export const getHighlighter = () => {
  const event = getRequestEvent();
  const _highlighter = highlighter || event?.locals.highlighter;
  assertDefined(_highlighter, 'Expected highlighter to be defined');
  return _highlighter;
};

export const initializeShikiHighlighter = async (
  themes: BundledTheme[] = ['everforest-dark'],
  langs: BundledLanguage[] = ['javascript', 'typescript', 'css', 'jsx', 'tsx', 'html']
) => {
  const event = getRequestEvent();
  if (highlighter || event?.locals.highlighter) return highlighter || event?.locals.highlighter;

  const _highlighter = await createHighlighter({
    themes,
    langs,
  });

  if (isServer) {
    if (event) {
      event.locals.highlighter = _highlighter;
    }
  }

  highlighter = _highlighter;

  return highlighter;
};
