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

  it('places the page heading in main and the header outside main', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const main = page.querySelector('main');

    expect(main?.querySelector('h1')?.textContent?.trim()).toBe(
      'Small monthly charges add up quietly.',
    );
    expect(main?.querySelector('header')).toBeNull();
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

  it('shows the recurring life empty state in main', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const main = page.querySelector('main');

    expect(main?.querySelector('h2')?.textContent?.trim()).toBe('Your recurring life.');
    expect(main?.querySelector('h3')?.textContent?.trim()).toBe(
      'What are you paying for every month?',
    );
  });

  it('shows the six example categories in order', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const categories = Array.from(page.querySelectorAll('#recurring .motivation li')).map((item) =>
      item.textContent?.trim(),
    );

    expect(categories).toEqual([
      'Streaming',
      'AI tools',
      'Cloud storage',
      'Gym',
      'News',
      'Software',
    ]);
  });

  it('offers one native add button as the only button in main', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const main = page.querySelector('main');
    const buttons = main?.querySelectorAll('button');

    expect(buttons).toHaveLength(1);
    expect(buttons?.[0].textContent?.trim()).toBe('Add your first subscription');
    expect(buttons?.[0].getAttribute('type')).toBe('button');
    expect(page.querySelector('#recurring button')).toBe(buttons?.[0]);
  });
});
