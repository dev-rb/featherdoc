import { ListResult, RecordOptions, RecordService, RecordSubscription, SendOptions } from 'pocketbase';
import {
  Accessor,
  createMemo,
  createResource,
  createSignal,
  InitializedResource,
  onCleanup,
  onMount,
  ResourceOptions,
  ResourceReturn,
  Setter,
} from 'solid-js';
import { usePocketbase } from '~/components/pocketbase-context';
import { CollectionRecords, CollectionResponses, TypedPocketBase } from '~/types/pocketbase-gen';
import { getRequestEvent, isServer } from 'solid-js/web';
import { createStore, produce, reconcile, SetStoreFunction } from 'solid-js/store';
import { createAsync, query, revalidate } from '@solidjs/router';

// Modified from the amazing Tanstack Query library (MIT)
// https://github.com/TanStack/query/blob/main/packages/query-core/src/utils.ts#L168
function isPlainObject(obj: object) {
  let proto;
  return (
    obj != null && typeof obj === 'object' && (!(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype)
  );
}

export function hashKey<T extends Array<any>>(args: T): string {
  return JSON.stringify(args, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key];
            return result;
          }, {} as any)
      : val
  );
}

//// END

type QueryMethods = keyof Pick<RecordService, 'getList' | 'getOne' | 'getFirstListItem'>;

type MutationMethods = keyof Pick<RecordService, 'create' | 'update' | 'delete'>;

type AccessorEligible = 'getList' | 'getOne' | 'getFirstListItem';

type QueryNames = keyof CollectionRecords;

type GetParams<Name extends QueryNames, Method extends QueryMethods | MutationMethods> = Method extends 'create'
  ? [values: CollectionRecords[Name], options?: RecordOptions]
  : Method extends 'update'
    ? [id: string, values: Partial<CollectionRecords[Name]>, options?: RecordOptions]
    : Name extends keyof CollectionResponses
      ? Parameters<RecordService<CollectionRecords[Name]>[Method]>
      : never;

type ToAccessors<T> = { [K in keyof T]: Accessor<T[K]> };

type QueryOptions = Pick<ResourceOptions<unknown>, 'initialValue' | 'deferStream'> & { enabled?: Accessor<boolean> };

type NarrowReturnType<T> = T extends Promise<infer A> ? A : T extends Promise<ListResult<infer B>> ? B : T;

type CorrectValue<A, B> = A extends ListResult<any> ? ListResult<B> : A extends any[] ? B[] : B;

type QueryReturn<Name extends QueryNames, Method extends QueryMethods> = {
  data: InitializedResource<
    Awaited<CorrectValue<NarrowReturnType<ReturnType<RecordService[Method]>>, CollectionResponses[Name]>>
  >;
  isLoading: Accessor<boolean>;
  isRefreshing: Accessor<boolean>;
  isFetching: Accessor<boolean>;
};

const isQueryOptionsParam = (param: unknown): param is QueryOptions => {
  if (!param || typeof param !== 'object') return false;

  return 'deferStream' in param || 'initialValue' in param || 'enabled' in param;
};

const caches = new Map<string, any>();

function createQuery<
  Expand = unknown,
  Name extends QueryNames = QueryNames,
  Method extends QueryMethods = QueryMethods,
