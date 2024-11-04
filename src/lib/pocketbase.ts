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
import { createStore, produce, reconcile } from 'solid-js/store';

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
  const getResourceOptions = () => {
    if (queryOptions) {
      const { enabled, ...rest } = queryOptions;
      return { resource: rest, enabled };
    }

    return;
  };
  const options = getResourceOptions();
  const [data, s] = createResource(
    createMemo(() => {
      const list = params(getParamsHelper);

      if (options?.enabled && !options.enabled()) return;

      return list;
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
        `[createQuery]:  ${name}
                   (token): ${_pb.authStore.token || 'EMPTY'} 
                   (method): ${method} 
                   (params): ${JSON.stringify(resolvedParams)}` +
          // + `(result): ${JSON.stringify(result)}`
          ''
      );

      return result;
    },
    { ...(options?.resource as any) }
  );

  return {
    data: data,
    isLoading: () => data.loading,
    isRefreshing: () => data.state === 'refreshing',
    // @ts-expect-error TODO fix this type, I'm too lazy after dealing with the other types above
    isFetching: () => data.state === 'pending',
    refetch: s.refetch,
  };
}

const createMutation = <Name extends QueryNames, Method extends MutationMethods>(name: Name, method: Method) => {
  const pb = usePocketbase();

  return {
    mutate: (...params: GetParams<Name, Method>): void => {
      // @ts-expect-error Not sure how to fix rest param types
      pb.collection(name)[method](...(params as any[]));
    },
    mutateAsync: async (
      ...params: GetParams<Name, Method>
    ): Promise<Awaited<ReturnType<RecordService<CollectionRecords[Name]>[Method]>>> => {
      // @ts-expect-error Not sure how to fix rest param types
      return (await pb.collection(name)[method](...(params as any))) as any;
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
      if (options?.enabled && !options.enabled()) return;

      return true;
    }),
    async () => {
      const resolvedParams = params(getParamsHelper);

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
  };
};

export { createQuery, createInfiniteQuery, createMutation, createRealtimeResource };
