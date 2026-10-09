import { Service } from '@angular/core';
import { type AppState } from '../domain/subscription';
import { AppStorage, UnreadableStateError } from './app-storage';
import { isAppState } from './app-state-guard';

const DATABASE = 'subscription-reality';
const STORE = 'app-state';
const KEY = 'current';
const BACKUP_KEY = 'current-unreadable-backup';

@Service()
export class IndexedDbAppStorage extends AppStorage {
  private persistenceRequested = false;
  private backupFailure: { error: unknown } | null = null;
  private readonly database = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  async load(): Promise<AppState | null> {
    const database = await this.database;
    const value = await this.runTransaction<unknown>(database, 'readonly', (store) => {
      const request = store.get(KEY);
      return () => request.result;
    });
    if (value === undefined) return null;
    if (isAppState(value)) return value;

    try {
      await this.runTransaction(database, 'readwrite', (store) => {
        store.put(value, BACKUP_KEY);
        return () => {};
      });
    } catch (error) {
      this.backupFailure = { error };
      throw error;
    }
    throw new UnreadableStateError();
  }

  async save(state: AppState): Promise<void> {
    if (this.backupFailure !== null) throw this.backupFailure.error;
    const database = await this.database;
    await this.runTransaction(database, 'readwrite', (store) => {
      store.put(state, KEY);
      return () => {};
    });
    if (!this.persistenceRequested) {
      this.persistenceRequested = true;
      void this.requestPersistence();
    }
  }

  private runTransaction<T>(
    database: IDBDatabase,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => () => T,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
      const result = operation(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(result());
    });
  }

  private async requestPersistence(): Promise<void> {
    try {
      const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
      if (!storage?.persist) return;
      if (storage.persisted && (await storage.persisted())) return;
      await storage.persist();
    } catch {
      // Persistence is optional; the completed save is unaffected.
    }
  }
}
