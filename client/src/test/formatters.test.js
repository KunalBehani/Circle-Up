import { describe, it, expect } from 'vitest';
import { formatRelativeTime, formatNumber, extractDomain } from '../utils/formatters.js';

describe('Frontend Utilities: formatters', () => {
  it('formats numbers compactly', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(1200000)).toBe('1.2M');
  });

  it('extracts domains correctly from URLs', () => {
    expect(extractDomain('https://vite.dev/guide/')).toBe('vite.dev');
    expect(extractDomain('https://www.github.com/facebook/react')).toBe('github.com');
  });

  it('formats relative timestamps cleanly', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('just now');

    const oneHourAgo = new Date(Date.now() - 3600 * 1000);
    expect(formatRelativeTime(oneHourAgo)).toBe('1h ago');

    const twoDaysAgo = new Date(Date.now() - 48 * 3600 * 1000);
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago');
  });
});
