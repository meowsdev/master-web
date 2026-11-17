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

/**
 * Applied to the main chat area while a panel is open, so the chat, its header and the message box
 * shrink to the space beside the panel instead of hiding under it (send button included).
 * 570px must match SIDE_PANEL_CLASS. Below 1400px the chat would be too narrow to use next to the
 * rail, the list and the panel, so there the panel simply covers it.
 */
export const SIDE_PANEL_RESERVE_CLASS = 'min-[1400px]:pr-[570px]';

/**
 * Height of every top bar that can sit side by side: the side panel header and the chat headers.
 * One value keeps their bottom borders on the same horizontal line (60px, a little shorter than the Figma panel's 65px).
 * Change it here, never in a single header.
 */
export const HEADER_BAR_HEIGHT_CLASS = 'h-[55px]';
