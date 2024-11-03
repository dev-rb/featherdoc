import { query, createAsync } from '@solidjs/router';
import { jwtDecode } from 'jwt-decode';
import Pocketbase from 'pocketbase';
import { createContext, createRenderEffect, FlowComponent, useContext } from 'solid-js';
import { getRequestEvent } from 'solid-js/web';
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
  const cookie = event?.response.headers.get('Set-Cookie');

  event?.locals.pb.authStore.loadFromCookie(cookie || '');

  if (!cookie || !event || !event.locals.pb.authStore.token) return;

  const decoded = jwtDecode(cookie) as PBPayload;

  return { token: event.locals.pb.authStore.token, payload: decoded };
}, 'session');

export const PocketbaseProvider: FlowComponent = (props) => {
  const sessionData = createAsync(() => cacheSession(), { deferStream: true });

  const pb = new Pocketbase('http://127.0.0.1:8090') as TypedPocketBase;

  createRenderEffect(() => {
    const data = sessionData();

    if (!data) return;

    pb.authStore.save(data.token);
  });

  return <PocketbaseContext.Provider value={pb}>{props.children}</PocketbaseContext.Provider>;
};
