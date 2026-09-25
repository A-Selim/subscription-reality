import { Component } from '@angular/core';
import { TopBar } from './top-bar/top-bar';
import { Hero } from './hero/hero';
import { RecurringLife } from './recurring-life/recurring-life';
import { Reality } from './reality/reality';
import { Review } from './review/review';
import { Savings } from './savings/savings';

@Component({
  selector: 'app-root',
  imports: [TopBar, Hero, RecurringLife, Reality, Review, Savings],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
