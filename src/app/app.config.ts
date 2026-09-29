import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { AppStorage } from './state/app-storage';
import { IndexedDbAppStorage } from './state/indexed-db-app-storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: AppStorage, useClass: IndexedDbAppStorage },
  ],
};
