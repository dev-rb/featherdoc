import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './app.css';

import { MetaProvider, Meta, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { PocketbaseProvider } from './components/pocketbase-context';
import { AppContextProvider } from './components/app-context';
import { Toaster } from './components/ui/Toast';

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      form: boolean;
    }
  }
}

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Feather Doc</Title>
          <Toaster />
          <PocketbaseProvider>
            <AppContextProvider>
              <Suspense>{props.children}</Suspense>
            </AppContextProvider>
          </PocketbaseProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
