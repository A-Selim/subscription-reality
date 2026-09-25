import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App page seam', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('renders the page heading as its only h1', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const headings = page.querySelectorAll('h1');

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Small monthly charges add up quietly.');
  });

  it('shows the subscriptions explanation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.textContent).toContain(
      'Add the subscriptions you pay for. We’ll turn them into one clear picture of what they really cost — and help you decide what still deserves to stay.',
    );
  });

  it('places the Start adding button inside the header banner', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const header = page.querySelector('header');
    const button = header?.querySelector('button');

    expect(header).not.toBeNull();
    expect(button?.textContent?.trim()).toBe('Start adding');
    expect(button?.getAttribute('type')).toBe('button');
  });

  it('does not render scaffold links or greeting text', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.textContent).not.toContain('Hello,');
    expect(page.querySelector('a[href*="angular.dev"]')).toBeNull();
  });
});
