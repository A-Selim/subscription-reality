import { Component } from '@angular/core';
import { Review } from '../review/review';
import { Savings } from '../savings/savings';

@Component({
  selector: 'app-review-area',
  imports: [Review, Savings],
  templateUrl: './review-area.html',
  styleUrl: './review-area.scss',
})
export class ReviewArea {}
