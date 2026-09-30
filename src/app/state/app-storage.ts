import type { AppState } from '../domain/subscription';

export abstract class AppStorage {
  abstract load(): Promise<AppState | null>;
  abstract save(state: AppState): Promise<void>;
}

export class UnreadableStateError extends Error {
  constructor() {
    super('Saved subscription data could not be read.');
    this.name = 'UnreadableStateError';
  }
}
