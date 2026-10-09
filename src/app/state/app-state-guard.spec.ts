import { type AppState } from '../domain/subscription';
import { isAppState } from './app-state-guard';

describe('isAppState', () => {
  function validState(name = 'Subscription'): AppState {
    return {
      version: 1,
      subscriptions: [
        {
          id: 'subscription',
          sequence: 0,
          name,
          price: 10,
          billingFrequency: 'monthly',
          currency: 'EUR',
          reason: 'Essential',
          usage: 'Daily',
          usageConfirmed: false,
          decision: null,
        },
      ],
      preferredCurrency: 'EUR',
      nextSequence: 1,
    };
  }

  it('accepts a valid app state', () => {
    expect(isAppState(validState())).toBe(true);
  });

  it.each(['', '   ', 'a'.repeat(41)])('rejects the invalid stored name %j', (name) => {
    expect(isAppState(validState(name))).toBe(false);
  });

  it('accepts a 40-character stored name', () => {
    expect(isAppState(validState('a'.repeat(40)))).toBe(true);
  });

  it('rejects a stored price of zero', () => {
    const state = validState();
    state.subscriptions[0].price = 0;

    expect(isAppState(state)).toBe(false);
  });

  it('rejects a stored price with more than two decimal places', () => {
    const state = validState();
    state.subscriptions[0].price = 10.123;

    expect(isAppState(state)).toBe(false);
  });

  it('accepts a stored price with two decimal places', () => {
    const state = validState();
    state.subscriptions[0].price = 10.12;

    expect(isAppState(state)).toBe(true);
  });
});
