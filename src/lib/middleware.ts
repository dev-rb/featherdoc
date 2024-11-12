import { redirect } from '@solidjs/router';
import { RequestMiddleware, createMiddleware } from '@solidjs/start/middleware';
import Pocketbase from 'pocketbase';
import { API_URL } from './constants';

const doStuff: RequestMiddleware = async (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === '/_server' || url.pathname === '/service_worker.js') return;

  const pb = new Pocketbase(API_URL);
  event.locals.pb = pb;

  // load the store data from the request cookie string
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  if (!event.locals.pb.authStore.isValid) {
    if (url.pathname !== '/') {
      return redirect('/');
    }
  }

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    event.locals.pb.authStore.isValid && (await event.locals.pb.collection('users').authRefresh());
    // response = reload({ revalidate: 'session' });
  } catch (_) {
    // clear the auth store on failed refresh
    event.locals.pb.authStore.clear();
  }
};

export default createMiddleware({
  onRequest: [doStuff],
});
