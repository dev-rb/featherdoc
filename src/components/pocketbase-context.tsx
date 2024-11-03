import { query, createAsync, action, useAction, reload } from '@solidjs/router';
import Pocketbase from 'pocketbase';
import { createContext, createRenderEffect, FlowComponent, onCleanup, onMount, useContext } from "solid-js"
import { getRequestEvent } from 'solid-js/web';
import { setCookie } from 'vinxi/server';
import { AppSession, getAppSession, updateSession } from '~/lib/session';
import { TypedPocketBase } from "~/types/pocketbase-gen"

const PocketbaseContext = createContext<TypedPocketBase>()

export const usePocketbase = () => {
  const pb = useContext(PocketbaseContext)

  if (!pb) {
    throw new Error("[usePocketbase] can only be used under a PocketbaseProvider")
  }

  return pb
}

const setServerCookie = (name: string, value: string) => {
  'use server';

  setCookie(name, value);
};

const cacheSession = query(async () => {
  'use server'

  const event = getRequestEvent()

  console.log("Cache session", event?.request.headers.get('set-cookie'))

  const session = await getAppSession()

  if (!session || Object.keys(session).length === 0) return

  return session.data

}, 'session')


export const PocketbaseProvider: FlowComponent = (props) => {

  const sessionData = createAsync(() => cacheSession(), { deferStream: true })

  const pb = new Pocketbase('http://127.0.0.1:8090') as TypedPocketBase;

  createRenderEffect(() => {

    const sessionInfo = sessionData()

    if (!sessionInfo || !sessionInfo.token) return
    console.log("Do set with token data", sessionInfo)

    setServerCookie('Set-Cookie', sessionInfo.token)
    // pb.authStore.save(sessionInfo.token)

  })


  const updateSessionAction = action(async (data: Partial<AppSession>) => {
    await updateSession(data)
  })
  const updateSessionFn = useAction(updateSessionAction)


  onMount(() => {


    const unsub = pb.authStore.onChange((token) => {
      console.log("Change", token)
      updateSessionFn({ token })
      setServerCookie('Set-Cookie', token)

    }, true);

    onCleanup(() => {
      unsub()
    })
  })


  return (
    <PocketbaseContext.Provider value={pb}>
      {props.children}
    </PocketbaseContext.Provider>
  )

}

