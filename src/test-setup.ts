function matchMedia(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  };
}

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: matchMedia,
});

Object.defineProperty(Element.prototype, 'scrollIntoView', {
  configurable: true,
  value: () => undefined,
});

// jsdom has no native modal implementation. Only model open/close here;
// focus trapping and page inertness must be checked in a real browser.
HTMLDialogElement.prototype.showModal = function (): void {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function (): void {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
};
