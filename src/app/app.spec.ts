import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppStorage } from './state/app-storage';
import { TOAST_DURATION_MS, TOAST_FADE_MS } from './toast/toast';
import { InMemoryAppStorage } from './testing/in-memory-app-storage';
import { SubscriptionsState } from './state/subscriptions-state';
import { renderApp } from './testing/render-app';

function getRegion(root: HTMLElement, name: string): HTMLElement {
  const heading = Array.from(root.querySelectorAll('h1, h2, h3')).find(
    (candidate) => candidate.textContent?.trim() === name,
  );
  const section = heading?.closest('section');

  if (!heading || !section || section.getAttribute('aria-labelledby') !== heading.id) {
    throw new Error(`Could not find region labelled by heading "${name}".`);
  }

  return section;
}

function getButton(root: HTMLElement, name: string): HTMLButtonElement {
  const buttons = Array.from(root.querySelectorAll('button')).filter(
    (button) => button.textContent?.trim() === name,
  );

  if (buttons.length !== 1) {
    throw new Error(`Expected one button named "${name}", found ${buttons.length}.`);
  }

  return buttons[0];
}

function getList(root: HTMLElement, label: string): HTMLUListElement {
  const list = Array.from(root.querySelectorAll('ul')).find(
    (candidate) => candidate.getAttribute('aria-label') === label,
  );

  if (!list) {
    throw new Error(`Could not find list labelled "${label}".`);
  }

  return list;
}

function getFocusableElements(root: HTMLElement): Element[] {
  return Array.from(
    root.querySelectorAll(
      'a[href], area[href], button, input, select, textarea, summary, iframe, [tabindex], [contenteditable]',
    ),
  );
}

