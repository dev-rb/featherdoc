import '@unocss/reset/tailwind.css';
import 'virtual:uno.css';
import './app.css';

import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import { Suspense } from 'solid-js';
import { PocketbaseProvider } from './components/pocketbase-context';

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
        <PocketbaseProvider>
          <Suspense>
            {props.children}
          </Suspense>
        </PocketbaseProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
