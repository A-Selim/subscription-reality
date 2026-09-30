import type { AppState } from '../domain/subscription';
import { AppStorage, UnreadableStateError } from '../state/app-storage';

export class InMemoryAppStorage extends AppStorage {
  private state: AppState | null = null;
  private holdingSaves = false;
  private pendingReleases: Array<() => void> = [];
  rejectLoads = false;
  rejectLoadsAsUnreadable = false;
  rejectSaves = false;
  activeSaves = 0;
  maxActiveSaves = 0;
  readonly savedStates: AppState[] = [];

  async load(): Promise<AppState | null> {
    if (this.rejectLoadsAsUnreadable) throw new UnreadableStateError();
    if (this.rejectLoads) throw new Error('Load failed');
    return this.state === null ? null : structuredClone(this.state);
  }

  async save(state: AppState): Promise<void> {
    const copy = structuredClone(state);
    this.activeSaves++;
    this.maxActiveSaves = Math.max(this.maxActiveSaves, this.activeSaves);
    try {
      if (this.holdingSaves) {
        await new Promise<void>((resolve) => this.pendingReleases.push(resolve));
      }
      if (this.rejectSaves) throw new Error('Save failed');
      this.state = structuredClone(copy);
      this.savedStates.push(copy);
    } finally {
      this.activeSaves--;
    }
  }

  holdSaves(): void {
    this.holdingSaves = true;
  }

  releaseSaves(): void {
    this.holdingSaves = false;
    for (const release of this.pendingReleases.splice(0)) release();
  }
}
