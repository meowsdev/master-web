/*
 * The shared look-and-behaviour classes of every right-hand side panel (Create
 * Account, Edit Profile, service details, orders, settings, ...).
 *
 * Rules (AGENTS.md §9). They are enforced by `pnpm check:panels`:
 *  1. One width: SIDE_PANEL_CLASS (570px from the Figma "Create Account" frame,
 *     full width on small screens). Never write a panel width of your own.
 *  2. Everything outside the panel keeps working: the overlay that positions a
 *     panel lets clicks fall through (SIDE_PANEL_OVERLAY_CLASS) and only the panel
 *     itself catches them. No dimmed backdrop, no click-catching layer. Whatever
 *     is still visible beside the panel (rail, list, search...) must stay usable.
 *     The one exception is SIDE_PANEL_BLOCKING_OVERLAY_CLASS, for an unfinished
 *     sign-up that must not be abandoned.
 *  3. Only one panel is open at a time (useSuperAppModals closes the others).
 *
 * The class strings are written out in full on purpose: Tailwind only generates
 * classes it can find as literal text in the source.
 */

/** The panel element: shared width, and it is the only part of the overlay that takes clicks. */
export const SIDE_PANEL_CLASS = 'pointer-events-auto w-full max-w-[570px]';

/** Full-screen positioning layer for a panel. Clicks fall through to the page behind it. */
export const SIDE_PANEL_OVERLAY_CLASS = 'fixed inset-0 z-50 flex justify-end pointer-events-none';

/** Same layer, but clicks outside the panel are caught (and ignored). Only for an unfinished sign-up. */
export const SIDE_PANEL_BLOCKING_OVERLAY_CLASS = 'fixed inset-0 z-50 flex justify-end';
