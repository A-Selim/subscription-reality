import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppStorage } from './state/app-storage';
import { TOAST_DURATION_MS, TOAST_FADE_MS } from './toast/toast';
import { InMemoryAppStorage } from './testing/in-memory-app-storage';
import { SubscriptionsState } from './state/subscriptions-state';
import { renderApp } from './testing/render-app';
import { REASONS, USAGES, type Currency } from './domain/subscription';

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

function getButtonByAccessibleName(root: HTMLElement, name: string): HTMLButtonElement {
  const buttons = Array.from(root.querySelectorAll('button')).filter(
    (button) => button.getAttribute('aria-label') === name || button.textContent?.trim() === name,
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

function definitionValue(container: HTMLElement, label: string): string | undefined {
  return Array.from(container.querySelectorAll('dt'))
    .find((term) => term.textContent?.trim() === label)
    ?.nextElementSibling?.textContent?.trim();
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

async function prepareAddForm(storage = new InMemoryAppStorage()) {
  const { fixture, root: page } = await renderApp(storage);
  const region = getRegion(page, 'Your recurring life.');
  getButton(region, 'Add your first subscription').click();
  fixture.detectChanges();
  await settlePage();
  return { fixture, region, storage };
}

function addSubscription(
  fixture: ComponentFixture<App>,
  region: HTMLElement,
  name: string,
  currency: Currency = 'EUR',
): void {
  setField(region, 'subscription-name', name);
  setField(region, 'subscription-price', '9.99');
  setField(region, 'subscription-billing', 'monthly');
  setField(region, 'subscription-currency', currency);
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

function stubDialogRect(dialog: HTMLDialogElement): void {
  vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 420, 300));
}

function clickDialogBackdrop(dialog: HTMLDialogElement): void {
  clickDialogAt(dialog, 50, 50);
}

function clickDialogAt(dialog: HTMLDialogElement, clientX: number, clientY: number): void {
  dialog.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX, clientY }));
  dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX, clientY }));
}

