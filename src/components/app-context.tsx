import { Accessor, createContext, createRenderEffect, FlowComponent, onMount, useContext } from 'solid-js';
import { cacheSession, usePocketbase } from './pocketbase-context';
import { createAsync } from '@solidjs/router';
import { initializeShikiHighlighter } from '~/lib/shiki';

interface AppContextValues {
  session: Accessor<{ token: string | undefined; userId: string | undefined }>;
  authed: () => boolean;
}

const AppContext = createContext<AppContextValues>();

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('[useApp] can only be used under a AppContextProvider');
  }
  return context;
};

export const AppContextProvider: FlowComponent = (props) => {
  const pb = usePocketbase();
  const sessionData = createAsync(() => cacheSession(), { deferStream: true });

  const authed = () => {
    return Boolean(sessionData.latest && pb.authStore.token && pb.authStore.isValid);
  };

  createRenderEffect(async () => {
    await initializeShikiHighlighter();
  });

  return (
    <AppContext.Provider
      value={{ session: () => ({ token: sessionData.latest?.token, userId: sessionData.latest?.payload.id }), authed }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
