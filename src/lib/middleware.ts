import { RequestMiddleware, createMiddleware } from '@solidjs/start/middleware';
import Pocketbase from 'pocketbase';

const doStuff: RequestMiddleware = async (event) => {
  const pb = new Pocketbase('http://127.0.0.1:8090');
  event.locals.pb = pb;

  // load the store data from the request cookie string
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    event.locals.pb.authStore.isValid && (await event.locals.pb.collection('users').authRefresh());
  } catch (_) {
    // clear the auth store on failed refresh
    event.locals.pb.authStore.clear();
  }

  const cookie = event.locals.pb.authStore.exportToCookie();

  event.response.headers.set('Set-Cookie', cookie);
};

export default createMiddleware({
  onRequest: [doStuff],
  // onBeforeResponse: [doStuff]
});
