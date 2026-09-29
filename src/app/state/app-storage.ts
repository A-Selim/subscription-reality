import type { AppState } from '../domain/subscription';

export abstract class AppStorage {
  abstract load(): Promise<AppState | null>;
  abstract save(state: AppState): Promise<void>;
}
