import { ListResult, RecordOptions, RecordService } from 'pocketbase';
import { Accessor, createMemo, createResource, InitializedResource, ResourceOptions, ResourceReturn } from 'solid-js';
import { usePocketbase } from '~/components/pocketbase-context';
import { CollectionRecords, CollectionResponses, TypedPocketBase } from '~/types/pocketbase-gen';
import { copy } from './utils';
import { getRequestEvent, isServer } from 'solid-js/web';

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

type NarrowReturnType<T> = T extends Promise<infer A> ? A : T extends Promise<ListResult<infer B>> ? B : T

type CorrectValue<A, B> = A extends ListResult<any> ? ListResult<B> : B


type QueryReturn<Name extends QueryNames, Method extends QueryMethods> = {

  data: InitializedResource<Awaited<
    CorrectValue<NarrowReturnType<ReturnType<RecordService[Method]>>, CollectionResponses[Name]>
  >>,
  isLoading: Accessor<boolean>
  isRefreshing: Accessor<boolean>
  isFetching: Accessor<boolean>
}

function createQuery<Name extends QueryNames, Method extends QueryMethods>(
  name: Name,
  method: Method,
  ...params: [
    ...(Method extends AccessorEligible ? ToAccessors<GetParams<Name, Method>> : GetParams<Name, Method>),
    options?: QueryOptions,
  ]
) {
  const pb = usePocketbase()
  const getResourceOptions = () => {
    const lastParam = params[params.length - 1]

    if (lastParam && ('deferStream' in lastParam || 'initialValue' in lastParam || 'enabled' in lastParam)) {
      const { enabled, ...rest } = lastParam
      return { resource: rest, enabled }
    }

    return
  }
  const options = getResourceOptions()
  const [data, s] = createResource(
    createMemo(() => {
      if (options?.enabled && !options.enabled()) return
      const list =
        params.map((c) => {
          if (typeof c === 'function') return c();
          return c;
        })

      return list
    }
    ),
    async (resolvedParams) => {
      const event = getRequestEvent()
      const _pb = (isServer ? event ? event?.locals.pb : pb : pb) as TypedPocketBase
      const result = (await _pb
        .collection<CollectionRecords[Name]>(name)
      // @ts-expect-error no clue how to type this
      [method]<CollectionResponses[Name]>(...resolvedParams)) as (Awaited<
        CorrectValue<NarrowReturnType<ReturnType<RecordService[Method]>>, CollectionResponses[Name]>
      >);
      console.debug(`[createQuery]: 
                   (token): ${_pb.authStore.token || 'EMPTY'} 
                   (method): ${method} 
                   (params): ${JSON.stringify(resolvedParams)} 
                   (result): ${JSON.stringify(result)}`)

      return result
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
};

const createMutation = <Name extends QueryNames, Method extends MutationMethods>(name: Name, method: Method) => {
  const pb = usePocketbase()
  const action = pb.collection(name)[method];

  return {
    mutate: (...params: GetParams<Name, Method>): void => {
      action(params as any);
    },
    mutateAsync: async (
      ...params: GetParams<Name, Method>
    ): Promise<Awaited<ReturnType<RecordService<CollectionRecords[Name]>[Method]>>> => {
      return (await action(params as any)) as any;
    },
  };
};

export { createQuery, createMutation };