async function settlePage(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

async function prepareAddForm() {
  const { fixture, root: page } = await renderApp();
  const region = getRegion(page, 'Your recurring life.');
  getButton(region, 'Add your first subscription').click();
  fixture.detectChanges();
  await settlePage();
  return { fixture, region };
}

function addSubscription(fixture: ComponentFixture<App>, region: HTMLElement, name: string): void {
  setField(region, 'subscription-name', name);
  setField(region, 'subscription-price', '9.99');
  setField(region, 'subscription-billing', 'monthly');
  setField(region, 'subscription-currency', 'EUR');
  clickAdd(region);
  fixture.detectChanges();
}

function clickAdd(region: HTMLElement): void {
  getButton(region, 'Add subscription').click();
}

function setField(root: HTMLElement, id: string, value: string): void {
  const field = root.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`);
  if (!field) {
    throw new Error(`Could not find field "${id}".`);
  }
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  if (field instanceof HTMLSelectElement) {
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

describe('App page seam', () => {
  it('renders the page heading as its only h1', async () => {
    const page = (await renderApp()).root;
    const headings = page.querySelectorAll('h1');

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent?.trim()).toBe('Small monthly charges add up quietly.');
  });

  it('places the page heading in main and the header outside main', async () => {
    const page = (await renderApp()).root;
    const main = page.querySelector('main');
    const header = page.querySelector('header');

    expect(main?.querySelector('h1')?.textContent?.trim()).toBe(
      'Small monthly charges add up quietly.',
    );
    expect(header).not.toBeNull();
    expect(main?.contains(header)).toBe(false);
  });

  it('shows the subscriptions explanation', async () => {
    const page = (await renderApp()).root;

    expect(page.textContent).toContain(
      'Add the subscriptions you pay for. We’ll turn them into one clear picture of what they really cost — and help you decide what still deserves to stay.',
    );
  });

  it('places the Start adding button inside the header banner', async () => {
    const page = (await renderApp()).root;
    const header = page.querySelector('header');

    if (!header) {
      throw new Error('Could not find the header banner.');
    }
    const button = getButton(header, 'Start adding');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('does not render scaffold links or greeting text', async () => {
    const page = (await renderApp()).root;

    expect(page.textContent).not.toContain('Hello,');
    const linkNames = Array.from(page.querySelectorAll('a')).map(
      (link) => link.getAttribute('aria-label') ?? link.textContent?.trim(),
    );

    expect(linkNames).not.toContain('Explore the Docs');
    expect(linkNames).not.toContain('Learn with Tutorials');
    expect(linkNames).not.toContain('Prompt and best practices for AI');
    expect(linkNames).not.toContain('CLI Docs');
    expect(linkNames).not.toContain('Angular Language Service');
    expect(linkNames).not.toContain('Angular DevTools');
    expect(page.textContent).not.toContain('Congratulations! Your app is running.');
  });

  it('shows the recurring life empty state in main', async () => {
    const page = (await renderApp()).root;
    const main = page.querySelector('main');
    const region = getRegion(page, 'Your recurring life.');

    expect(main?.contains(region)).toBe(true);
    expect(region.querySelector('h2')?.textContent?.trim()).toBe('Your recurring life.');
    expect(region.querySelector('h3')?.textContent?.trim()).toBe(
      'What are you paying for every month?',
    );
  });

  it('shows the six examples in order', async () => {
    const page = (await renderApp()).root;
    const recurringLife = getRegion(page, 'Your recurring life.');
    const examples = Array.from(getList(recurringLife, 'Examples').querySelectorAll('li')).map(
      (item) => item.textContent?.trim(),
    );

    expect(examples).toEqual(['Streaming', 'AI tools', 'Cloud storage', 'Gym', 'News', 'Software']);
  });

  it('offers one Add your first subscription button in the empty state', async () => {
    const page = (await renderApp()).root;
    const region = getRegion(page, 'Your recurring life.');
    const button = getButton(region, 'Add your first subscription');

    expect(button.getAttribute('type')).toBe('button');
  });

  it('reveals the add form with its initial values and estimated Usage note', async () => {
    const page = (await renderApp()).root;
    const region = getRegion(page, 'Your recurring life.');

    expect(region.querySelector('form')).toBeNull();
    getButton(region, 'Add your first subscription').click();
    await settlePage();

    expect(region.querySelector<HTMLSelectElement>('#subscription-reason')?.value).toBe(
      'Essential',
    );
    expect(region.querySelector<HTMLSelectElement>('#subscription-billing')?.value).toBe('');
    expect(region.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe('');
    expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
    expect(region.querySelector('#subscription-usage')).toBeNull();
    expect(region.querySelector('form')?.textContent).toContain(
      'Usage is estimated from your reason. You can refine it in the review.',
    );

    clickAdd(region);
    await settlePage();
    expect(region.querySelectorAll('.subscription-card')).toHaveLength(0);
  });

  it('gives add controls accessible names from visually hidden labels and heading', async () => {
    const { region } = await prepareAddForm();
    const form = region.querySelector<HTMLFormElement>('form');
    const expectedNames = new Map([
      ['subscription-name', 'Subscription name'],
      ['subscription-price', 'Price'],
      ['subscription-billing', 'Billing frequency'],
      ['subscription-currency', 'Currency'],
      ['subscription-reason', 'Reason'],
    ]);

    expect(form?.getAttribute('aria-labelledby')).toBe('add-heading');
    expect(region.querySelector('#add-heading')?.textContent?.trim()).toBe('Add a subscription');
    for (const [id, name] of expectedNames) {
      const label = region.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
      expect(label?.textContent?.trim()).toBe(name);
      expect(label?.control?.id).toBe(id);
    }
  });

  it('shows the compact form placeholders and blank select options', async () => {
    const { region } = await prepareAddForm();
    const name = region.querySelector<HTMLInputElement>('#subscription-name');
    const price = region.querySelector<HTMLInputElement>('#subscription-price');
    const billing = region.querySelector<HTMLSelectElement>('#subscription-billing');
    const currency = region.querySelector<HTMLSelectElement>('#subscription-currency');

    expect(name?.placeholder).toBe('Name e.g. Spotify');
    expect(price?.placeholder).toBe('Price');
    expect(billing?.options[0]?.text).toBe('Billing');
    expect(billing?.options[0]?.value).toBe('');
    expect(currency?.options[0]?.text).toBe('Currency');
    expect(currency?.options[0]?.value).toBe('');
  });

  it('updates blank select styling as values are selected and after adding', async () => {
    const { fixture, region } = await prepareAddForm();
    const billing = region.querySelector<HTMLSelectElement>('#subscription-billing');
    const currency = region.querySelector<HTMLSelectElement>('#subscription-currency');

    expect(billing?.classList.contains('is-empty')).toBe(true);
    expect(currency?.classList.contains('is-empty')).toBe(true);
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    await settlePage();
    fixture.detectChanges();
    expect(billing?.classList.contains('is-empty')).toBe(false);
    expect(currency?.classList.contains('is-empty')).toBe(false);

    setField(region, 'subscription-name', 'Spotify');
    setField(region, 'subscription-price', '9.99');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();

    expect(billing?.value).toBe('');
    expect(billing?.classList.contains('is-empty')).toBe(true);
    expect(currency?.value).toBe('EUR');
    expect(currency?.classList.contains('is-empty')).toBe(false);
  });

  it('adds subscriptions in order, estimates Usage, and resets the add form', async () => {
    const page = (await renderApp()).root;
    const region = getRegion(page, 'Your recurring life.');
    getButton(region, 'Add your first subscription').click();
    await settlePage();

    setField(region, 'subscription-name', ' Spotify ');
    setField(region, 'subscription-price', '9.99');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    setField(region, 'subscription-reason', 'Occasional Use');
    await settlePage();
    clickAdd(region);
    await settlePage();

    const cards = () => Array.from(getList(region, 'Subscriptions').querySelectorAll('article'));
    expect(cards()).toHaveLength(1);
    expect(cards()[0].textContent).toContain('Spotify');
    expect(cards()[0].querySelector('.monogram')?.textContent?.trim()).toBe('SP');
    expect(cards()[0].querySelector('.card-price')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '€9.99 / month',
    );
    expect(cards()[0].querySelector('.yearly')?.textContent?.trim()).toBe('Annual cost €120');
    expect(cards()[0].textContent).toContain('Reason: Occasional Use');
    expect(cards()[0].textContent).toContain('Usage: Rarely');
    expect(region.querySelector('.empty-state')).toBeNull();
    expect(region.querySelector('#subscription-name')).not.toBeNull();
    expect(region.querySelector<HTMLInputElement>('#subscription-name')?.value).toBe('');
    expect(region.querySelector<HTMLInputElement>('#subscription-price')?.value).toBe('');
    expect(region.querySelector<HTMLSelectElement>('#subscription-billing')?.value).toBe('');
    expect(region.querySelector<HTMLSelectElement>('#subscription-reason')?.value).toBe(
      'Essential',
    );
    expect(region.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe('EUR');

    setField(region, 'subscription-name', 'Cloud');
    setField(region, 'subscription-price', '24');
    setField(region, 'subscription-billing', 'yearly');
    setField(region, 'subscription-reason', 'Convenience');
    await settlePage();
    clickAdd(region);
    await settlePage();

    expect(cards()).toHaveLength(2);
    expect(cards().map((card) => card.querySelector('h3')?.textContent?.trim())).toEqual([
      'Spotify',
      'Cloud',
    ]);
    expect(cards()[1].querySelector('.card-price')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      '€24.00 / year',
    );
    expect(cards()[1].querySelector('.yearly')?.textContent?.trim()).toBe('Annual cost €24');
    expect(cards()[1].textContent).toContain('Usage: Weekly');
    expect(region.querySelector('form')).not.toBeNull();
  });

  it('announces adds in a persistent status region immediately before Add', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      const status = region.querySelector<HTMLElement>('[role="status"]');
      const addButton = region.querySelector<HTMLButtonElement>('button.primary');
      if (!addButton) throw new Error('Could not find the Add subscription button.');
      expect(status?.getAttribute('role')).toBe('status');
      expect(status?.textContent?.trim()).toBe('');
      expect(status?.nextElementSibling).toBe(addButton);

      addSubscription(fixture, region, 'First');
      expect(status?.textContent?.trim()).toBe('Subscription added');
      expect(document.activeElement).toBe(region.querySelector('#subscription-name'));

      vi.advanceTimersByTime(TOAST_DURATION_MS);
      fixture.detectChanges();
      expect(status?.classList.contains('toast-visible')).toBe(false);
      expect(status?.textContent?.trim()).toBe('Subscription added');
      vi.advanceTimersByTime(TOAST_FADE_MS);
      fixture.detectChanges();
      expect(status?.textContent).toBe('');
      expect(
        Array.from(status?.childNodes ?? []).filter((node) => node.nodeType === Node.TEXT_NODE),
      ).toHaveLength(0);
      expect(region.querySelector('[role="status"]')).toBe(status);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows the toast again after it has hidden', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      const status = region.querySelector<HTMLElement>('[role="status"]');
      addSubscription(fixture, region, 'First');
      vi.advanceTimersByTime(TOAST_DURATION_MS);
      fixture.detectChanges();
      expect(status?.classList.contains('toast-visible')).toBe(false);
      expect(status?.textContent?.trim()).toBe('Subscription added');

      vi.advanceTimersByTime(TOAST_FADE_MS / 2);
      addSubscription(fixture, region, 'Second');
      expect(status?.textContent?.trim()).toBe('Subscription added');
      expect(status?.classList.contains('toast-visible')).toBe(true);

      vi.advanceTimersByTime(TOAST_FADE_MS);
      fixture.detectChanges();
      expect(status?.textContent?.trim()).toBe('Subscription added');
    } finally {
      vi.useRealTimers();
    }
  });

  it('replaces the toast text node on repeated messages and clears its timer on destroy', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      const status = region.querySelector<HTMLElement>('[role="status"]');
      addSubscription(fixture, region, 'First');
      const firstMessage = status?.firstElementChild;

      addSubscription(fixture, region, 'Second');
      expect(region.querySelector('[role="status"]')).toBe(status);
      expect(status?.firstElementChild).not.toBe(firstMessage);
      expect(status?.textContent?.trim()).toBe('Subscription added');
      expect(vi.getTimerCount()).toBe(1);

      fixture.destroy();
      expect(vi.getTimerCount()).toBe(0);
      expect(() => vi.advanceTimersByTime(TOAST_DURATION_MS)).not.toThrow();
    } finally {
      vi.useRealTimers();
    }
  });

  it.each([
    ['USD', 'netflix', '$60.00 / year', 'Annual cost $60', 'NE'],
    ['GBP', 'BritBox', '£60.00 / year', 'Annual cost £60', 'BR'],
    ['EGP', 'Cinema', 'E£60.00 / year', 'Annual cost E£60', 'CI'],
  ])(
    'shows %s price, Annual cost, and monogram on a card',
    async (currency, name, price, annual, initials) => {
      const page = (await renderApp()).root;
      const region = getRegion(page, 'Your recurring life.');
      getButton(region, 'Add your first subscription').click();
      await settlePage();

      setField(region, 'subscription-name', name);
      setField(region, 'subscription-price', '60');
      setField(region, 'subscription-billing', 'yearly');
      setField(region, 'subscription-currency', currency);
      await settlePage();
      clickAdd(region);
      await settlePage();

      const card = getList(region, 'Subscriptions').querySelector('article');
      expect(card?.querySelector('.monogram')?.textContent?.trim()).toBe(initials);
      expect(card?.querySelector('.card-price')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        price,
      );
      expect(card?.querySelector('.yearly')?.textContent?.trim()).toBe(annual);
    },
  );

  it.each([
    ['Essential', 'Daily'],
    ['Nice to Have', 'Monthly'],
  ])('shows %s Reason with estimated %s Usage on a card', async (reason, usage) => {
    const page = (await renderApp()).root;
    const region = getRegion(page, 'Your recurring life.');
    getButton(region, 'Add your first subscription').click();
    await settlePage();

    setField(region, 'subscription-name', 'Example');
    setField(region, 'subscription-price', '10');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'USD');
    setField(region, 'subscription-reason', reason);
    await settlePage();
    clickAdd(region);
    await settlePage();

    const card = getList(region, 'Subscriptions').querySelector('article');
    expect(card?.textContent).toContain(`Reason: ${reason}`);
    expect(card?.textContent).toContain(`Usage: ${usage}`);
  });

  it('shows readable empty copy and zero figures in the reality, review and savings regions', async () => {
    const page = (await renderApp()).root;
    const reality = getRegion(page, 'See the reality.');
    const review = getRegion(page, 'Add a subscription first');
    const savings = getRegion(page, 'Potential annual savings');

    expect(reality.textContent).toContain('Add a subscription first');
    expect(reality.textContent).toContain('0 every month');
    expect(reality.textContent).toContain('0 / year');
    expect(review.textContent).toContain(
      'Your review will start here once there is something to reflect on.',
    );
    expect(savings.textContent).toContain(
      'Add your subscriptions first. Your review insights will appear here.',
    );
    expect(savings.textContent).toContain('0 / year');
    expect(savings.textContent?.match(/0/g)).toHaveLength(1);

    for (const region of [reality, review, savings]) {
      expect(region.closest('[inert], [aria-hidden="true"]')).toBeNull();
      for (const textElement of region.querySelectorAll('h2, h3, p, dt, dd')) {
        expect(textElement.closest('[inert], [aria-hidden="true"]')).toBeNull();
      }
    }
  });

  it('places the dimmed areas after recurring life without adding tab stops', async () => {
    const page = (await renderApp()).root;
    const main = page.querySelector('main');
    const recurringLife = getRegion(page, 'Your recurring life.');
    const reality = getRegion(page, 'See the reality.');
    const reviewArea = getRegion(page, 'Would you still subscribe today?');
    const review = getRegion(page, 'Add a subscription first');
    const savings = getRegion(page, 'Potential annual savings');

    expect(main?.contains(reality)).toBe(true);
    expect(main?.contains(reviewArea)).toBe(true);
    expect(
      recurringLife.compareDocumentPosition(reality) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      reality.compareDocumentPosition(reviewArea) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(reviewArea.contains(review)).toBe(true);
    expect(reviewArea.contains(savings)).toBe(true);

    for (const region of [reality, reviewArea, review, savings]) {
      expect(getFocusableElements(region)).toEqual([]);
      expect(region.querySelector('button')).toBeNull();
    }

    expect(getFocusableElements(main as HTMLElement)).toEqual([
      getButton(recurringLife, 'Add your first subscription'),
    ]);
  });
});

describe('add form validation', () => {
  function fillValidFields(region: HTMLElement): void {
    setField(region, 'subscription-name', 'Spotify');
    setField(region, 'subscription-price', '9.99');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
  }

  function expectFieldError(region: HTMLElement, id: string, message: string): HTMLElement {
    const field = region.querySelector<HTMLElement>(`#${id}`)!;
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const errorId = field.getAttribute('aria-describedby');
    expect(errorId).toBeTruthy();
    const error = region.querySelector<HTMLElement>(`#${errorId}`)!;
    expect(error.textContent?.trim()).toBe(message);
    expect(error.classList.contains('visually-hidden')).toBe(true);
    return field;
  }

  it('refuses an empty form, focuses the first invalid field and explains every required field', async () => {
    const { fixture, region } = await prepareAddForm();
    const name = region.querySelector('#subscription-name');
    expect(name?.getAttribute('aria-invalid')).not.toBe('true');
    clickAdd(region);
    fixture.detectChanges();

    expect(region.querySelector('[aria-label="Subscriptions"]')).toBeNull();
    expect(region.textContent).toContain('What are you paying for every month?');
    expect(document.activeElement).toBe(name);
    expectFieldError(region, 'subscription-name', 'Enter a subscription name.');
    expectFieldError(region, 'subscription-price', 'Enter a price.');
    expectFieldError(region, 'subscription-billing', 'Choose a billing frequency.');
    expectFieldError(region, 'subscription-currency', 'Choose a currency.');
    const status = region.querySelector<HTMLElement>('[role="status"]')!;
    expect(status.nextElementSibling).toBe(getButton(region, 'Add subscription'));
    expect(status.classList.contains('toast-visible')).toBe(true);
    expect(status.classList.contains('toast-error')).toBe(true);
    expect(status.textContent).toContain('Enter a subscription name.');
    expect(status.querySelector('[aria-hidden="true"]')?.textContent?.trim()).toBe('⚠');
  });

  it.each([
    ['subscription-name', '   ', 'Enter a subscription name.'],
    ['subscription-name', 'a'.repeat(41), 'Use a subscription name with at most 40 characters.'],
    ['subscription-price', '', 'Enter a price.'],
    ['subscription-price', '0', 'Enter a price greater than 0 with at most 2 decimal places.'],
    ['subscription-price', '-1', 'Enter a price greater than 0 with at most 2 decimal places.'],
    ['subscription-price', '9.999', 'Enter a price greater than 0 with at most 2 decimal places.'],
    ['subscription-billing', '', 'Choose a billing frequency.'],
    ['subscription-currency', '', 'Choose a currency.'],
  ])('refuses %s = %j with focus and an error toast', async (id, value, message) => {
    const { fixture, region } = await prepareAddForm();
    fillValidFields(region);
    setField(region, id, value);
    clickAdd(region);
    fixture.detectChanges();

    expect(region.querySelector('[aria-label="Subscriptions"]')).toBeNull();
    expect(document.activeElement).toBe(expectFieldError(region, id, message));
    const status = region.querySelector('[role="status"]');
    expect(status?.textContent).toContain(message);
    expect(status?.classList.contains('toast-error')).toBe(true);
  });

  it('moves focus through invalid fields in form order as they are corrected', async () => {
    const { fixture, region } = await prepareAddForm();
    const fields = [
      ['subscription-name', 'Spotify'],
      ['subscription-price', '0.07'],
      ['subscription-billing', 'yearly'],
      ['subscription-currency', 'GBP'],
    ];
    for (const [id, value] of fields) {
      clickAdd(region);
      fixture.detectChanges();
      expect(document.activeElement).toBe(region.querySelector(`#${id}`));
      setField(region, id, value);
      fixture.detectChanges();
      expect(region.querySelector(`#${id}`)?.getAttribute('aria-invalid')).not.toBe('true');
    }
    clickAdd(region);
    fixture.detectChanges();
    expect(getList(region, 'Subscriptions').querySelectorAll('article')).toHaveLength(1);
  });

  it('refuses a duplicate subscription name and lets a distinct name be added', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Netflix');
    await settlePage();

    setField(region, 'subscription-name', ' netflix ');
    setField(region, 'subscription-price', '19.99');
    setField(region, 'subscription-billing', 'yearly');
    clickAdd(region);
    fixture.detectChanges();

    const duplicateMessage =
      "You already have Netflix. Add something to tell them apart, like 'Netflix Family'.";
    const name = region.querySelector<HTMLElement>('#subscription-name')!;
    expect(getList(region, 'Subscriptions').querySelectorAll('article')).toHaveLength(1);
    expect(document.activeElement).toBe(name);
    expectFieldError(region, 'subscription-name', duplicateMessage);
    expect(region.querySelector('[role="status"]')?.textContent).toContain(duplicateMessage);

    setField(region, 'subscription-name', 'Netflix Family');
    clickAdd(region);
    fixture.detectChanges();

    expect(getList(region, 'Subscriptions').querySelectorAll('article')).toHaveLength(2);
  });

  it('keeps individual error descriptions after the toast hides and removes them on correction', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      clickAdd(region);
      fixture.detectChanges();
      const status = region.querySelector('[role="status"]');
      vi.advanceTimersByTime(TOAST_DURATION_MS + TOAST_FADE_MS);
      fixture.detectChanges();
      expect(status?.textContent).toBe('');
      expect(region.querySelector('[role="status"]')).toBe(status);

      for (const [id, value, message] of [
        ['subscription-name', 'Spotify', 'Enter a subscription name.'],
        ['subscription-price', '1.1', 'Enter a price.'],
        ['subscription-billing', 'monthly', 'Choose a billing frequency.'],
        ['subscription-currency', 'EUR', 'Choose a currency.'],
      ]) {
        const field = expectFieldError(region, id, message);
        const errorId = field.getAttribute('aria-describedby');
        setField(region, id, value);
        fixture.detectChanges();
        expect(field.getAttribute('aria-invalid')).not.toBe('true');
        expect(field.hasAttribute('aria-describedby')).toBe(false);
        expect(region.querySelector(`#${errorId}`)).toBeNull();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it('replaces repeated error messages, restarts the delay and returns to the success look', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      const status = region.querySelector<HTMLElement>('[role="status"]')!;
      clickAdd(region);
      fixture.detectChanges();
      const firstMessage = status.firstElementChild;
      vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
      clickAdd(region);
      fixture.detectChanges();
      expect(status.firstElementChild).not.toBe(firstMessage);
      expect(status.textContent).toContain('Enter a subscription name.');
      expect(status.classList.contains('toast-visible')).toBe(true);
      expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(status.classList.contains('toast-visible')).toBe(true);
      vi.advanceTimersByTime(TOAST_DURATION_MS + TOAST_FADE_MS);
      fixture.detectChanges();
      expect(status.textContent).toBe('');
      clickAdd(region);
      fixture.detectChanges();
      expect(status.classList.contains('toast-error')).toBe(true);
      expect(status.classList.contains('toast-visible')).toBe(true);

      fillValidFields(region);
      clickAdd(region);
      fixture.detectChanges();
      expect(status.textContent?.trim()).toBe('Subscription added');
      expect(status.classList.contains('toast-error')).toBe(false);
      expect(status.querySelector('[aria-hidden="true"]')).toBeNull();
      expect(region.querySelector('[aria-invalid="true"]')).toBeNull();
      expect(region.querySelector('[aria-describedby]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps invalid inputs and selects marked while focused and unfocused', async () => {
    const { fixture, region } = await prepareAddForm();
    clickAdd(region);
    fixture.detectChanges();
    for (const id of [
      'subscription-name',
      'subscription-price',
      'subscription-billing',
      'subscription-currency',
    ]) {
      const field = region.querySelector<HTMLElement>(`#${id}`)!;
      field.focus();
      fixture.detectChanges();
      expect(field.getAttribute('aria-invalid')).toBe('true');
      expect(field.getAttribute('aria-describedby')).toBeTruthy();
      field.blur();
      fixture.detectChanges();
      expect(field.getAttribute('aria-invalid')).toBe('true');
    }
  });

  it.each(['1.1', '0.07', '9.99'])(
    'saves a trimmed 40-character name with price %s',
    async (price) => {
      const { fixture, region } = await prepareAddForm();
      fillValidFields(region);
      const name = 'a'.repeat(40);
      setField(region, 'subscription-name', `  ${name}  `);
      setField(region, 'subscription-price', price);
      clickAdd(region);
      fixture.detectChanges();
      await settlePage();
      expect(getList(region, 'Subscriptions').querySelector('h3')?.textContent).toBe(name);
      // The saved state also keeps the trimmed name.
      const storage = TestBed.inject(AppStorage);
      expect((await storage.load())?.subscriptions[0].name).toBe(name);
    },
  );
});

describe('subscription storage', () => {
  const unreadableDataNotice =
    "Your saved data couldn't be read, so the app started empty. A copy of the old data was kept in this browser.";
  const onlyForThisVisitNotice =
    "Your browser couldn't save your changes, so they'll only last for this visit.";

  async function addThree(storage: InMemoryAppStorage) {
    const { fixture, root } = await renderApp(storage);
    const region = getRegion(root, 'Your recurring life.');
    getButton(region, 'Add your first subscription').click();
    fixture.detectChanges();
    for (const name of ['Spotify', 'Cloud', 'Gym']) {
      addSubscription(fixture, region, name);
    }
    return fixture;
  }

  it('reloads subscriptions in the order they were added', async () => {
    const storage = new InMemoryAppStorage();
    const fixture = await addThree(storage);
    await settlePage();
    fixture.destroy();

    const { root } = await renderApp(storage);
    const cards = getList(root, 'Subscriptions').querySelectorAll('article h3');
    expect(Array.from(cards, (card) => card.textContent?.trim())).toEqual([
      'Spotify',
      'Cloud',
      'Gym',
    ]);
  });

  it('serializes saves and coalesces quick additions to the latest state', async () => {
    const storage = new InMemoryAppStorage();
    storage.holdSaves();
    const fixture = await addThree(storage);
    expect(storage.activeSaves).toBe(1);
    expect(storage.maxActiveSaves).toBe(1);
    storage.releaseSaves();
    await settlePage();
    expect(storage.maxActiveSaves).toBe(1);
    expect(storage.savedStates).toHaveLength(2);
    expect(storage.savedStates.at(-1)?.subscriptions.map((entry) => entry.name)).toEqual([
      'Spotify',
      'Cloud',
      'Gym',
    ]);
    fixture.destroy();

    const { root } = await renderApp(storage);
    expect(getList(root, 'Subscriptions').querySelectorAll('article')).toHaveLength(3);
  });

  it('shows saved cards on a returning visit without empty-state text', async () => {
    const storage = new InMemoryAppStorage();
    const fixture = await addThree(storage);
    await settlePage();
    fixture.destroy();

    const { root } = await renderApp(storage);
    expect(root.textContent).toContain('Spotify');
    expect(root.textContent).not.toContain('What are you paying for every month?');
    expect(root.querySelector('app-storage-notice')?.textContent?.trim()).toBe('');
  });

  it('keeps an empty polite status region on a normal first visit', async () => {
    const { root } = await renderApp();
    const notice = root.querySelector('app-storage-notice');
    expect(notice).not.toBeNull();
    expect(notice?.getAttribute('role')).toBe('status');
    expect(notice?.textContent?.trim()).toBe('');
    expect(root.querySelector('app-top-bar')?.nextElementSibling).toBe(notice);
  });

  it('starts empty with an unreadable-data notice that survives a successful save', async () => {
    const storage = new InMemoryAppStorage();
    storage.rejectLoadsAsUnreadable = true;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { fixture, root } = await renderApp(storage);
      expect(root.textContent).toContain('What are you paying for every month?');
      const notice = root.querySelector('app-storage-notice');
      expect(notice?.textContent?.trim()).toBe(unreadableDataNotice);
      expect(warning).toHaveBeenCalled();
      const region = getRegion(root, 'Your recurring life.');
      getButton(region, 'Add your first subscription').click();
      fixture.detectChanges();
      addSubscription(fixture, region, 'Spotify');
      await settlePage();
      fixture.detectChanges();
      expect(notice?.textContent?.trim()).toBe(unreadableDataNotice);
    } finally {
      warning.mockRestore();
    }
  });

  it('keeps the unreadable-data notice when saving fails and later succeeds', async () => {
    const storage = new InMemoryAppStorage();
    storage.rejectLoadsAsUnreadable = true;
    storage.rejectSaves = true;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { fixture, root } = await renderApp(storage);
      const notice = root.querySelector('app-storage-notice');
      expect(notice?.textContent?.trim()).toBe(unreadableDataNotice);
      const region = getRegion(root, 'Your recurring life.');
      getButton(region, 'Add your first subscription').click();
      fixture.detectChanges();
      addSubscription(fixture, region, 'Spotify');
      await settlePage();
      fixture.detectChanges();
      expect(notice?.textContent).toContain(unreadableDataNotice);
      expect(notice?.textContent).toContain(onlyForThisVisitNotice);
      expect(warning).toHaveBeenCalledTimes(2);

      storage.rejectSaves = false;
      addSubscription(fixture, region, 'Cloud');
      await settlePage();
      fixture.detectChanges();
      expect(root.querySelector('app-storage-notice')).toBe(notice);
      expect(notice?.textContent?.trim()).toBe(unreadableDataNotice);
      expect(notice?.textContent).not.toContain(onlyForThisVisitNotice);
      expect(getList(root, 'Subscriptions').querySelectorAll('article')).toHaveLength(2);
      expect(warning).toHaveBeenCalledTimes(2);
    } finally {
      warning.mockRestore();
    }
  });

  it('renders the empty state when loading fails', async () => {
    const storage = new InMemoryAppStorage();
    storage.rejectLoads = true;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { fixture, root } = await renderApp(storage);
      expect(root.textContent).toContain('What are you paying for every month?');
      expect(root.querySelector('app-storage-notice')?.textContent?.trim()).toBe(
        onlyForThisVisitNotice,
      );
      const region = getRegion(root, 'Your recurring life.');
      getButton(region, 'Add your first subscription').click();
      fixture.detectChanges();
      addSubscription(fixture, region, 'Spotify');
      await settlePage();
      fixture.detectChanges();
      expect(getList(root, 'Subscriptions').textContent).toContain('Spotify');
      expect(warning).toHaveBeenCalled();
    } finally {
      warning.mockRestore();
    }
  });

  it('clears the only-for-this-visit storage notice after a failed load and successful save', async () => {
    const storage = new InMemoryAppStorage();
    storage.rejectLoads = true;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { fixture, root } = await renderApp(storage);
      const notice = root.querySelector('app-storage-notice');
      expect(notice?.textContent?.trim()).toBe(onlyForThisVisitNotice);
      const region = getRegion(root, 'Your recurring life.');
      getButton(region, 'Add your first subscription').click();
      fixture.detectChanges();
      addSubscription(fixture, region, 'Spotify');
      await settlePage();
      fixture.detectChanges();
      expect(root.querySelector('app-storage-notice')).toBe(notice);
      expect(notice?.textContent?.trim()).toBe('');
      expect(getList(root, 'Subscriptions').textContent).toContain('Spotify');
      expect(warning).toHaveBeenCalledTimes(1);
    } finally {
      warning.mockRestore();
    }
  });

  it('keeps working in memory and saves later changes after a failed save', async () => {
    const storage = new InMemoryAppStorage();
    storage.rejectSaves = true;
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const { fixture, root } = await renderApp(storage);
      const region = getRegion(root, 'Your recurring life.');
      getButton(region, 'Add your first subscription').click();
      fixture.detectChanges();
      addSubscription(fixture, region, 'Spotify');
      await settlePage();
      fixture.detectChanges();
      expect(getList(root, 'Subscriptions').textContent).toContain('Spotify');
      expect(root.querySelector('app-storage-notice')?.textContent?.trim()).toBe(
        onlyForThisVisitNotice,
      );
      expect(warning).toHaveBeenCalled();

      storage.rejectSaves = false;
      addSubscription(fixture, region, 'Cloud');
      await settlePage();
      fixture.detectChanges();
      expect(root.querySelector('app-storage-notice')?.textContent?.trim()).toBe('');
      expect((await storage.load())?.subscriptions.map((entry) => entry.name)).toEqual([
        'Spotify',
        'Cloud',
      ]);
    } finally {
      warning.mockRestore();
    }
  });
});
