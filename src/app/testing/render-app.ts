import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { App } from '../app';
import { AppStorage } from '../state/app-storage';
import { InMemoryAppStorage } from '../state/in-memory-app-storage';
import { SubscriptionsState } from '../state/subscriptions-state';

export async function renderApp(
  storage: InMemoryAppStorage = new InMemoryAppStorage(),
): Promise<{ fixture: ComponentFixture<App>; root: HTMLElement; storage: InMemoryAppStorage }> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [{ provide: AppStorage, useValue: storage }],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  await TestBed.inject(SubscriptionsState).ready;
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement, storage };
}