>(
  name: Name,
  method: Method,
  params: (w: ParamsHelper<Name, Method>) => GetParams<Name, Method>,
  queryOptions?: QueryOptions
) {
  const pb = usePocketbase();
  const resolvedParams = createMemo(() => {
    const list = params(getParamsHelper);

    return list;
  });

  const [state, setState] = createSignal<'loading' | 'unresolved' | 'resolved' | 'refetching'>('unresolved');

  const cacheKey = `${name}/${method}/${hashKey(resolvedParams())}`;

  const existing = caches.get(cacheKey);

  const cache =
    existing ??
    query(async (p: GetParams<Name, Method>) => {
      const event = getRequestEvent();

      const _pb = (isServer ? (event ? event?.locals.pb : pb) : pb) as TypedPocketBase;
      const result = (await _pb
        .collection<CollectionRecords[Name]>(name)
        // @ts-expect-error no clue how to type this
        [method]<CollectionResponses<Expand>[Name]>(...p)) as Awaited<
        CorrectValue<NarrowReturnType<ReturnType<RecordService[Method]>>, CollectionResponses<Expand>[Name]>
      >;
      return result;
    }, `${name}/${method}`);

  if (!existing) {
    caches.set(cacheKey, cache);
  }

  const getResourceOptions = () => {
    if (queryOptions) {
      const { enabled, ...rest } = queryOptions;
      return { resource: rest, enabled };
    }

    return;
  };

  const options = getResourceOptions();

  const [data] = createResource(
    async () => {
      if (options?.enabled && !options.enabled()) return;
      setState('loading');
      const result = await cache(resolvedParams());
      setState('resolved');
      console.debug(
        `[createQuery]:  ${name}
                   (token): ${pb.authStore.token || 'EMPTY'} 
                   (method): ${method} 
                   (params): ${JSON.stringify(resolvedParams())}` +
          // + `(result): ${JSON.stringify(result)}`
          ''
      );

      return result;
    },
    (v) => v,
    { ...options?.resource }
  );

  return {
    data: data,
    isLoading: () => {
      return data.state === 'pending';
    },
  };
}

export const invalidateQuery = <Name extends QueryNames, Method extends QueryMethods>(
  key: `${Name}/${Method}`,
  params?: GetParams<Name, Method>
) => {
  let finalKey = key;

  if (params) {
    const hashed = hashKey(params);
    finalKey + `/${hashed}`;
  }

  return revalidate(finalKey, true);
};

const createMutation = <Name extends QueryNames, Method extends MutationMethods>(
  name: Name,
  method: Method,
  options?: { onSuccess: () => Promise<void> | void }
) => {
  const pb = usePocketbase();

  const [isPending, setIsPending] = createSignal(false);
  const [error, setError] = createSignal<unknown | undefined>(undefined);

  const handleAction = async (...params: GetParams<Name, Method>) => {
    setIsPending(true);
    try {
      // @ts-expect-error Not sure how to fix rest param types
      const result = await pb.collection(name)[method](...(params as any[]));
      options?.onSuccess();
      return result;
    } catch (err) {
      setError(err);
    } finally {
      setIsPending(false);
    }
  };

  return {
    get isPending() {
      return isPending();
    },
    get error() {
      return error();
    },
    mutate: (...params: GetParams<Name, Method>): void => {
      handleAction(...params);
    },
    mutateAsync: async (...params: GetParams<Name, Method>): Promise<GetMutationData<Name, Method>> => {
      // @ts-expect-error Not sure how to fix rest param types
      return await handleAction(...params);
    },
  };
};

const isListResult = (value: unknown): value is ListResult<unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return 'items' in value;
};

const getParamsHelper = <Name extends QueryNames = QueryNames, Method extends QueryMethods = QueryMethods>(
  ...params: [...GetParams<Name, Method>]
) => params;

type ParamsHelper<Name extends QueryNames, Method extends QueryMethods> = (
  ...params: [...GetParams<Name, Method>]
) => GetParams<Name, Method>;

type InfiniteQuerySettings<TData> = {
  getNextPage: (data: TData | undefined) => number | undefined;
  getPrevPage: (data: TData | undefined) => number | undefined;
  hasNextPage: (data: TData | undefined) => boolean;
  hasPrevPage: (data: TData | undefined) => boolean;
};

type GetMethodData<Name extends QueryNames, Method extends QueryMethods> = CorrectValue<
  NarrowReturnType<ReturnType<RecordService[Method]>>,
  CollectionResponses[Name]
>;

type GetMutationData<Name extends QueryNames, Method extends MutationMethods> = CorrectValue<
  NarrowReturnType<ReturnType<RecordService[Method]>>,
  CollectionResponses[Name]
>;

