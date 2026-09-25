import { Component } from '@angular/core';
import { TopBarHero } from './top-bar-hero/top-bar-hero';

@Component({
  selector: 'app-root',
  imports: [TopBarHero],
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
