import { Component, inject } from '@angular/core';
import { StorageNotice } from './storage-notice/storage-notice';
import { TopBar } from './top-bar/top-bar';
import { Hero } from './hero/hero';
import { RecurringLife } from './recurring-life/recurring-life';
import { Reality } from './reality/reality';
import { ReviewArea } from './review-area/review-area';
import { SubscriptionsState } from './state/subscriptions-state';

@Component({
  selector: 'app-root',
  imports: [StorageNotice, TopBar, Hero, RecurringLife, Reality, ReviewArea],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly loaded = inject(SubscriptionsState).loaded;
}