const createInfiniteQuery = <Name extends QueryNames>(
  name: Name,
  params: (w: ParamsHelper<Name, 'getList'>) => GetParams<Name, 'getList'>,
  settings: InfiniteQuerySettings<GetMethodData<Name, 'getList'>[]>
) => {
  const pb = usePocketbase();
  const queryParams = params(getParamsHelper<Name, 'getList'>);
  const [pageParam, setPageParam] = createSignal(queryParams[0] ?? 0);

  const [store, setStore] = createStore<{ value: { currentPage: number; items: GetMethodData<Name, 'getList'>[] } }>({
    value: {
      get currentPage() {
        return pageParam();
      },
      items: [],
    },
  });

  const [data] = createResource(
    pageParam,
    async (page) => {
      const [_, ...rest] = queryParams;
      const result = await pb.collection(name).getList<CollectionResponses[Name]>(page, ...rest);

      return result;
    },
    {
      storage: () =>
        [
          () => store.value.items,
          (v: any) => {
            typeof v === 'function' && (v = v());
            setStore('value', 'items', reconcile(structuredClone([...store.value.items, v])));
            return store.value.items;
          },
        ] as [Accessor<any>, Setter<any>],
    }
  );

  return {
    data: () => store.value,

    fetchNextPage: () => {
      const canFetch = settings.hasNextPage(store.value.items);
      if (!canFetch) return;
      setPageParam((p) => p + 1);
    },

    isLoading: () => data.loading,
    isRefreshing: () => data.state === 'refreshing',
    isFetching: () => data.state === 'pending',
  };
};

type RealtimeOptions<TSubData, TData> = {
  recordId?: string;
  sendOptions?: SendOptions;
  callback: (event: RecordSubscription<TSubData>, current: TData) => void;
};

const createRealtimeResource = <Name extends QueryNames, Method extends QueryMethods, Expand = unknown>(
  name: Name,
  method: Method,
  params: (w: (...params: [...GetParams<Name, Method>]) => GetParams<Name, Method>) => GetParams<Name, Method>,
  settings?: {
    query?: QueryOptions;
    realtime?: RealtimeOptions<CollectionResponses[Name], Awaited<GetMethodData<Name, Method>>>;
  }
) => {
  const pb = usePocketbase();

  const [store, setStore] = createStore<{
    value: Awaited<GetMethodData<Name, Method>>;
  }>({ value: {} as any });

  const getResourceOptions = () => {
    if (!settings || !settings.query) return;
    const { enabled, deferStream, initialValue } = settings.query;
    return { resource: { deferStream, initialValue }, enabled };
  };

  const options = getResourceOptions();
  const [data, s] = createResource(
    createMemo(() => {
      const resolvedParams = params(getParamsHelper);
      if (options?.enabled && !options.enabled()) return;

      return resolvedParams;
    }),
    async (resolvedParams) => {
      const event = getRequestEvent();
      const _pb = (isServer ? (event ? event?.locals.pb : pb) : pb) as TypedPocketBase;
      const result = (await _pb
        .collection<CollectionRecords[Name]>(name)
        // @ts-expect-error no clue how to type this
        [method]<CollectionResponses<Expand>[Name]>(...resolvedParams)) as Awaited<
        CorrectValue<NarrowReturnType<ReturnType<RecordService[Method]>>, CollectionResponses<Expand>[Name]>
      >;
      console.debug(
        `[realtime-resource]:  ${name}
                   (token): ${_pb.authStore.token || 'EMPTY'} 
                   (method): ${method} 
                   (params): ${JSON.stringify(resolvedParams)}` +
          // + `(result): ${JSON.stringify(result)}`
          ''
      );
      return result;
    },
    {
      ...(options?.resource as any),
      storage: () => [
        () => store.value,
        (v: any) => {
          typeof v === 'function' && (v = v());
          setStore('value', reconcile(structuredClone(v)));
          return store.value;
        },
      ],
    }
  );

  let unsub = () => {};
  onMount(async () => {
    unsub = await pb.collection(name).subscribe(
      settings?.realtime?.recordId ?? '*',
      (data: RecordSubscription<CollectionResponses[Name]>) => {
        setStore(
          produce((s) => {
            settings?.realtime?.callback(data, s.value);
          })
        );
        // console.log('Generic sub', data);
      },
      { ...settings?.realtime?.sendOptions }
    );
  });

  onCleanup(() => {
    unsub();
  });

  return {
    data: () => {
      return data.latest;
    },
    isLoading: () => data.loading,
    isRefreshing: () => data.state === 'refreshing',
    // @ts-expect-error TODO fix this type, I'm too lazy after dealing with the other types above
    isFetching: () => data.state === 'pending',
    refetch: s.refetch,
    mutate: s.mutate,
  };
};

export { createQuery, createInfiniteQuery, createMutation, createRealtimeResource };
