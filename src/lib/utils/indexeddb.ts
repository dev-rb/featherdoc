import { isArray, isObject } from './general';

const promisifyRequest = <T = undefined>(request: IDBRequest<T> | IDBTransaction) => {
  return new Promise<T>((resolve, reject) => {
    // @ts-ignore
    request.oncomplete = request.onsuccess = () => resolve(request.result);
    // @ts-ignore
    request.onabort = request.onerror = () => reject(request.error);
  });
};
export const createDB = (dbName: string, storeName: string | string[]) => {
  const request = indexedDB.open(dbName);

  request.onupgradeneeded = () => {
    const stores = request.transaction?.objectStoreNames;
    if (typeof storeName === 'string' && !stores?.contains(storeName)) {
      request.result.createObjectStore(storeName);
    }

    if (Array.isArray(storeName)) {
      for (const name of storeName) {
        if (typeof name === 'string' && !stores?.contains(name)) {
          request.result.createObjectStore(name);
        }
      }
    }
  };

  const dbp = promisifyRequest(request);

  const compute = async <T = any>(
    txMode: IDBTransactionMode,
    storeName: string,
    cb: (store: IDBObjectStore) => T | PromiseLike<T>
  ) => {
    const db = await dbp;
    return cb(db.transaction(storeName, txMode).objectStore(storeName));
  };

  const cursor = (store: IDBObjectStore, cb: (cursor: IDBCursorWithValue) => void) => {
    store.openCursor().onsuccess = function () {
      if (!this.result) return;

      cb(this.result);

      this.result.continue();
    };

    return promisifyRequest(store.transaction);
  };

  const set = (storeName: string, key: IDBValidKey, value: any) => {
    return compute('readwrite', storeName, (store) => {
      store.put(value, key);

      return promisifyRequest(store.transaction);
    });
  };

  const setMany = (storeName: string, entries: [IDBValidKey, any][]) => {
    return compute('readwrite', storeName, (store) => {
      for (const [key, value] of entries) {
        store.put(value, key);
      }

      return promisifyRequest(store.transaction);
    });
  };

  const get = (storeName: string, key: IDBValidKey) => {
    return compute('readonly', storeName, (store) => promisifyRequest(store.get(key)));
  };

  const o = <Key extends IDBValidKey, Value = any>(storeName: string) => {
    return compute('readonly', storeName, async (store) => {
      if (store.getAll && store.getAllKeys) {
        const [keys, values] = await Promise.all([
          promisifyRequest(store.getAllKeys() as unknown as IDBRequest<Key[]>),
          promisifyRequest(store.getAll() as unknown as IDBRequest<Value[]>),
        ]);
        return keys.reduce(
          (acc, key, i) => {
            acc[key.toString()] = values[i];
            return acc;
          },
          {} as Record<string, Value>
        );
      }

      const items: [Key, Value][] = [];

      await cursor(store, (cursor) => {
        items.push([cursor.key as Key, cursor.value]);
      });
      return items;
    });
  };

  const entries = <Key extends IDBValidKey, Value = any>(storeName: string) => {
    return compute('readonly', storeName, async (store) => {
      if (store.getAll && store.getAllKeys) {
        const [keys, values_1] = await Promise.all([
          promisifyRequest(store.getAllKeys() as unknown as IDBRequest<Key[]>),
          promisifyRequest(store.getAll() as unknown as IDBRequest<Value[]>),
        ]);
        return keys.map((key, i) => [key, values_1[i]]);
      }

      const items: [Key, Value][] = [];

      await cursor(store, (cursor) => {
        items.push([cursor.key as Key, cursor.value]);
      });
      return items;
    });
  };

  const merge = <Key extends IDBValidKey, Value = any>(storeName: string, values: [Key, Value][]) => {
    return compute('readwrite', storeName, async (store) => {
      for (const [k, v] of values) {
        const value = store.get(k);

        if (!value && v) {
          store.put(v, k);
        } else if (value && v) {
          if (isObject(value) && isObject(v)) {
            store.put({ ...value, ...v }, k);
          } else if (isArray(value) && isObject(v)) {
            store.put(v, k);
          } else if (isArray(value) && isArray(v)) {
            store.put(Array.from(new Set([...value, ...v])), k);
          } else {
            store.put(v, k);
          }
        } else if (value && !v) {
          store.delete(k);
        }
      }

      return promisifyRequest(store.transaction);
    });
  };

  const clear = (storeName: string) => {
    return compute('readwrite', storeName, (store) => store.clear());
  };

  const clearAll = () => {
    if (Array.isArray(storeName)) {
      return Promise.all(storeName.map((name) => compute('readwrite', name, (store) => store.clear())));
    }
    return compute('readwrite', storeName, (store) => store.clear());
  };
  return {
    set,
    setMany,
    get,
    entries,
    merge,
    o,
    clear,
    clearAll,
  };
};
