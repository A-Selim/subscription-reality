import { Component, inject } from '@angular/core';
import { SubscriptionsState } from '../state/subscriptions-state';

@Component({
  selector: 'app-storage-notice',
  host: { role: 'status' },
  styleUrl: './storage-notice.scss',
  template: `
    @if (dataUnreadable()) {
      <p>
        Your saved data couldn't be read, so the app started empty. A copy of the old data was kept
        in this browser.
      </p>
    }
    @if (onlyForThisVisit()) {
      <p>Your browser couldn't save your changes, so they'll only last for this visit.</p>
    }
  `,
})
export class StorageNotice {
  private readonly state = inject(SubscriptionsState);
  readonly dataUnreadable = this.state.dataUnreadable;
  readonly onlyForThisVisit = this.state.onlyForThisVisit;
}
