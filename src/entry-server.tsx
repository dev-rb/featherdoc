// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server';
import { getAppTheme } from './lib/theme';

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" data-theme={getAppTheme()}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
          <script type="module" src="/init-sw.js"></script>
        </body>
      </html>
    )}
  />
));
