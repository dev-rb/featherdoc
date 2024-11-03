import { Accessor, createContext, FlowComponent, useContext } from 'solid-js';
import { cacheSession } from './pocketbase-context';
import { createAsync } from '@solidjs/router';

interface AppContextValues {
  session: Accessor<{ token: string | undefined; userId: string | undefined }>;
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
  const sessionData = createAsync(() => cacheSession(), { deferStream: true });

  return (
    <AppContext.Provider
      value={{ session: () => ({ token: sessionData.latest?.token, userId: sessionData.latest?.payload.id }) }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