describe('App page seam', () => {
  async function prepareEdit() {
    const { fixture, region, storage } = await prepareAddForm();
    setField(region, 'subscription-name', 'Spotify');
    setField(region, 'subscription-price', '10');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();
    return { fixture, region, storage };
  }

  function editField(region: HTMLElement, label: string): HTMLInputElement | HTMLSelectElement {
    const form = region.querySelector('dialog form');
    const fieldLabel = Array.from(form?.querySelectorAll('label') ?? []).find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    const field = form?.querySelector<HTMLInputElement | HTMLSelectElement>(
      `#${fieldLabel?.htmlFor}`,
    );
    if (!field) throw new Error(`Could not find edit field "${label}".`);
    return field;
  }

  async function openEdit(name = 'Spotify') {
    const context = await prepareEdit();
    addSubscription(context.fixture, context.region, 'Netflix');
    await settlePage();
    getButton(getList(context.region, 'Subscriptions'), name).click();
    context.fixture.detectChanges();
    await settlePage();
    return context;
  }

  function expectEditError(region: HTMLElement, label: string, message: string) {
    const field = editField(region, label);
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const description = field.getAttribute('aria-describedby');
    expect(description).toBeTruthy();
    expect(region.querySelector(`#${description}`)?.textContent).toBe(message);
    return field;
  }

  it('keeps the saved price in Recurring cost and persistently describes an empty edit price', async () => {
    const { fixture, region, storage } = await openEdit();
    const reality = getRegion(fixture.nativeElement, 'See the reality.');
    const before = reality.textContent;
    setField(region, editField(region, 'Price').id, '');
    await settlePage();
    expectEditError(region, 'Price', 'Enter a price.');
    expect(reality.textContent).toBe(before);
    expect((await storage.load())?.subscriptions[0].price).toBe(10);
    editField(region, 'Price').blur();
    fixture.detectChanges();
    expectEditError(region, 'Price', 'Enter a price.');
    setField(region, editField(region, 'Price').id, '12');
    await settlePage();
    expect(editField(region, 'Price').hasAttribute('aria-describedby')).toBe(false);
    expect(reality.textContent).toBe(before);
    expect(region.querySelector('dialog .other-unit')?.textContent).toBe('€120 / year');
    expect((await storage.load())?.subscriptions[0].price).toBe(10);
  });

  it.each(['Done', 'Enter'])(
    'keeps an invalid editor open on %s, announces the error above Done and focuses price',
    async (action) => {
      const { fixture, region } = await openEdit();
      const price = editField(region, 'Price');
      setField(region, price.id, '');
      await settlePage();
      const form = price.closest('form')!;
      const done = getButton(form, 'Done');
      if (action === 'Done') done.click();
      else {
        price.focus();
        price.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        // jsdom does not implement implicit form submission from Enter.
        form.requestSubmit();
      }
      fixture.detectChanges();
      await settlePage();
      expect(region.querySelector('dialog form')).toBe(form);
      const toast = form.querySelector('[role="status"]')!;
      expect(toast.textContent).toContain('Enter a price.');
      expect(toast.classList.contains('toast-error')).toBe(true);
      expect(done.previousElementSibling).toBe(toast);
      expect(document.activeElement).toBe(price);
      vi.useFakeTimers();
      try {
        vi.advanceTimersByTime(10_000);
        fixture.detectChanges();
        expect(toast.textContent).toContain('Enter a price.');
        expectEditError(region, 'Price', 'Enter a price.');
        setField(region, editField(region, 'Subscription name').id, 'Spotify Plus');
        fixture.detectChanges();
        expect(toast.classList.contains('toast-visible')).toBe(true);
        expect(toast.textContent).toContain('Enter a price.');
        setField(region, price.id, '12');
        fixture.detectChanges();
        expect(toast.classList.contains('toast-visible')).toBe(false);
        expect(toast.textContent).toContain('Enter a price.');
        vi.advanceTimersByTime(TOAST_FADE_MS);
        fixture.detectChanges();
        expect(toast.textContent).toBe('');
        expect(price.getAttribute('aria-invalid')).not.toBe('true');
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('focuses the first invalid edit field in form order', async () => {
    const { fixture, region } = await openEdit();
    const name = editField(region, 'Subscription name');
    const price = editField(region, 'Price');
    setField(region, price.id, '');
    setField(region, name.id, '');
    await settlePage();
    getButton(region, 'Done').click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(name);
    expect(name.closest('form')?.querySelector('[role="status"]')?.textContent).toContain(
      'Enter a subscription name.',
    );
    setField(region, name.id, 'Spotify');
    await settlePage();
    getButton(region, 'Done').click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(price);
  });

  it('refuses a trimmed case-insensitive rename to another subscription', async () => {
    const { region, storage } = await openEdit();
    setField(region, editField(region, 'Subscription name').id, ' netflix ');
    await settlePage();
    expectEditError(region, 'Subscription name', 'You already have Netflix.');
    expect((await storage.load())?.subscriptions.map(({ name }) => name)).toEqual([
      'Spotify',
      'Netflix',
    ]);
  });

  it('allows and applies a case-only rename of the edited subscription', async () => {
    const { fixture, region, storage } = await openEdit('Netflix');
    const name = editField(region, 'Subscription name');
    expect(name.getAttribute('aria-invalid')).not.toBe('true');
    setField(region, name.id, 'NETFLIX');
    await settlePage();
    expect(name.getAttribute('aria-invalid')).not.toBe('true');
    expect((await storage.load())?.subscriptions[1].name).toBe('Netflix');
    const editForm = region.querySelector('dialog form')!;
    expect(editForm.hasAttribute('aria-label')).toBe(false);
    expect(editForm.getAttribute('aria-labelledby')).toBe('edit-title');
    const editTitle = region.querySelector('#edit-title');
    expect(editTitle?.textContent?.trim()).toBe('Edit Netflix');
    expect(editTitle?.classList.contains('visually-hidden')).toBe(true);
    getButton(region, 'Done').click();
    fixture.detectChanges();
    await settlePage();
    expect(getButton(getList(region, 'Subscriptions'), 'NETFLIX')).toBeDefined();
    expect((await storage.load())?.subscriptions[1].name).toBe('NETFLIX');
  });

  for (const close of ['Close', 'Escape', 'native close']) {
    it(`discards the whole invalid draft on ${close} without saving, returns focus and reopens clean`, async () => {
      const { fixture, region, storage } = await openEdit();
      const savesBefore = storage.savedStates.length;
      const dialog = region.querySelector<HTMLDialogElement>('dialog')!;
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('Changes save when you press Done.');
      expect(
        Array.from(dialog.querySelectorAll('button'), (button) => button.textContent?.trim()),
      ).toEqual(['✕', 'Done']);
      expect(
        document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent?.trim(),
      ).toBe('Edit Spotify');
      expect(region.querySelectorAll('article form')).toHaveLength(0);
      expect(region.querySelectorAll('[aria-label^="Delete "]')).toHaveLength(2);
      setField(region, editField(region, 'Price').id, '12');
      setField(region, editField(region, 'Reason').id, 'Occasional Use');
      await settlePage();
      expect((await storage.load())?.subscriptions[0].price).toBe(10);
      expect(dialog.querySelector('.other-unit')?.textContent).toBe('€120 / year');
      setField(region, editField(region, 'Subscription name').id, '');
      await settlePage();
      getButton(region, 'Done').click();
      await settlePage();
      expect(dialog.open).toBe(true);
      if (close === 'Close') getButtonByAccessibleName(dialog, 'Close').click();
      else if (close === 'Escape') dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
      else dialog.close();
      await settlePage();
      expect(dialog.open).toBe(false);
      expect(storage.savedStates).toHaveLength(savesBefore);
      expect(
        getRegion(fixture.nativeElement as HTMLElement, 'See the reality.').textContent,
      ).toContain('€240');
      expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Spotify'));
      expect((await storage.load())?.subscriptions[0]).toMatchObject({
        name: 'Spotify',
        price: 10,
        reason: 'Essential',
        usage: 'Daily',
        usageConfirmed: false,
        decision: null,
      });
      getButton(getList(region, 'Subscriptions'), 'Spotify').click();
      await settlePage();
      expect(editField(region, 'Price').value).toBe('10');
      expect(editField(region, 'Subscription name').value).toBe('Spotify');
      expect(region.querySelector('dialog [role="status"]')?.textContent?.trim()).toBeFalsy();
      const reloaded = await renderApp(storage);
      const reloadedRegion = getRegion(reloaded.root, 'Your recurring life.');
      getButton(getList(reloadedRegion, 'Subscriptions'), 'Spotify').click();
      await settlePage();
      expect(editField(reloadedRegion, 'Price').value).toBe('10');
      expect(editField(reloadedRegion, 'Subscription name').value).toBe('Spotify');
      expect(editField(reloadedRegion, 'Subscription name').getAttribute('aria-invalid')).not.toBe(
        'true',
      );
      expect(
        reloadedRegion.querySelector('dialog [role="status"]')?.textContent?.trim(),
      ).toBeFalsy();
    });
    it(`discards valid drafts on ${close} without saving and returns focus`, async () => {
      const { region, storage } = await openEdit();
      const savesBefore = storage.savedStates.length;
      setField(region, editField(region, 'Price').id, '12');
      await settlePage();
      const dialog = region.querySelector<HTMLDialogElement>('dialog')!;
      if (close === 'Close') getButtonByAccessibleName(dialog, 'Close').click();
      else if (close === 'Escape') dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
      else dialog.close();
      await settlePage();
      expect(dialog.open).toBe(false);
      expect(storage.savedStates).toHaveLength(savesBefore);
      expect((await storage.load())?.subscriptions[0].price).toBe(10);
      expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Spotify'));
      getButton(getList(region, 'Subscriptions'), 'Spotify').click();
      await settlePage();
      expect(editField(region, 'Price').value).toBe('10');
      expect(region.querySelector('dialog [role="status"]')?.textContent?.trim()).toBeFalsy();
    });
  }

  it('discards an edit draft on a backdrop click and returns focus to the card', async () => {
    const { region, storage } = await openEdit();
    const savesBefore = storage.savedStates.length;
    const dialog = region.querySelector<HTMLDialogElement>('dialog')!;
    stubDialogRect(dialog);
    setField(region, editField(region, 'Price').id, '12');
    await settlePage();

    clickDialogBackdrop(dialog);
    await settlePage();

    expect(dialog.open).toBe(false);
    expect(storage.savedStates).toHaveLength(savesBefore);
    expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Spotify'));
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    await settlePage();
    expect(editField(region, 'Price').value).toBe('10');
  });

  it('does not close an edit dialog from its padding or a field drag ending on the backdrop', async () => {
    const { region } = await openEdit();
    const dialog = region.querySelector<HTMLDialogElement>('dialog')!;
    stubDialogRect(dialog);

    clickDialogAt(dialog, 110, 110);
    expect(dialog.open).toBe(true);

    const name = editField(region, 'Subscription name');
    name.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true, clientX: 120, clientY: 120 }),
    );
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 50, clientY: 50 }));
    await settlePage();
    expect(dialog.open).toBe(true);
  });

  it('discards all draft details and preserves the original unconfirmed Usage without changing review or currency preferences', async () => {
    const { fixture, region, storage } = await prepareEdit();
    const review = getRegion(
      getRegion(fixture.nativeElement, 'Would you still subscribe today?'),
      'Spotify',
    );
    getButton(review, 'Weekly').click();
    await settlePage();
    const snapshot = (await storage.load())!;
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    await settlePage();
    for (const [label, value] of [
      ['Subscription name', 'Spotify Plus'],
      ['Price', '12'],
      ['Billing frequency', 'yearly'],
      ['Currency', 'USD'],
      ['Reason', 'Occasional Use'],
    ]) {
      setField(region, editField(region, label).id, value);
      await settlePage();
    }
    expect(await storage.load()).toEqual(snapshot);
    setField(region, editField(region, 'Price').id, '');
    await settlePage();
    getButtonByAccessibleName(region, 'Close').click();
    await settlePage();
    expect(await storage.load()).toEqual(snapshot);
  });

  it('opens one prefilled edit form when its native button is activated', async () => {
    const { fixture, region } = await prepareEdit();
    for (const key of [null, 'Enter', ' ']) {
      const button = getButton(getList(region, 'Subscriptions'), 'Spotify');
      expect(button.tagName).toBe('BUTTON');
      expect(button.type).toBe('button');
      button.focus();
      // jsdom does not implement the browser default keyboard activation of buttons.
      if (key) button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      button.click();
      fixture.detectChanges();
      await settlePage();
      expect(editField(region, 'Subscription name').value).toBe('Spotify');
      expect(editField(region, 'Price').value).toBe('10');
      expect(editField(region, 'Billing frequency').value).toBe('monthly');
      expect(editField(region, 'Currency').value).toBe('EUR');
      expect(editField(region, 'Reason').value).toBe('Essential');
      expect(document.activeElement).toBe(editField(region, 'Subscription name'));
      getButton(region, 'Done').click();
      fixture.detectChanges();
      await settlePage();
    }
    addSubscription(fixture, region, 'Netflix');
    await settlePage();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    getButton(region, 'Done').click();
    await settlePage();
    getButton(getList(region, 'Subscriptions'), 'Netflix').click();
    fixture.detectChanges();
    await settlePage();
    expect(region.querySelectorAll('dialog form')).toHaveLength(1);
    expect(editField(region, 'Subscription name').value).toBe('Netflix');
  });

  it('keeps the other-unit header on saved values and updates it after Done', async () => {
    const { fixture, region, storage } = await prepareEdit();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    const savesBefore = storage.savedStates.length;
    setField(region, editField(region, 'Price').id, '12');
    await settlePage();
    expect(getRegion(fixture.nativeElement, 'See the reality.').textContent).toContain('€120');
    expect(region.querySelector('dialog .other-unit')?.textContent).toBe('€120 / year');
    expect(storage.savedStates).toHaveLength(savesBefore);
    getButton(region, 'Done').click();
    await settlePage();
    expect(getRegion(fixture.nativeElement, 'See the reality.').textContent).toContain('€144');
    expect(storage.savedStates).toHaveLength(savesBefore + 1);
    expect((await storage.load())?.subscriptions[0].price).toBe(12);
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    await settlePage();
    expect(region.querySelector('dialog .other-unit')?.textContent).toBe('€144 / year');
    const { root } = await renderApp(storage);
    expect(getList(getRegion(root, 'Your recurring life.'), 'Subscriptions').textContent).toContain(
      '€12.00',
    );
  });

  it('preserves a reason changed in Review when the open edit form changes price', async () => {
    const { fixture, region, storage } = await prepareEdit();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    const review = getRegion(
      getRegion(fixture.nativeElement, 'Would you still subscribe today?'),
      'Spotify',
    );
    getButton(review, 'Convenience').click();
    await settlePage();
    setField(region, editField(region, 'Price').id, '12');
    await settlePage();
    getButton(region, 'Done').click();
    await settlePage();
    const saved = await storage.load();
    expect(saved?.subscriptions[0].reason).toBe('Convenience');
    expect(saved?.subscriptions[0].price).toBe(12);
  });

  it('re-estimates unconfirmed Daily Usage as Rarely when editing Reason to Occasional Use', async () => {
    const { fixture, region, storage } = await openEdit();
    setField(region, editField(region, 'Reason').id, 'Occasional Use');
    await settlePage();
    getButton(region, 'Done').click();
    fixture.detectChanges();
    await settlePage();
    expect(getList(region, 'Subscriptions').children[0].textContent).toContain('Usage: Rarely');
    const review = getRegion(
      getRegion(fixture.nativeElement, 'Would you still subscribe today?'),
      'Spotify',
    );
    expect(getButton(review, 'Rarely').getAttribute('aria-pressed')).toBe('true');
    expect((await storage.load())?.subscriptions[0]).toMatchObject({
      usage: 'Rarely',
      usageConfirmed: false,
      decision: null,
    });
  });

  it('keeps confirmed Daily Usage when editing Reason to Occasional Use', async () => {
    const { fixture, region, storage } = await prepareEdit();
    const review = getRegion(
      getRegion(fixture.nativeElement, 'Would you still subscribe today?'),
      'Spotify',
    );
    await decide(fixture, review, 'Keep');
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Reason').id, 'Occasional Use');
    await settlePage();
    getButton(region, 'Done').click();
    fixture.detectChanges();
    await settlePage();
    expect(getList(region, 'Subscriptions').children[0].textContent).toContain('Usage: Daily');
    expect((await storage.load())?.subscriptions[0]).toMatchObject({
      reason: 'Occasional Use',
      usage: 'Daily',
      usageConfirmed: true,
    });
  });

  it('keeps the Keep Review decision and Potential savings counts while editing', async () => {
    const { fixture, region, storage } = await prepareEdit();
    const review = getRegion(
      getRegion(fixture.nativeElement, 'Would you still subscribe today?'),
      'Spotify',
    );
    await decide(fixture, review, 'Keep');
    const counts = getList(
      getRegion(fixture.nativeElement, 'Potential annual savings'),
      'Review decision counts',
    );
    const before = counts.textContent;
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Price').id, '12');
    setField(region, editField(region, 'Reason').id, 'Occasional Use');
    await settlePage();
    getButton(region, 'Done').click();
    await settlePage();
    expect(counts.textContent).toBe(before);
    expect((await storage.load())?.subscriptions[0].decision).toBe('keep');
    getButton(review, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
    expect(getButton(review, 'Keep').getAttribute('aria-pressed')).toBe('true');
  });

  it('keeps Preferred currency EUR after editing an old subscription to USD and reloading', async () => {
    const { fixture, region, storage } = await openEdit();
    setField(region, editField(region, 'Currency').id, 'USD');
    await settlePage();
    getButton(region, 'Done').click();
    await settlePage();
    expect((await storage.load())?.subscriptions[0].currency).toBe('USD');
    fixture.destroy();
    const { root } = await renderApp(storage);
    const addCurrency = getRegion(root, 'Your recurring life.').querySelector<HTMLSelectElement>(
      '#subscription-currency',
    );
    expect(addCurrency?.value).toBe('EUR');
  });

  it('shows the saved monthly cost under a yearly subscription price', async () => {
    const { fixture, region } = await prepareEdit();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Billing frequency').id, 'yearly');
    setField(region, editField(region, 'Price').id, '120');
    await settlePage();
    expect(region.querySelector('dialog .other-unit')?.textContent).toBe('€120 / year');
    getButton(region, 'Done').click();
    await settlePage();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    await settlePage();
    expect(region.querySelector('dialog .other-unit')?.textContent).toBe('€10.00 / month');
  });

  it('closes with Done, shows edited values and returns focus to the card button', async () => {
    const { fixture, region } = await prepareEdit();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Subscription name').id, 'Spotify Family');
    setField(region, editField(region, 'Price').id, '12');
    await settlePage();
    getButton(region, 'Done').click();
    fixture.detectChanges();
    await settlePage();
    expect(region.querySelector('dialog form')).toBeNull();
    expect(region.querySelector('article')?.textContent).toContain('€12.00');
    expect(document.activeElement).toBe(
      getButton(getList(region, 'Subscriptions'), 'Spotify Family'),
    );
  });

  it('reloads saved values when a draft has not been submitted', async () => {
    const { fixture, region, storage } = await prepareEdit();
    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Price').id, '12');
    await settlePage();
    fixture.destroy();
    const { root } = await renderApp(storage);
    const card = getList(getRegion(root, 'Your recurring life.'), 'Subscriptions');
    expect(card.textContent).toContain('€10.00');
    expect(card.textContent).toContain('Annual cost €120');
  });

  it('shows aria-hidden invalid marks only beside invalid add and edit fields', async () => {
    const { fixture, region } = await openEdit();
    const addName = region.querySelector<HTMLInputElement>('#subscription-name')!;
    const addPrice = region.querySelector<HTMLInputElement>('#subscription-price')!;

    clickAdd(region);
    fixture.detectChanges();
    const addPriceWrapper = addPrice.parentElement;
    expect(addPriceWrapper).not.toBeNull();
    const addMark = addPriceWrapper!.querySelector<HTMLElement>('.invalid-field-mark');
    expect(addMark).not.toBeNull();
    expect(addMark!.getAttribute('aria-hidden')).toBe('true');
    const addNameWrapper = addName.parentElement;
    expect(addNameWrapper).not.toBeNull();
    expect(addNameWrapper!.querySelector('.invalid-field-mark')).not.toBeNull();

    const addBilling = region.querySelector<HTMLSelectElement>('#subscription-billing')!;
    const addBillingWrapper = addBilling.parentElement;
    expect(addBillingWrapper).not.toBeNull();
    expect(addBillingWrapper!.querySelector('.invalid-field-mark')).not.toBeNull();

    setField(region, addName.id, 'YouTube');
    fixture.detectChanges();
    expect(addNameWrapper!.querySelector('.invalid-field-mark')).toBeNull();

    const editName = editField(region, 'Subscription name');
    const editPrice = editField(region, 'Price');
    setField(region, editPrice.id, '');
    await settlePage();
    const editPriceWrapper = editPrice.parentElement;
    expect(editPriceWrapper).not.toBeNull();
    const editMark = editPriceWrapper!.querySelector<HTMLElement>('.invalid-field-mark');
    expect(editMark).not.toBeNull();
    expect(editMark!.getAttribute('aria-hidden')).toBe('true');
    const editNameWrapper = editName.parentElement;
    expect(editNameWrapper).not.toBeNull();
    expect(editNameWrapper!.querySelector('.invalid-field-mark')).toBeNull();

    setField(region, editName.id, '');
    await settlePage();
    expect(editNameWrapper!.querySelector('.invalid-field-mark')).not.toBeNull();

    const editBilling = editField(region, 'Billing frequency') as HTMLSelectElement;
    setField(region, editBilling.id, '');
    await settlePage();
    const editBillingWrapper = editBilling.parentElement;
    expect(editBillingWrapper).not.toBeNull();
    expect(editBillingWrapper!.querySelector('.invalid-field-mark')).not.toBeNull();
  });

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

  it('reveals the add form and focuses its name field from Start adding on an empty page', async () => {
    const { fixture, root: page } = await renderApp();
    const region = getRegion(page, 'Your recurring life.');

    getButton(page, 'Start adding').click();
    fixture.detectChanges();
    await settlePage();

    expect(region.querySelector('form')).not.toBeNull();
    expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
  });

  it('focuses the visible add form name field from Start adding with subscriptions present', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify');
    await settlePage();
    getButton(region, 'Add subscription').focus();

    getButton(fixture.nativeElement as HTMLElement, 'Start adding').click();
    fixture.detectChanges();
    await settlePage();

    expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
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
      expect(getComputedStyle(status!).maxWidth).toBe('360px');
      expect(getComputedStyle(status!).boxSizing).toBe('border-box');

      addSubscription(fixture, region, 'First');
      expect(status?.textContent?.trim()).toBe('Subscription added');
      expect(document.activeElement).toBe(
        getRegion(fixture.nativeElement as HTMLElement, 'See the reality.').querySelector('h2'),
      );

      vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
      fixture.detectChanges();
      expect(status?.classList.contains('toast-visible')).toBe(true);
      vi.advanceTimersByTime(1);
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
      await vi.advanceTimersByTimeAsync(0);
      await settlePage();
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
    expect(definitionValue(reality, 'Before review')).toBe('0 / year');
    expect(definitionValue(reality, 'If you cancel the ones you no longer value')).toBe('0 / year');
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

    const duplicateMessage = 'You already have Netflix.';
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

  it('keeps an add error toast until its reported field changes and preserves error descriptions', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      clickAdd(region);
      fixture.detectChanges();
      const status = region.querySelector('[role="status"]');
      vi.advanceTimersByTime(10_000);
      fixture.detectChanges();
      expect(status?.textContent).toContain('Enter a subscription name.');
      expect(region.querySelector('[role="status"]')).toBe(status);

      setField(region, 'subscription-reason', 'Nice to Have');
      fixture.detectChanges();
      expect(status?.classList.contains('toast-visible')).toBe(true);
      expect(status?.textContent).toContain('Enter a subscription name.');
      setField(region, 'subscription-name', ' ');
      fixture.detectChanges();
      expect(status?.classList.contains('toast-visible')).toBe(false);
      expect(status?.textContent).toContain('Enter a subscription name.');
      expectFieldError(region, 'subscription-name', 'Enter a subscription name.');
      vi.advanceTimersByTime(TOAST_FADE_MS);
      fixture.detectChanges();
      expect(status?.textContent).toBe('');

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
        if (id === 'subscription-name') expect(status?.textContent).toBe('');
        expect(field.getAttribute('aria-invalid')).not.toBe('true');
        expect(field.hasAttribute('aria-describedby')).toBe(false);
        expect(region.querySelector(`#${errorId}`)).toBeNull();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it('replaces a fading success toast with an error and returns to the success look', async () => {
    const { fixture, region } = await prepareAddForm();
    vi.useFakeTimers();
    try {
      const status = region.querySelector<HTMLElement>('[role="status"]')!;
      fillValidFields(region);
      clickAdd(region);
      fixture.detectChanges();
      const firstMessage = status.firstElementChild;
      vi.advanceTimersByTime(TOAST_DURATION_MS);
      fixture.detectChanges();
      expect(status.classList.contains('toast-visible')).toBe(false);
      vi.advanceTimersByTime(TOAST_FADE_MS / 2);
      setField(region, 'subscription-name', '');
      clickAdd(region);
      fixture.detectChanges();
      expect(status.firstElementChild).not.toBe(firstMessage);
      expect(status.textContent).toContain('Enter a subscription name.');
      expect(status.classList.contains('toast-visible')).toBe(true);
      expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
      vi.advanceTimersByTime(10_000);
      fixture.detectChanges();
      expect(status.classList.contains('toast-visible')).toBe(true);
      setField(region, 'subscription-name', 'Spotify Again');
      fillValidFields(region);
      setField(region, 'subscription-name', 'Second');
      fixture.detectChanges();
      expect(status.classList.contains('toast-visible')).toBe(false);
      expect(status.textContent).toContain('Enter a subscription name.');
      clickAdd(region);
      fixture.detectChanges();
      expect(status.textContent?.trim()).toBe('Subscription added');
      expect(status.classList.contains('toast-error')).toBe(false);
      expect(status.querySelector('[aria-hidden="true"]')).toBeNull();
      expect(region.querySelector('[aria-invalid="true"]')).toBeNull();
      expect(region.querySelector('[aria-describedby]')).toBeNull();
      vi.advanceTimersByTime(TOAST_DURATION_MS - 1);
      fixture.detectChanges();
      expect(status.classList.contains('toast-visible')).toBe(true);
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(status.classList.contains('toast-visible')).toBe(false);
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
      expect(getList(region, 'Subscriptions').querySelector('h3 button')?.textContent?.trim()).toBe(
        name,
      );
      // The saved state also keeps the trimmed name.
      const storage = TestBed.inject(AppStorage);
      expect((await storage.load())?.subscriptions[0].name).toBe(name);
    },
  );
});

describe('Preferred currency', () => {
  async function addUsdSubscription() {
    const { fixture, region, storage } = await prepareAddForm();
    setField(region, 'subscription-reason', 'Occasional Use');
    addSubscription(fixture, region, 'Spotify', 'USD');
    await settlePage();
    return { fixture, region, storage };
  }

  it('resets the add form with USD as the Preferred currency after creating a subscription', async () => {
    const { region } = await addUsdSubscription();

    expect(getList(region, 'Subscriptions').querySelectorAll('article')).toHaveLength(1);
    expect(region.querySelector<HTMLInputElement>('#subscription-name')?.value).toBe('');
    expect(region.querySelector<HTMLInputElement>('#subscription-price')?.value).toBe('');
    expect(region.querySelector<HTMLSelectElement>('#subscription-billing')?.value).toBe('');
    expect(region.querySelector<HTMLSelectElement>('#subscription-reason')?.value).toBe(
      'Essential',
    );
    expect(region.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe('USD');
  });

  it('creates a USD subscription, changes the dropdown to GBP without adding, and reloads with USD', async () => {
    const { fixture, region, storage } = await addUsdSubscription();
    setField(region, 'subscription-currency', 'GBP');
    fixture.detectChanges();
    await settlePage();
    expect(region.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe('GBP');
    fixture.destroy();

    const { root } = await renderApp(storage);
    const reloadedRegion = getRegion(root, 'Your recurring life.');
    expect(reloadedRegion.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe(
      'USD',
    );
    expect(getList(reloadedRegion, 'Subscriptions').querySelectorAll('article')).toHaveLength(1);
  });

  it('reloads with EGP as the Preferred currency after creating a later subscription in EGP', async () => {
    const { fixture, region, storage } = await addUsdSubscription();
    addSubscription(fixture, region, 'Gym', 'EGP');
    await settlePage();
    expect(region.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe('EGP');
    fixture.destroy();

    const { root } = await renderApp(storage);
    const reloadedRegion = getRegion(root, 'Your recurring life.');
    expect(reloadedRegion.querySelector<HTMLSelectElement>('#subscription-currency')?.value).toBe(
      'EGP',
    );
    expect(getList(reloadedRegion, 'Subscriptions').querySelectorAll('article')).toHaveLength(2);
  });
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

describe('Subscription reality', () => {
  it('shows one named card when subscriptions share a currency', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify');
    await settlePage();
    addSubscription(fixture, region, 'Cloud');
    await settlePage();
    const reality = getRegion(fixture.nativeElement as HTMLElement, 'See the reality.');
    const cards = reality.querySelectorAll('.reality-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].getAttribute('aria-label')).toBe('Subscription reality in EUR');
  });

  it('shows separate Recurring cost and counts in first-used currency order', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify', 'EUR');
    await settlePage();
    addSubscription(fixture, region, 'Cloud', 'USD');
    await settlePage();
    setField(region, 'subscription-reason', 'Occasional Use');
    addSubscription(fixture, region, 'Adobe', 'EUR');
    await settlePage();
    const reality = getRegion(fixture.nativeElement as HTMLElement, 'See the reality.');
    const cards = reality.querySelectorAll<HTMLElement>('.reality-card');
    expect(cards).toHaveLength(2);
    const expected = [
      {
        currency: 'EUR',
        annual: '€240',
        monthly: '€19.98 every month',
        subscriptions: '2',
        rarelyUsed: '1',
      },
      {
        currency: 'USD',
        annual: '$120',
        monthly: '$9.99 every month',
        subscriptions: '1',
        rarelyUsed: '0',
      },
    ];
    expected.forEach((cost, index) => {
      const card = cards[index];
      expect(card.getAttribute('aria-label')).toBe(`Subscription reality in ${cost.currency}`);
      expect(card.querySelector('.annual')?.textContent?.trim()).toBe(cost.annual);
      expect(card.querySelector('.monthly')?.textContent?.trim()).toBe(cost.monthly);
      expect(definitionValue(card, 'Subscriptions')).toBe(cost.subscriptions);
      expect(definitionValue(card, 'Rarely used')).toBe(cost.rarelyUsed);
      expect(definitionValue(card, 'Before review')).toBe(`${cost.annual} / year`);
      expect(definitionValue(card, 'If you cancel the ones you no longer value')).toBe(
        `${cost.annual} / year`,
      );
    });
  });

  it('updates Recurring cost and subscription count after monthly and yearly adds', async () => {
    const { fixture, region } = await prepareAddForm();
    const reality = getRegion(fixture.nativeElement as HTMLElement, 'See the reality.');
    setField(region, 'subscription-name', 'Spotify');
    setField(region, 'subscription-price', '10');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();
    expect(reality.querySelector('.annual')?.textContent?.trim()).toBe('€120');
    expect(reality.querySelector('.monthly')?.textContent?.trim()).toBe('€10.00 every month');
    expect(reality.querySelector('.label')?.textContent?.trim()).toBe('Your subscription reality');
    expect(reality.classList.contains('live')).toBe(true);
    expect(definitionValue(reality, 'Subscriptions')).toBe('1');
    expect(reality.textContent).not.toContain('Add a subscription first');
    expect(definitionValue(reality, 'Before review')).toBe('€120 / year');
    expect(definitionValue(reality, 'If you cancel the ones you no longer value')).toBe(
      '€120 / year',
    );

    setField(region, 'subscription-name', 'Cloud storage');
    setField(region, 'subscription-price', '60');
    setField(region, 'subscription-billing', 'yearly');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();
    expect(reality.querySelector('.annual')?.textContent?.trim()).toBe('€180');
    expect(reality.querySelector('.monthly')?.textContent?.trim()).toBe('€15.00 every month');
    expect(definitionValue(reality, 'Subscriptions')).toBe('2');
  });

  it('shows the annual total before review and after Cancel decisions', async () => {
    const { fixture, region } = await prepareAddForm();
    setField(region, 'subscription-name', 'Streaming');
    setField(region, 'subscription-price', '10');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();
    setField(region, 'subscription-name', 'Cloud storage');
    setField(region, 'subscription-price', '60');
    setField(region, 'subscription-billing', 'yearly');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();

    const page = fixture.nativeElement as HTMLElement;
    const card = page.querySelector<HTMLElement>('[aria-label="Subscription reality in EUR"]')!;
    expect(card.querySelector('.annual')?.textContent?.trim()).toBe('€180');
    expect(definitionValue(card, 'Before review')).toBe('€180 / year');
    expect(definitionValue(card, 'If you cancel the ones you no longer value')).toBe('€180 / year');

    const review = getRegion(getRegion(page, 'Would you still subscribe today?'), 'Streaming');
    await decide(fixture, review, 'Cancel');

    expect(card.querySelector('.annual')?.textContent?.trim()).toBe('€180');
    expect(definitionValue(card, 'Before review')).toBe('€180 / year');
    expect(definitionValue(card, 'If you cancel the ones you no longer value')).toBe('€60 / year');
  });

  it('keeps before and after totals separate for each currency', async () => {
    const { fixture, region } = await prepareAddForm();
    setField(region, 'subscription-name', 'Euro subscription');
    setField(region, 'subscription-price', '10');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();
    setField(region, 'subscription-name', 'Dollar subscription');
    setField(region, 'subscription-price', '24');
    setField(region, 'subscription-billing', 'yearly');
    setField(region, 'subscription-currency', 'USD');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();

    const page = fixture.nativeElement as HTMLElement;
    const review = getRegion(
      getRegion(page, 'Would you still subscribe today?'),
      'Euro subscription',
    );
    await decide(fixture, review, 'Cancel');

    const euroCard = page.querySelector<HTMLElement>('[aria-label="Subscription reality in EUR"]')!;
    const dollarCard = page.querySelector<HTMLElement>(
      '[aria-label="Subscription reality in USD"]',
    )!;
    expect(definitionValue(euroCard, 'Before review')).toBe('€120 / year');
    expect(definitionValue(euroCard, 'If you cancel the ones you no longer value')).toBe(
      '€0 / year',
    );
    expect(definitionValue(dollarCard, 'Before review')).toBe('$24 / year');
    expect(definitionValue(dollarCard, 'If you cancel the ones you no longer value')).toBe(
      '$24 / year',
    );
  });

  it('counts estimated Rarely used subscriptions from Occasional Use', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify');
    await settlePage();
    const reality = getRegion(fixture.nativeElement as HTMLElement, 'See the reality.');
    expect(definitionValue(reality, 'Rarely used')).toBe('0');
    setField(region, 'subscription-reason', 'Occasional Use');
    addSubscription(fixture, region, 'Adobe');
    await settlePage();
    expect(definitionValue(reality, 'Rarely used')).toBe('1');
  });

  it('focuses the live reality heading after the first add and the name field after later adds', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify');
    await settlePage();
    const reality = getRegion(fixture.nativeElement as HTMLElement, 'See the reality.');
    expect(document.activeElement).toBe(reality.querySelector('h2'));
    expect(reality.querySelector('h2')?.getAttribute('tabindex')).toBe('-1');

    addSubscription(fixture, region, 'Adobe');
    await settlePage();
    expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
  });
});

describe('Review reason and usage', () => {
  async function prepareReview() {
    const { fixture, region, storage } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify');
    await settlePage();
    addSubscription(fixture, region, 'Cloud', 'USD');
    await settlePage();
    const page = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      region,
      storage,
      page,
      review: getRegion(getRegion(page, 'Would you still subscribe today?'), 'Spotify'),
    };
  }

  function expectChoices(review: HTMLElement, reason: string, usage: string) {
    for (const value of REASONS) {
      expect(getButton(review, value).getAttribute('aria-pressed')).toBe(String(value === reason));
    }
    for (const value of USAGES) {
      expect(getButton(review, value).getAttribute('aria-pressed')).toBe(String(value === usage));
    }
  }

  it('shows the first subscription with Annual cost, Monthly cost and current choices in named groups', async () => {
    const { review } = await prepareReview();
    expect(review.textContent?.replace(/\s+/g, ' ')).toContain('€120 per year · €9.99 per month');
    expect(review.textContent).not.toContain('Cloud');
    expectChoices(review, 'Essential', 'Daily');
    const groups = Array.from(review.querySelectorAll('[role="group"]'));
    expect(groups).toHaveLength(3);
    expect(
      groups.map((group) => {
        const ids = group.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
        return (
          group.getAttribute('aria-label') ??
          ids.map((id) => review.querySelector(`[id="${id}"]`)?.textContent?.trim()).join(' ')
        );
      }),
    ).toEqual([
      'Why do you still have it?',
      'How often do you actually use it?',
      'Review decision',
    ]);
    expect(review.querySelector('.review-logo')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('updates Rarely used and subscription usage immediately while preserving button focus', async () => {
    const { fixture, region, page, review } = await prepareReview();
    const rarely = getButton(review, 'Rarely');
    rarely.focus();
    rarely.click();
    fixture.detectChanges();
    await settlePage();
    const reality = getRegion(page, 'See the reality.');
    const euro = reality.querySelector<HTMLElement>('[aria-label="Subscription reality in EUR"]')!;
    expect(definitionValue(euro, 'Rarely used')).toBe('1');
    expect(getList(region, 'Subscriptions').children[0].textContent).toContain('Usage: Rarely');
    expect(getButton(review, 'Rarely')).toBe(rarely);
    expect(document.activeElement).toBe(rarely);
    expectChoices(review, 'Essential', 'Rarely');
  });

  it('saves reason independently of usage and resumes the same undecided subscription after reload', async () => {
    const { fixture, storage, review } = await prepareReview();
    const reason = getButton(review, 'Occasional Use');
    reason.focus();
    reason.click();
    fixture.detectChanges();
    await settlePage();
    expectChoices(review, 'Occasional Use', 'Daily');
    expect(getButton(review, 'Occasional Use')).toBe(reason);
    expect(document.activeElement).toBe(reason);
    getButton(review, 'Rarely').click();
    fixture.detectChanges();
    await settlePage();
    fixture.destroy();
    const { root } = await renderApp(storage);
    expectChoices(
      getRegion(getRegion(root, 'Would you still subscribe today?'), 'Spotify'),
      'Occasional Use',
      'Rarely',
    );
    const saved = await storage.load();
    expect(saved?.subscriptions[0].usageConfirmed).toBe(false);
    expect(saved?.subscriptions[0].decision).toBeNull();
  });
});

async function prepareReview() {
  const { fixture, region, storage } = await prepareAddForm();
  for (const name of ['Spotify', 'Cloud', 'Gym']) {
    addSubscription(fixture, region, name);
    await settlePage();
  }
  const page = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    region,
    storage,
    page,
    review: getRegion(getRegion(page, 'Would you still subscribe today?'), 'Spotify'),
  };
}

async function decide(fixture: ComponentFixture<App>, review: HTMLElement, decision: string) {
  getButton(review, decision).click();
  fixture.detectChanges();
  await settlePage();
}

function expectProgress(review: HTMLElement, decided: number, total: number) {
  const progress = review.querySelector('[role="progressbar"]');
  expect(progress?.getAttribute('aria-label')).toBe(`${decided} of ${total} reviewed`);
  expect(progress?.getAttribute('aria-valuemin')).toBe('0');
  expect(progress?.getAttribute('aria-valuemax')).toBe(String(total));
  expect(progress?.getAttribute('aria-valuenow')).toBe(String(decided));
}

describe('Review decisions and progress', () => {
  it('records Keep and shows the second subscription with focus on its review heading', async () => {
    const { fixture, page, review } = await prepareReview();
    for (const label of ['Keep', 'Unsure', 'Cancel']) {
      expect(getButton(review, label).type).toBe('button');
      expect(getButton(review, label).getAttribute('aria-pressed')).toBe('false');
    }
    await decide(fixture, review, 'Keep');
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Cloud')).toBe(review);
    const heading = review.querySelector('h3');
    expect(heading?.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(heading);
  });

  it('shows decided out of total progress after one Review decision', async () => {
    const { fixture, review } = await prepareReview();
    expectProgress(review, 0, 3);
    await decide(fixture, review, 'Keep');
    expectProgress(review, 1, 3);
  });

  it('shows Review complete with focus after all three Review decisions', async () => {
    const { fixture, page, review } = await prepareReview();
    for (const decision of ['Keep', 'Unsure', 'Cancel']) await decide(fixture, review, decision);
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Review complete')).toBe(
      review,
    );
    const heading = review.querySelector('h3');
    expect(heading?.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(heading);
    expectProgress(review, 3, 3);
    expect(getButton(review, 'Review again').type).toBe('button');
  });

  it('reviews a later add as undecided while keeping focus in the add form name field', async () => {
    const { fixture, region, page, review, storage } = await prepareReview();
    for (const decision of ['Keep', 'Unsure', 'Cancel']) await decide(fixture, review, decision);
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Review complete')).toBe(
      review,
    );
    addSubscription(fixture, region, 'News');
    await settlePage();
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'News')).toBe(review);
    expectProgress(review, 3, 4);
    for (const label of ['Keep', 'Unsure', 'Cancel']) {
      expect(getButton(review, label).getAttribute('aria-pressed')).toBe('false');
    }
    expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
    expect((await storage.load())?.subscriptions[3].decision).toBeNull();
  });

  it('chooses Cancel without a toast or new live-region text', async () => {
    const { fixture, page, review } = await prepareReview();
    const liveText = () =>
      Array.from(page.querySelectorAll('[role="status"], [role="alert"], [aria-live]'), (element) =>
        element.textContent?.trim(),
      );
    const before = liveText();
    await decide(fixture, review, 'Cancel');
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Cloud')).toBe(review);
    expect(liveText()).toEqual(before);
    expect(review.textContent).not.toContain('cancelled');
  });

  it('reloads at the first undecided subscription with Review decisions and confirmed usage saved', async () => {
    const { fixture, storage, review } = await prepareReview();
    await decide(fixture, review, 'Unsure');
    fixture.destroy();
    const { root } = await renderApp(storage);
    expectProgress(getRegion(getRegion(root, 'Would you still subscribe today?'), 'Cloud'), 1, 3);
    const saved = await storage.load();
    expect(saved?.subscriptions.map(({ decision }) => decision)).toEqual(['unsure', null, null]);
    expect(saved?.subscriptions.map(({ usageConfirmed }) => usageConfirmed)).toEqual([
      true,
      false,
      false,
    ]);
  });
});

describe('Review again', () => {
  async function prepareCompletedReview() {
    const context = await prepareReview();
    for (const decision of ['Keep', 'Unsure', 'Cancel']) {
      await decide(context.fixture, context.review, decision);
    }
    return context;
  }

  async function startPass(fixture: ComponentFixture<App>, review: HTMLElement) {
    getButton(review, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
  }

  function expectDecision(review: HTMLElement, decision: string | null) {
    for (const label of ['Keep', 'Unsure', 'Cancel']) {
      const button = getButton(review, label);
      expect(button.getAttribute('aria-pressed')).toBe(String(label === decision));
      expect(button.classList.contains('active')).toBe(label === decision);
      expect(button.classList.contains('decision')).toBe(true);
      expect(button.classList.contains(label.toLowerCase())).toBe(true);
    }
  }

  it.each([
    ['Keep', 'Spotify'],
    ['Unsure', 'Cloud'],
    ['Cancel', 'Gym'],
  ])(
    'shows only the current %s Review decision as selected during Review again',
    async (decision, name) => {
      const { fixture, page, review } = await prepareCompletedReview();
      await startPass(fixture, review);
      for (const earlierDecision of ['Keep', 'Unsure', 'Cancel']) {
        if (earlierDecision === decision) break;
        await decide(fixture, review, earlierDecision);
      }
      expect(getRegion(getRegion(page, 'Would you still subscribe today?'), name)).toBe(review);
      expectDecision(review, decision);
    },
  );

  it('shows no selected Review decision for an undecided subscription in the normal queue', async () => {
    const { review } = await prepareReview();
    expectDecision(review, null);
  });

  it('starts with the first subscription added and its earlier Review decision pressed', async () => {
    const { fixture, page, review } = await prepareCompletedReview();
    await startPass(fixture, review);
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Spotify')).toBe(review);
    expectDecision(review, 'Keep');
    expectProgress(review, 3, 3);
  });

  it('records a changed Cancel decision and advances to the second subscription', async () => {
    const { fixture, page, review, storage } = await prepareCompletedReview();
    await startPass(fixture, review);
    await decide(fixture, review, 'Cancel');
    expect((await storage.load())?.subscriptions[0].decision).toBe('cancel');
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Cloud')).toBe(review);
    expectDecision(review, 'Unsure');
  });

  it('shows Review complete again after the last subscription', async () => {
    const { fixture, page, review } = await prepareCompletedReview();
    await startPass(fixture, review);
    for (const decision of ['Keep', 'Unsure', 'Cancel']) await decide(fixture, review, decision);
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Review complete')).toBe(
      review,
    );
    expect(getButton(review, 'Review again').type).toBe('button');
    expectProgress(review, 3, 3);
  });

  it('reviews a subscription added during the pass at its end, undecided', async () => {
    const { fixture, page, region, review } = await prepareCompletedReview();
    await startPass(fixture, review);
    await decide(fixture, review, 'Keep');
    addSubscription(fixture, region, 'News');
    await settlePage();
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Cloud')).toBe(review);
    await decide(fixture, review, 'Unsure');
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Gym')).toBe(review);
    await decide(fixture, review, 'Cancel');
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'News')).toBe(review);
    expectDecision(review, null);
    expectProgress(review, 3, 4);
    await decide(fixture, review, 'Keep');
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Review complete')).toBe(
      review,
    );
  });

  it('moves focus from Review again to the first subscription review heading', async () => {
    const { fixture, review } = await prepareCompletedReview();
    const button = getButton(review, 'Review again');
    button.focus();
    await startPass(fixture, review);
    expect(button.isConnected).toBe(false);
    expect(review.querySelector('h3')?.textContent?.trim()).toBe('Spotify');
    expect(review.querySelector('h3')?.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(review.querySelector('h3'));
  });

  it('moves focus to the next subscription review heading after a decision during the pass', async () => {
    const { fixture, review } = await prepareCompletedReview();
    await startPass(fixture, review);
    getButton(review, 'Cancel').focus();
    await decide(fixture, review, 'Cancel');
    const heading = review.querySelector('h3');
    expect(heading?.textContent?.trim()).toBe('Cloud');
    expect(heading?.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(heading);
  });

  it('preserves the pass position when recording a decision on another subscription', async () => {
    const { fixture, review, storage } = await prepareCompletedReview();
    await startPass(fixture, review);
    await decide(fixture, review, 'Keep');
    const state = TestBed.inject(SubscriptionsState);
    const subscriptions = state.subscriptions();
    for (const subscription of [subscriptions[0], subscriptions[2]]) {
      state.decide(subscription.id, 'unsure');
      fixture.detectChanges();
      await settlePage();
      expect(state.currentReviewSubscription()?.name).toBe('Cloud');
      expect(
        (await storage.load())?.subscriptions.find(({ id }) => id === subscription.id)?.decision,
      ).toBe('unsure');
    }
    await decide(fixture, review, 'Cancel');
    expect(state.currentReviewSubscription()?.name).toBe('Gym');
  });

  it('keeps reason and usage changes on the same subscription and forgets the pass on reload', async () => {
    const { fixture, page, review, storage } = await prepareCompletedReview();
    await startPass(fixture, review);
    await decide(fixture, review, 'Keep');
    getButton(review, 'Convenience').click();
    getButton(review, 'Rarely').click();
    fixture.detectChanges();
    await settlePage();
    expect(getRegion(getRegion(page, 'Would you still subscribe today?'), 'Cloud')).toBe(review);
    expectDecision(review, 'Unsure');
    const saved = await storage.load();
    expect(saved?.subscriptions[1].reason).toBe('Convenience');
    expect(saved?.subscriptions[1].usage).toBe('Rarely');
    fixture.destroy();
    const { root } = await renderApp(storage);
    expect(
      getRegion(getRegion(root, 'Would you still subscribe today?'), 'Review complete'),
    ).toBeDefined();
  });
});

describe('Potential savings', () => {
  function listText(region: HTMLElement, label: string): string[] {
    return Array.from(getList(region, label).querySelectorAll('li'), (line) => {
      const visibleLine = line.cloneNode(true) as HTMLElement;
      visibleLine.querySelectorAll('.visually-hidden').forEach((text) => text.remove());
      return visibleLine.textContent!.replace(/\s+/g, ' ').trim();
    });
  }

  async function prepareSavings(currencies: Currency[] = ['EUR', 'USD']) {
    const { fixture, region } = await prepareAddForm();
    for (const [index, currency] of currencies.entries()) {
      addSubscription(fixture, region, `Subscription ${index + 1}`, currency);
      await settlePage();
    }
    const page = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      page,
      savings: getRegion(page, 'Potential annual savings'),
      review: getRegion(getRegion(page, 'Would you still subscribe today?'), 'Subscription 1'),
    };
  }

  it('shows zero Potential savings lines in reality-card order with no Review decisions', async () => {
    const { page, savings } = await prepareSavings(['USD', 'EUR']);
    expect(listText(savings, 'Potential savings per currency')).toEqual(['$0 / year', '€0 / year']);
    const reality = getRegion(page, 'See the reality.');
    expect(
      Array.from(reality.querySelectorAll('[aria-label]'), (card) =>
        card.getAttribute('aria-label'),
      ),
    ).toEqual(['Subscription reality in USD', 'Subscription reality in EUR']);
    expect(listText(savings, 'Review decision counts')).toEqual(['Keep 0', 'Unsure 0', 'Cancel 0']);
  });

  it('updates Potential savings immediately on Cancel and keeps Recurring cost unchanged', async () => {
    const { fixture, region } = await prepareAddForm();
    setField(region, 'subscription-name', 'Euro subscription');
    setField(region, 'subscription-price', '10');
    setField(region, 'subscription-billing', 'monthly');
    setField(region, 'subscription-currency', 'EUR');
    clickAdd(region);
    fixture.detectChanges();
    await settlePage();
    addSubscription(fixture, region, 'Dollar subscription', 'USD');
    await settlePage();
    const page = fixture.nativeElement as HTMLElement;
    const reality = getRegion(page, 'See the reality.');
    const card = reality.querySelector<HTMLElement>('[aria-label="Subscription reality in EUR"]')!;
    const annualBeforeCancel = card.querySelector('.annual')?.textContent?.trim();
    const monthlyBeforeCancel = card.querySelector('.monthly')?.textContent?.trim();
    const subscriptionsBeforeCancel = definitionValue(card, 'Subscriptions');
    const rarelyUsedBeforeCancel = definitionValue(card, 'Rarely used');
    const beforeReview = definitionValue(card, 'Before review');
    const review = getRegion(
      getRegion(page, 'Would you still subscribe today?'),
      'Euro subscription',
    );
    await decide(fixture, review, 'Cancel');
    const savings = getRegion(page, 'Potential annual savings');
    expect(listText(savings, 'Potential savings per currency')).toEqual([
      '€120 / year',
      '$0 / year',
    ]);
    expect(listText(savings, 'Review decision counts')).toEqual(['Keep 0', 'Unsure 0', 'Cancel 1']);
    expect(card.querySelector('.annual')?.textContent?.trim()).toBe(annualBeforeCancel);
    expect(card.querySelector('.monthly')?.textContent?.trim()).toBe(monthlyBeforeCancel);
    expect(definitionValue(card, 'Subscriptions')).toBe(subscriptionsBeforeCancel);
    expect(definitionValue(card, 'Rarely used')).toBe(rarelyUsedBeforeCancel);
    expect(definitionValue(card, 'Before review')).toBe(beforeReview);
  });

  it('counts Unsure without adding Potential savings', async () => {
    const { fixture, review, savings } = await prepareSavings();
    await decide(fixture, review, 'Unsure');
    expect(listText(savings, 'Review decision counts')).toEqual(['Keep 0', 'Unsure 1', 'Cancel 0']);
    expect(listText(savings, 'Potential savings per currency')).toEqual(['€0 / year', '$0 / year']);
  });

  it('adds Keep, Unsure and Cancel counts across currencies and updates changed Review decisions', async () => {
    const { fixture, review, savings } = await prepareSavings([
      'EUR',
      'USD',
      'EUR',
      'USD',
      'GBP',
      'GBP',
    ]);
    for (const decision of ['Keep', 'Keep', 'Unsure', 'Unsure', 'Cancel', 'Cancel']) {
      await decide(fixture, review, decision);
    }
    expect(listText(savings, 'Review decision counts')).toEqual(['Keep 2', 'Unsure 2', 'Cancel 2']);
    expect(listText(savings, 'Potential savings per currency')).toEqual([
      '€0 / year',
      '$0 / year',
      '£240 / year',
    ]);
    getButton(review, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
    await decide(fixture, review, 'Cancel');
    expect(listText(savings, 'Review decision counts')).toEqual(['Keep 1', 'Unsure 2', 'Cancel 3']);
    expect(listText(savings, 'Potential savings per currency')).toEqual([
      '€120 / year',
      '$0 / year',
      '£240 / year',
    ]);
  });
});

describe('Insight', () => {
  const placeholder =
    "As you review, we'll surface the subscriptions that look least aligned with how you actually use them.";
  const sentence = (amounts: string) =>
    `You spend ${amounts} per year on subscriptions you describe as optional and rarely use.`;

  async function prepareInsight() {
    const { fixture, region } = await prepareAddForm();
    const page = fixture.nativeElement as HTMLElement;
    const savings = getRegion(page, 'Potential annual savings');
    const add = async (
      name: string,
      price: string,
      currency: Currency,
      billing = 'monthly',
      reason = 'Occasional Use',
    ) => {
      setField(region, 'subscription-name', name);
      setField(region, 'subscription-price', price);
      setField(region, 'subscription-billing', billing);
      setField(region, 'subscription-currency', currency);
      setField(region, 'subscription-reason', reason);
      clickAdd(region);
      fixture.detectChanges();
      await settlePage();
    };
    return { fixture, page, savings, add };
  }

  it('keeps the no-subscriptions insight readable in the dimmed savings card', async () => {
    const { root } = await renderApp();
    const savings = getRegion(root, 'Potential annual savings');
    expect(savings.textContent).toContain(
      'Add your subscriptions first. Your review insights will appear here.',
    );
    expect(savings.classList.contains('active')).toBe(false);
    expect(savings.closest('[inert], [aria-hidden="true"]')).toBeNull();
  });

  it('shows the placeholder for an Essential/Daily subscription', async () => {
    const { savings, add } = await prepareInsight();
    await add('Cloud', '10', 'EUR', 'monthly', 'Essential');
    expect(savings.textContent).toContain(placeholder);
    expect(savings.textContent).not.toContain('You spend');
  });

  it('shows estimated Rarely candidates with joined amounts and separate pill buttons', async () => {
    const { savings, add } = await prepareInsight();
    await add('Adobe', '10', 'EUR');
    expect(savings.textContent).toContain(sentence('€120'));
    expect(getList(savings, 'Review candidates').querySelectorAll('button')).toHaveLength(1);
    expect(getButton(savings, 'Adobe')).toBeDefined();
    await add('Headspace', '5', 'USD');
    expect(savings.textContent).toContain(sentence('€120 and $60'));
    expect(
      Array.from(getList(savings, 'Review candidates').querySelectorAll('button'), (button) =>
        button.textContent?.trim(),
      ),
    ).toEqual(['Adobe', 'Headspace']);
    await add('Audible', '40', 'GBP', 'yearly');
    expect(savings.textContent).toContain(sentence('€120, $60 and £40'));
    expect(
      Array.from(getList(savings, 'Review candidates').querySelectorAll('button'), (button) =>
        button.textContent?.trim(),
      ),
    ).toEqual(['Adobe', 'Headspace', 'Audible']);
    expect(savings.textContent).not.toContain(' · ');
    expect(getFocusableElements(savings)).toHaveLength(3);
    expect(savings.textContent).not.toContain(placeholder);
  });

  async function prepareNameSelection() {
    const context = await prepareInsight();
    await context.add('Cloud', '10', 'EUR', 'monthly', 'Essential');
    await context.add('Adobe', '10', 'EUR');
    await context.add('Audible', '5', 'EUR');
    const reviewSection = getRegion(context.page, 'Would you still subscribe today?');
    const review = getRegion(reviewSection, 'Cloud');
    const select = async (name: string) => {
      getButton(context.savings, name).focus();
      getButton(context.savings, name).click();
      context.fixture.detectChanges();
      await settlePage();
    };
    return { ...context, reviewSection, review, select };
  }

  it('shows the selected Review candidate and focuses its review heading', async () => {
    const { reviewSection, review, select } = await prepareNameSelection();
    await select('Audible');
    expect(getRegion(reviewSection, 'Audible')).toBe(review);
    expect(document.activeElement).toBe(review.querySelector('h3'));
    getButton(review, 'Rarely').focus();
    await select('Audible');
    expect(document.activeElement).toBe(review.querySelector('h3'));
  });

  it('brings up an already-decided Review candidate with its Review decision pressed', async () => {
    const { fixture, reviewSection, review, select } = await prepareNameSelection();
    await decide(fixture, review, 'Keep');
    await decide(fixture, review, 'Unsure');
    await select('Adobe');
    expect(getRegion(reviewSection, 'Adobe')).toBe(review);
    for (const label of ['Keep', 'Unsure', 'Cancel']) {
      expect(getButton(review, label).getAttribute('aria-pressed')).toBe(
        String(label === 'Unsure'),
      );
    }
  });

  it('returns to the first undecided subscription or Review complete after a selected decision', async () => {
    const { fixture, reviewSection, review, select } = await prepareNameSelection();
    await select('Adobe');
    await decide(fixture, review, 'Keep');
    expect(getRegion(reviewSection, 'Cloud')).toBe(review);
    await decide(fixture, review, 'Keep');
    await decide(fixture, review, 'Unsure');
    await select('Adobe');
    await decide(fixture, review, 'Keep');
    expect(getRegion(reviewSection, 'Review complete')).toBe(review);
    expect(document.activeElement).toBe(review.querySelector('h3'));
  });

  it('preserves the Review again pass position after selected candidate decisions', async () => {
    const { fixture, reviewSection, review, select } = await prepareNameSelection();
    for (const label of ['Keep', 'Unsure', 'Keep']) await decide(fixture, review, label);
    getButton(review, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
    await decide(fixture, review, 'Keep');
    await select('Audible');
    await decide(fixture, review, 'Keep');
    expect(getRegion(reviewSection, 'Adobe')).toBe(review);
    await select('Adobe');
    await decide(fixture, review, 'Unsure');
    expect(getRegion(reviewSection, 'Audible')).toBe(review);
    await decide(fixture, review, 'Cancel');
    expect(getRegion(reviewSection, 'Review complete')).toBe(review);
  });

  it('continues the Review again pass after deciding on a candidate already passed', async () => {
    const { fixture, reviewSection, review, select } = await prepareNameSelection();
    for (const label of ['Keep', 'Unsure', 'Cancel']) await decide(fixture, review, label);
    getButton(review, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
    await decide(fixture, review, 'Keep');
    await decide(fixture, review, 'Unsure');
    expect(getRegion(reviewSection, 'Audible')).toBe(review);
    await select('Adobe');
    await decide(fixture, review, 'Cancel');
    expect(getRegion(reviewSection, 'Audible')).toBe(review);
    await decide(fixture, review, 'Keep');
    expect(getRegion(reviewSection, 'Review complete')).toBe(review);
  });

  it('uses focusable native pill buttons named for the Review candidates without separators', async () => {
    const { savings } = await prepareNameSelection();
    for (const name of ['Adobe', 'Audible']) {
      const button = getButton(savings, name);
      expect(button.type).toBe('button');
      expect(button.disabled).toBe(false);
      expect(button.tabIndex).toBe(0);
      expect(button.getAttribute('aria-label')).toBeNull();
      button.focus();
      expect(document.activeElement).toBe(button);
    }
    expect(getList(savings, 'Review candidates').querySelectorAll('li')).toHaveLength(2);
    expect(savings.querySelector('.candidate-names [aria-hidden="true"]')).toBeNull();
    expect(savings.textContent).not.toContain(' · ');
  });

  it('removes a Review candidate immediately when usage changes to Weekly', async () => {
    const { fixture, page, savings, add } = await prepareInsight();
    await add('Adobe', '10', 'EUR');
    expect(savings.textContent).toContain(sentence('€120'));
    const review = getRegion(getRegion(page, 'Would you still subscribe today?'), 'Adobe');
    getButton(review, 'Weekly').click();
    fixture.detectChanges();
    await settlePage();
    expect(savings.textContent).toContain(placeholder);
    expect(savings.textContent).not.toContain('You spend');
    expect(savings.textContent).not.toContain('Adobe');
  });

  it('removes Cancelled candidates from the insight and restores them on Review again', async () => {
    const { fixture, page, savings, add } = await prepareInsight();
    await add('Adobe', '10', 'EUR');
    await add('Headspace', '5', 'USD');
    const review = getRegion(getRegion(page, 'Would you still subscribe today?'), 'Adobe');

    await decide(fixture, review, 'Cancel');
    expect(savings.textContent).toContain(sentence('$60'));
    expect(savings.textContent).not.toContain('Adobe');
    expect(getButton(savings, 'Headspace')).toBeDefined();

    const decisionCounts = Array.from(getList(savings, 'Review decision counts').children, (line) =>
      line.textContent?.trim(),
    );
    const rarelyUsed = definitionValue(
      page.querySelector<HTMLElement>('[aria-label="Subscription reality in EUR"]')!,
      'Rarely used',
    );
    expect(decisionCounts).toEqual(['Keep 0', 'Unsure 0', 'Cancel 1']);
    const potentialSavings = Array.from(
      getList(savings, 'Potential savings per currency').children,
      (line) => {
        const visibleLine = line.cloneNode(true) as HTMLElement;
        visibleLine.querySelectorAll('.visually-hidden').forEach((text) => text.remove());
        return visibleLine.textContent?.replace(/\s+/g, ' ').trim();
      },
    );
    expect(potentialSavings).toEqual(['€120 / year', '$0 / year']);
    expect(rarelyUsed).toBe('1');

    await decide(fixture, review, 'Cancel');
    expect(savings.textContent).toContain(placeholder);
    getButton(review, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
    await decide(fixture, review, 'Keep');
    expect(savings.textContent).toContain(sentence('€120'));
    await decide(fixture, review, 'Unsure');
    expect(savings.textContent).toContain(sentence('€120 and $60'));
    expect(getButton(savings, 'Adobe')).toBeDefined();
  });
});

describe('Subscription form accessibility on the page', () => {
  it('keeps add and edit labels, ids and price error descriptions separate when switching subscriptions', async () => {
    const { fixture, region } = await prepareAddForm();
    addSubscription(fixture, region, 'Spotify');
    await settlePage();
    addSubscription(fixture, region, 'Netflix');
    await settlePage();

    function expectUniqueDocumentIds(): void {
      const ids = Array.from(document.querySelectorAll('[id]'), (element) => element.id);
      expect(new Set(ids).size).toBe(ids.length);
    }

    function expectLabelsLinkedWithin(form: HTMLFormElement): void {
      const labels = Array.from(form.querySelectorAll<HTMLLabelElement>('label[for]'));
      expect(labels).toHaveLength(5);
      for (const label of labels) {
        expect(label.control).not.toBeNull();
        expect(form.contains(label.control)).toBe(true);
        expect(label.control?.id).toBe(label.htmlFor);
      }
    }

    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();

    const addForm = region.querySelector<HTMLFormElement>('form.add-form')!;
    const editForm = region.querySelector<HTMLFormElement>('dialog form')!;
    expectUniqueDocumentIds();
    expectLabelsLinkedWithin(addForm);
    expectLabelsLinkedWithin(editForm);

    const editPrice = editForm.querySelector<HTMLInputElement>('input[type="number"]')!;
    const addPrice = addForm.querySelector<HTMLInputElement>('input[type="number"]')!;
    setField(editForm, editPrice.id, '');
    fixture.detectChanges();
    await settlePage();

    expect(editPrice.getAttribute('aria-invalid')).toBe('true');
    const descriptionId = editPrice.getAttribute('aria-describedby');
    expect(descriptionId).toBeTruthy();
    const description = document.getElementById(descriptionId!);
    expect(description?.textContent).toBe('Enter a price.');
    expect(editForm.contains(description)).toBe(true);
    expect(addPrice.hasAttribute('aria-describedby')).toBe(false);
    expectUniqueDocumentIds();

    setField(editForm, editPrice.id, '9.99');
    fixture.detectChanges();
    await settlePage();
    getButton(editForm, 'Done').click();
    fixture.detectChanges();
    await settlePage();
    expect(region.querySelector('dialog form')).toBeNull();

    getButton(getList(region, 'Subscriptions'), 'Netflix').click();
    fixture.detectChanges();
    await settlePage();
    const nextEditForm = region.querySelector<HTMLFormElement>('dialog form')!;
    expect(nextEditForm.getAttribute('aria-labelledby')).toBe('edit-title');
    expect(region.querySelector('#edit-title')?.textContent?.trim()).toBe('Edit Netflix');
    expectUniqueDocumentIds();
    expectLabelsLinkedWithin(addForm);
    expectLabelsLinkedWithin(nextEditForm);
  });
});

describe('Delete in the card dialog', () => {
  function editField(region: HTMLElement, label: string): HTMLInputElement | HTMLSelectElement {
    const form = region.querySelector('dialog form');
    const fieldLabel = Array.from(form?.querySelectorAll('label') ?? []).find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    const field = form?.querySelector<HTMLInputElement | HTMLSelectElement>(
      `#${fieldLabel?.htmlFor}`,
    );
    if (!field) throw new Error(`Could not find edit field "${label}".`);
    return field;
  }

  async function prepareDelete() {
    const context = await prepareAddForm();
    for (const [name, currency] of [
      ['Spotify', 'USD'],
      ['Netflix', 'EUR'],
      ['Cloud', 'GBP'],
    ] as const) {
      addSubscription(context.fixture, context.region, name, currency);
      await settlePage();
    }
    const open = async (name: string) => {
      const trigger = context.region.querySelector<HTMLButtonElement>(
        `button[aria-label="Delete ${name}"]`,
      )!;
      trigger.focus();
      trigger.click();
      context.fixture.detectChanges();
      await settlePage();
      return { trigger, dialog: context.region.querySelector<HTMLDialogElement>('dialog')! };
    };
    const answer = async (dialog: HTMLDialogElement, name: string) => {
      const button =
        name === 'Close' ? getButtonByAccessibleName(dialog, name) : getButton(dialog, name);
      button.click();
      context.fixture.detectChanges();
      await settlePage();
    };
    return { ...context, open, answer };
  }

  it('names the delete buttons and modal, focuses Close, and dismisses without saving', async () => {
    const { region, storage, fixture, open, answer } = await prepareDelete();
    const { trigger, dialog } = await open('Spotify');
    expect(trigger.previousElementSibling?.tagName).toBe('H3');
    expect(trigger.querySelector('[aria-hidden="true"]')?.textContent).toBe('✕');
    expect(region.querySelector('dialog form')).toBeNull();
    expect(dialog.open).toBe(true);
    expect(
      document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent?.trim(),
    ).toBe('Did you already cancel Spotify?');
    expect(
      document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent?.trim(),
    ).toBe("Deleting it here doesn't stop the payment.");
    const close = getButtonByAccessibleName(dialog, 'Close');
    expect(close.querySelector('[aria-hidden="true"]')?.textContent).toBe('✕');
    expect(document.activeElement).toBe(close);
    const saves = storage.savedStates.length;
    stubDialogRect(dialog);
    clickDialogBackdrop(dialog);
    await settlePage();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(storage.savedStates).toHaveLength(saves);
    await open('Spotify');
    await answer(dialog, 'Close');
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    await open('Spotify');
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    await settlePage();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(trigger);
    expect(storage.savedStates).toHaveLength(saves);
    await open('Netflix');
    expect(dialog.textContent).toContain('Did you already cancel Netflix?');
    await answer(dialog, 'Not yet, keep it');
    expect(storage.savedStates).toHaveLength(saves + 1);
  });

  it('keeps the card in Recurring cost and adds its annual cost to Potential savings', async () => {
    const { fixture, region, storage, open, answer } = await prepareDelete();
    const page = fixture.nativeElement as HTMLElement;
    const reality = page.querySelector<HTMLElement>(
      '.reality-card[aria-label="Subscription reality in USD"]',
    )!;
    const savings = getRegion(page, 'Potential annual savings');
    const trigger = region.querySelector<HTMLButtonElement>('[aria-label="Delete Spotify"]')!;

    const { dialog } = await open('Spotify');
    await answer(dialog, 'Not yet, keep it');

    expect(region.querySelector('[aria-label="Delete Spotify"]')).toBe(trigger);
    expect(reality.textContent).toContain('$120');
    expect(savings.querySelector('.savings-list')?.textContent).toContain('$120');
    expect(document.activeElement).toBe(trigger);
    expect(storage.savedStates.at(-1)?.subscriptions[0]).toMatchObject({ decision: 'cancel' });
  });

  it('changes each prior Review decision to Cancel once without double-counting Cancel', async () => {
    const { fixture, region, open, answer } = await prepareDelete();
    const page = fixture.nativeElement as HTMLElement;
    const reviewSection = getRegion(page, 'Would you still subscribe today?');
    const savings = getRegion(page, 'Potential annual savings');
    const counts = () =>
      Array.from(getList(savings, 'Review decision counts').children, (line) =>
        line.textContent?.trim(),
      );

    for (const [name, decision, before, after] of [
      ['Spotify', null, ['Keep 0', 'Unsure 0', 'Cancel 0'], ['Keep 0', 'Unsure 0', 'Cancel 1']],
      ['Netflix', 'Keep', ['Keep 1', 'Unsure 0', 'Cancel 1'], ['Keep 0', 'Unsure 0', 'Cancel 2']],
      ['Cloud', 'Unsure', ['Keep 0', 'Unsure 1', 'Cancel 2'], ['Keep 0', 'Unsure 0', 'Cancel 3']],
    ] as const) {
      if (decision) {
        getButton(getRegion(reviewSection, name), decision).click();
        fixture.detectChanges();
        await settlePage();
      }
      expect(counts()).toEqual(before);
      const { dialog } = await open(name);
      await answer(dialog, 'Not yet, keep it');
      expect(counts()).toEqual(after);
      if (name === 'Spotify') expect(getRegion(reviewSection, 'Netflix')).toBeTruthy();
    }

    const { dialog } = await open('Cloud');
    await answer(dialog, 'Not yet, keep it');
    expect(counts()).toEqual(['Keep 0', 'Unsure 0', 'Cancel 3']);
    expect(region.querySelectorAll('[aria-label^="Delete "]')).toHaveLength(3);
  });

  it('preserves usage state and saved edits, and persists Cancel after reload', async () => {
    const { fixture, region, storage, open, answer } = await prepareDelete();
    const page = fixture.nativeElement as HTMLElement;
    const reviewSection = getRegion(page, 'Would you still subscribe today?');
    const spotifyReview = getRegion(reviewSection, 'Spotify');
    getButton(spotifyReview, 'Keep').click();
    fixture.detectChanges();
    await settlePage();

    getButton(getList(region, 'Subscriptions'), 'Netflix').click();
    fixture.detectChanges();
    await settlePage();
    const netflixName = editField(region, 'Subscription name');
    setField(region, netflixName.id, 'Netflix Plus');
    await settlePage();

    getButton(region, 'Done').click();
    await settlePage();
    let { dialog } = await open('Spotify');
    await answer(dialog, 'Not yet, keep it');
    expect(document.activeElement).toBe(
      region.querySelector<HTMLButtonElement>('[aria-label="Delete Spotify"]'),
    );
    expect(getButton(getList(region, 'Subscriptions'), 'Netflix Plus')).toBeDefined();
    expect((await storage.load())?.subscriptions[0]).toMatchObject({
      decision: 'cancel',
      usage: 'Daily',
      usageConfirmed: true,
    });

    getButton(getList(region, 'Subscriptions'), 'Spotify').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Reason').id, 'Occasional Use');
    await settlePage();
    expect((await storage.load())?.subscriptions[0]).toMatchObject({
      decision: 'cancel',
      usage: 'Daily',
      usageConfirmed: true,
    });

    getButton(region, 'Done').click();
    await settlePage();
    dialog = (await open('Cloud')).dialog;
    await answer(dialog, 'Not yet, keep it');
    getButton(getList(region, 'Subscriptions'), 'Cloud').click();
    fixture.detectChanges();
    await settlePage();
    setField(region, editField(region, 'Reason').id, 'Occasional Use');
    await settlePage();
    getButton(region, 'Done').click();
    await settlePage();
    expect((await storage.load())?.subscriptions[2]).toMatchObject({
      decision: 'cancel',
      usage: 'Rarely',
      usageConfirmed: false,
    });

    const reloaded = await renderApp(storage);
    const reloadedRegion = getRegion(reloaded.root, 'Your recurring life.');
    const reloadedSavings = getRegion(reloaded.root, 'Potential annual savings');
    expect(
      Array.from(getList(reloadedSavings, 'Review decision counts').children, (line) =>
        line.textContent?.trim(),
      ),
    ).toEqual(['Keep 0', 'Unsure 0', 'Cancel 2']);
    expect(getList(reloadedSavings, 'Potential savings per currency').textContent).toContain(
      '$120',
    );
    expect(getList(reloadedRegion, 'Subscriptions').children[0].textContent).toContain(
      'Usage: Daily',
    );
    expect(getList(reloadedRegion, 'Subscriptions').children[2].textContent).toContain(
      'Usage: Rarely',
    );
    expect(reloadedSavings.textContent).toContain(
      "As you review, we'll surface the subscriptions that look least aligned with how you actually use them.",
    );
    expect(reloadedSavings.textContent).not.toContain('Cloud');
  });

  it('deletes and saves, removes currency reality and Potential savings, and focuses neighbours', async () => {
    const { fixture, region, storage, open, answer } = await prepareDelete();
    const page = fixture.nativeElement as HTMLElement;
    const review = getRegion(getRegion(page, 'Would you still subscribe today?'), 'Spotify');
    getButton(review, 'Cancel').click();
    fixture.detectChanges();
    await settlePage();
    const savings = getRegion(page, 'Potential annual savings');
    expect(savings.querySelector('.savings-list')?.textContent).toContain('$120');
    let { dialog } = await open('Spotify');
    await answer(dialog, 'Yes, delete it');
    expect(
      Array.from(savings.querySelectorAll('.summary-line'))
        .find((line) => line.textContent?.includes('Cancel'))
        ?.querySelector('strong')?.textContent,
    ).toBe('0');
    expect(storage.savedStates.at(-1)?.subscriptions.map(({ name }) => name)).toEqual([
      'Netflix',
      'Cloud',
    ]);
    expect(region.querySelector('[aria-label="Delete Spotify"]')).toBeNull();
    expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Netflix'));
    expect(
      fixture.nativeElement.querySelector(
        '.reality-card[aria-label="Subscription reality in USD"]',
      ),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.savings-list').textContent).not.toContain('$');
    addSubscription(fixture, region, 'New USD', 'USD');
    await settlePage();
    expect(
      Array.from(fixture.nativeElement.querySelectorAll('.reality-card'), (card: Element) =>
        card.getAttribute('aria-label'),
      ).at(-1),
    ).toContain('USD');
    ({ dialog } = await open('New USD'));
    await answer(dialog, 'Yes, delete it');
    expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Cloud'));
    const reloaded = await renderApp(storage);
    expect(reloaded.root.textContent).not.toContain('Spotify');
    expect(reloaded.root.querySelectorAll('app-subscription-card')).toHaveLength(2);
  });

  it('reveals and focuses the add form after the last deletion and dims the other sections', async () => {
    const { fixture, region, open, answer } = await prepareDelete();
    for (const name of ['Spotify', 'Netflix', 'Cloud']) {
      const { dialog } = await open(name);
      await answer(dialog, 'Yes, delete it');
    }
    expect(region.textContent).toContain('What are you paying for every month?');
    expect(document.activeElement).toBe(region.querySelector('#subscription-name'));
    expect(
      fixture.nativeElement
        .querySelector('#reality-heading')
        .closest('section')
        .classList.contains('live'),
    ).toBe(false);
    expect(
      fixture.nativeElement
        .querySelector('#savings-heading')
        .closest('section')
        .classList.contains('active'),
    ).toBe(false);
  });

  it('undoes an invalid edit before deletion and focuses the neighbour card', async () => {
    const { fixture, region, open, answer } = await prepareDelete();
    getButton(getList(region, 'Subscriptions'), 'Netflix').click();
    fixture.detectChanges();
    await settlePage();
    const name = editField(region, 'Subscription name');
    setField(region, name.id, '');
    await settlePage();
    expect(name.getAttribute('aria-invalid')).toBe('true');
    getButtonByAccessibleName(region, 'Close').click();
    await settlePage();
    const { dialog } = await open('Spotify');
    await answer(dialog, 'Close');
    await open('Spotify');
    await answer(dialog, 'Yes, delete it');
    expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Netflix'));
    getButton(getList(region, 'Subscriptions'), 'Netflix').click();
    await settlePage();
    expect(editField(region, 'Subscription name').value).toBe('Netflix');
    expect(editField(region, 'Subscription name').getAttribute('aria-invalid')).not.toBe('true');
  });

  it('drops deleted subscriptions from Review again and clears an insight Review candidate pick', async () => {
    const { fixture, region, open, answer } = await prepareDelete();
    const page = fixture.nativeElement as HTMLElement;
    const reviewSection = getRegion(page, 'Would you still subscribe today?');
    for (const name of ['Spotify', 'Netflix', 'Cloud']) {
      getButton(getRegion(reviewSection, name), 'Keep').click();
      fixture.detectChanges();
      await settlePage();
    }
    getButton(reviewSection, 'Review again').click();
    fixture.detectChanges();
    await settlePage();
    let { dialog } = await open('Spotify');
    await answer(dialog, 'Yes, delete it');
    expect(getRegion(reviewSection, 'Netflix')).toBeTruthy();
    expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Netflix'));
    setField(region, 'subscription-reason', 'Occasional Use');
    addSubscription(fixture, region, 'Adobe');
    await settlePage();
    getButton(getRegion(page, 'Potential annual savings'), 'Adobe').click();
    fixture.detectChanges();
    await settlePage();
    expect(getRegion(reviewSection, 'Adobe')).toBeTruthy();
    ({ dialog } = await open('Adobe'));
    await answer(dialog, 'Yes, delete it');
    expect(TestBed.inject(SubscriptionsState).selectedReviewId()).toBeNull();
    expect(getRegion(reviewSection, 'Netflix')).toBeTruthy();
    getButton(reviewSection, 'Keep').click();
    fixture.detectChanges();
    await settlePage();
    expect(getRegion(reviewSection, 'Cloud')).toBeTruthy();
  });
  it('deletes the current normal review subscription without moving focus into review and reopens fresh', async () => {
    const { fixture, region, open, answer } = await prepareDelete();
    const reviewSection = getRegion(
      fixture.nativeElement as HTMLElement,
      'Would you still subscribe today?',
    );
    expect(getRegion(reviewSection, 'Spotify')).toBeTruthy();
    const { dialog } = await open('Spotify');
    await answer(dialog, 'Yes, delete it');
    expect(getRegion(reviewSection, 'Netflix')).toBeTruthy();
    expect(document.activeElement).toBe(getButton(getList(region, 'Subscriptions'), 'Netflix'));
    expect(reviewSection.contains(document.activeElement)).toBe(false);
    await open('Cloud');
    expect(dialog.open).toBe(true);
    expect(document.activeElement).toBe(getButtonByAccessibleName(dialog, 'Close'));
    expect(
      document.getElementById(dialog.getAttribute('aria-labelledby')!)?.textContent?.trim(),
    ).toBe('Did you already cancel Cloud?');
    await answer(dialog, 'Close');
    expect(region.querySelector('[aria-label="Delete Cloud"]')).not.toBeNull();
  });

  it('handles a native close event without cancel by clearing the dialog and returning focus without saving', async () => {
    const { fixture, storage, open } = await prepareDelete();
    const { dialog, trigger } = await open('Spotify');
    const saves = storage.savedStates.length;
    dialog.close();
    fixture.detectChanges();
    await settlePage();
    expect(document.activeElement).toBe(trigger);
    expect(dialog.textContent).not.toContain('Did you already cancel');
    expect(storage.savedStates).toHaveLength(saves);
  });
});
