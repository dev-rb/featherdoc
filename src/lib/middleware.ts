import { redirect, reload, revalidate } from '@solidjs/router';
import { RequestMiddleware, createMiddleware } from '@solidjs/start/middleware';
import Pocketbase from 'pocketbase';

const doStuff: RequestMiddleware = async (event) => {
  const pb = new Pocketbase('http://127.0.0.1:8090');
  event.locals.pb = pb;

  // load the store data from the request cookie string
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  let response = event.response;
  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    event.locals.pb.authStore.isValid && (await event.locals.pb.collection('users').authRefresh());
    // response = reload({ revalidate: 'session' });
  } catch (_) {
    console.log('Clear store');
    // clear the auth store on failed refresh
    event.locals.pb.authStore.clear();
  }

  const cookie = event.locals.pb.authStore.exportToCookie();

  console.log('middleware', event.locals.pb.authStore.isValid, cookie);
  event.response.headers.set('Set-Cookie', cookie);

  if (event.locals.pb.authStore.isValid) {
    // return reload({ revalidate: 'session' });
  }
};

export default createMiddleware({
  // onRequest: [doStuff],
});
