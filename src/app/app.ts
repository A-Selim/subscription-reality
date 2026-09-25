import { Component } from '@angular/core';
import { TopBar } from './top-bar/top-bar';
import { Hero } from './hero/hero';
import { RecurringLife } from './recurring-life/recurring-life';
import { Reality } from './reality/reality';
import { ReviewArea } from './review-area/review-area';

@Component({
  selector: 'app-root',
  imports: [TopBar, Hero, RecurringLife, Reality, ReviewArea],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
