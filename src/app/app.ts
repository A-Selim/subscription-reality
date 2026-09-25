import { Component } from '@angular/core';
import { TopBarHero } from './top-bar-hero/top-bar-hero';
import { RecurringLife } from './recurring-life/recurring-life';

@Component({
  selector: 'app-root',
  imports: [TopBarHero, RecurringLife],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
