import { query, createAsync, revalidate } from '@solidjs/router';
import { jwtDecode } from 'jwt-decode';
import Pocketbase from 'pocketbase';
import { createContext, createRenderEffect, FlowComponent, useContext } from 'solid-js';
import { getRequestEvent, isServer } from 'solid-js/web';
import { API_URL } from '~/lib/constants';
import { TypedPocketBase } from '~/types/pocketbase-gen';

const PocketbaseContext = createContext<TypedPocketBase>();

export type PBPayload = {
  id: string;
  exp: number;
};

export const usePocketbase = () => {
  const pb = useContext(PocketbaseContext);

  if (!pb) {
    throw new Error('[usePocketbase] can only be used under a PocketbaseProvider');
  }

  return pb;
};

export const cacheSession = query(async () => {
  'use server';
  const event = getRequestEvent();
  const cookie = event?.request.headers.get('cookie');

  const pb = event?.locals.pb || new Pocketbase(API_URL);
  pb?.authStore.loadFromCookie(cookie || '');

  if (!cookie) return;

  if (!event?.locals.pb.authStore.isValid) return;

  try {
    const decoded = jwtDecode(event.locals.pb.authStore.token) as PBPayload;

    return { token: event.locals.pb.authStore.token, payload: decoded };
  } catch (e) {
    throw e;
  }
}, 'session');

export const PocketbaseProvider: FlowComponent = (props) => {
  const sessionData = createAsync(() => cacheSession(), { deferStream: true });

  let pb = new Pocketbase(API_URL) as TypedPocketBase;

  createRenderEffect(() => {
    const data = sessionData();

    if (isServer) {
      const event = getRequestEvent();
      if (event && event.locals.pb) {
        pb = event.locals.pb;
      }
    }

    if (!data) return;

    pb.authStore.save(data.token);
  });

  return <PocketbaseContext.Provider value={pb}>{props.children}</PocketbaseContext.Provider>;
};
