#!/usr/bin/env node
/*
 * Enforces AGENTS.md §9 for every right-hand side panel:
 *   1. one shared width (SIDE_PANEL_CLASS), never a width of its own, and
 *   2. everything outside the panel keeps working: the positioning layer comes
 *      from SIDE_PANEL_OVERLAY_CLASS (clicks fall through), never a hand-written
 *      `fixed inset-0 ... justify-end` layer, which would dim/block the page.
 *
 * A file is a right-hand panel when it contains such a full-screen layer or uses
 * the shared overlay constant. Panels built on SidePanelShell satisfy both rules.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SOURCE_DIRS = ['components', 'app'];
const USES_SHELL = /SidePanelShell/;
const USES_SHARED_PANEL_CLASS = /SIDE_PANEL_CLASS/;
const USES_SHARED_OVERLAY = /SIDE_PANEL_OVERLAY_CLASS/;
// A hand-written full-screen right-aligned layer (it would catch or dim clicks meant for the page).
const HAND_WRITTEN_OVERLAY = /fixed inset-0[^"'`\n]*justify-end|justify-end[^"'`\n]*fixed inset-0/;
// Own width classes a panel must not use (the shared constant replaces them).
const OWN_WIDTH = /(?:^|[\s"'`])(?:sm:|md:|lg:)?(?:max-w-(?:xs|sm|md|lg|xl|2xl|\[\d+px\])|w-\[\d+px\])(?=[\s"'`])/;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.tsx') ? [path] : [];
  });

const problems = [];
for (const file of SOURCE_DIRS.flatMap((dir) => walk(join(ROOT, dir)))) {
  const source = readFileSync(file, 'utf8');
  const name = relative(ROOT, file);
  const handWrittenOverlay = HAND_WRITTEN_OVERLAY.test(source);
  const isPanel = handWrittenOverlay || USES_SHARED_OVERLAY.test(source);
  if (!isPanel) continue;

  if (handWrittenOverlay) {
    problems.push(`${name}: hand-written full-screen panel layer. Use SIDE_PANEL_OVERLAY_CLASS (or SidePanelShell) so the page behind the panel stays usable`);
  }
  if (!USES_SHELL.test(source) && !USES_SHARED_PANEL_CLASS.test(source)) {
    problems.push(`${name}: right-hand panel without the shared width/click class (use SidePanelShell or SIDE_PANEL_CLASS)`);
    continue;
  }
  // The panel element carries the shared class: it must not also set its own width.
  const panelLine = source.split('\n').find((line) => line.includes('SIDE_PANEL_CLASS') && /className/.test(line));
  if (panelLine && OWN_WIDTH.test(panelLine.replace('${SIDE_PANEL_CLASS}', ''))) {
    problems.push(`${name}: panel sets its own width next to SIDE_PANEL_CLASS`);
  }
}

if (problems.length) {
  console.error('Side panel rule (AGENTS.md §9) violated:\n' + problems.map((p) => ` - ${p}`).join('\n'));
  process.exit(1);
}
console.log('Side panel rule: OK');
