import { Component } from '@angular/core';
import { TopBar } from './top-bar/top-bar';
import { Hero } from './hero/hero';
import { RecurringLife } from './recurring-life/recurring-life';

@Component({
  selector: 'app-root',
  imports: [TopBar, Hero, RecurringLife],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
