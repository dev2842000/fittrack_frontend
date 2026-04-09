/**
 * FitTrack Design Tokens
 *
 * Single source of truth for all recurring Tailwind class combinations.
 * Import what you need:
 *
 *   import { card, input, btn, text, bg, border, brand } from '@/lib/theme';
 *
 * Usage:
 *   <div className={card.base}>...</div>
 *   <input className={input.md} />
 *   <button className={`${btn.primary} px-6 py-2.5`}>Save</button>
 */

// ─── Page backgrounds ──────────────────────────────────────────────────────
export const bg = {
  /** Main page / screen background */
  page:   'bg-gray-50 dark:bg-gray-950',
  /** Standard card / panel surface */
  card:   'bg-white dark:bg-gray-800',
  /** Subtler surface — list rows, selected states, inset areas */
  subtle: 'bg-gray-50 dark:bg-gray-700/50',
  /** Sticky nav / header */
  nav:    'bg-white/80 dark:bg-gray-900/80',
} as const;

// ─── Text ──────────────────────────────────────────────────────────────────
export const text = {
  /** Page/card headings and primary content */
  heading: 'text-gray-900 dark:text-white',
  /** Supporting / secondary body copy */
  body:    'text-gray-600 dark:text-gray-400',
  /** De-emphasised metadata, helper text */
  muted:   'text-gray-500 dark:text-gray-400',
  /** Tiny labels, captions, timestamps */
  label:   'text-xs text-gray-400 dark:text-gray-500',
  /** Text that sits on a brand-green background */
  onBrand: 'text-white',
} as const;

// ─── Borders ───────────────────────────────────────────────────────────────
export const border = {
  /** Standard card/container border */
  default: 'border border-gray-200 dark:border-gray-700',
  /** Slightly subtler variant used on inner card sections */
  subtle:  'border border-gray-100 dark:border-gray-700',
  /** Input / form element border */
  input:   'border border-gray-200 dark:border-gray-600',
} as const;

// ─── Brand / accent ────────────────────────────────────────────────────────
export const brand = {
  /** Horizontal gradient (buttons, headers) */
  gradient:   'bg-gradient-to-r from-green-500 to-emerald-600',
  /** Diagonal gradient (hero cards, banners) */
  gradientBr: 'bg-gradient-to-br from-green-500 to-emerald-600',
  /** Primary green text */
  text:       'text-green-500',
  /** Solid green background */
  bg:         'bg-green-500',
  /** Green pill badge / tag */
  badge:      'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
  /** Focus ring applied to interactive elements */
  focusRing:  'focus:outline-none focus:ring-2 focus:ring-green-500',
} as const;

// ─── Cards & panels ────────────────────────────────────────────────────────
export const card = {
  /** Standard card — use for any surfaced container */
  base:   'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm',
  /** Same card with overflow clipped (for gradient headers, flush images) */
  flush:  'bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden',
  /** Elevated modal / bottom-sheet surface */
  modal:  'bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700',
  /** Inset / nested card within a larger card */
  inset:  'bg-gray-50 dark:bg-gray-700/50 rounded-xl',
} as const;

// ─── Form inputs ───────────────────────────────────────────────────────────
export const input = {
  /** Standard size — py-2.5, used for main forms */
  md: 'w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all',
  /** Compact size — py-2, used inside modals / small panels */
  sm: 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500',
} as const;

// ─── Buttons ───────────────────────────────────────────────────────────────
export const btn = {
  /**
   * Full-width or block primary action.
   * Add your own px / py sizing.
   * Example: <button className={`${btn.primary} w-full py-3`}>Save</button>
   */
  primary:
    'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none',

  /**
   * Secondary / cancel — outlined style.
   */
  secondary:
    'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',

  /**
   * Destructive / delete action (icon or text).
   */
  danger:
    'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors',

  /**
   * Square icon button (back arrow, close, etc.).
   */
  icon:
    'w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white shadow-sm transition-colors',

  /**
   * Pill-shaped filter chip — combine with chipActive or chipInactive.
   * Example: <button className={`${btn.chip} ${active ? btn.chipActive : btn.chipInactive}`}>Chest</button>
   */
  chip:        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
  chipActive:  'bg-green-500 text-white',
  chipInactive:'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-green-400',
} as const;

// ─── Section header gradient banner ────────────────────────────────────────
/**
 * The green gradient banner used at the top of main sections
 * (Exercise Library, Workout History, etc.)
 *
 * Usage:
 *   <div className={`${banner} p-6 flex items-center justify-between`}>
 */
export const banner =
  'bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl shadow-green-500/20 relative overflow-hidden';

// ─── Convenience re-export (use `theme.card.base` etc.) ───────────────────
const theme = { bg, text, border, brand, card, input, btn, banner };
export default theme;
