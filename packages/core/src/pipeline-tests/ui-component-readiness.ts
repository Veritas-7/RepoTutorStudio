// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

describe("RepoTutor core pipeline - ui-component-readiness", () => {
  it("detects Zag scroll-area machine readiness without scrolling viewports", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-scroll-area-machine-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-scroll-area-machine-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "scroll-area-machine-notes.tsx"), [
      "import { createAnatomy } from '@zag-js/anatomy';",
      "import { createMachine } from '@zag-js/core';",
      "import { addDomEvent, getEventPoint, getEventTarget, query, setStyleProperty, trackPointerMove } from '@zag-js/dom-query';",
      "import type { NormalizeProps, Orientation, Point, PropTypes, Size } from '@zag-js/types';",
      "import { callAll, clampValue, compact, ensureProps, isEqual, toPx } from '@zag-js/utils';",
      "import * as scrollArea from '@zag-js/scroll-area';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import React from 'react';",
      "",
      "const anatomy = createAnatomy('scroll-area').parts('root', 'viewport', 'content', 'scrollbar', 'thumb', 'corner');",
      "const machine = createMachine<ScrollAreaSchema>({ props({ props }) { ensureProps(props, ['id']); return props; }, context({ bindable }) { return { scrollingX: bindable<boolean>(() => ({ defaultValue: false })), scrollingY: bindable<boolean>(() => ({ defaultValue: false })), hovering: bindable<boolean>(() => ({ defaultValue: false })), dragging: bindable<boolean>(() => ({ defaultValue: false })), touchModality: bindable<boolean>(() => ({ defaultValue: false })), atSides: bindable<ScrollRecord<boolean>>(() => ({ defaultValue: { top: true, right: false, bottom: false, left: true } })), cornerSize: bindable<Size>(() => ({ defaultValue: { width: 0, height: 0 } })), thumbSize: bindable<Size>(() => ({ defaultValue: { width: 0, height: 0 } })), hiddenState: bindable<ScrollbarHiddenState>(() => ({ defaultValue: { scrollbarYHidden: false, scrollbarXHidden: false, cornerHidden: false }, hash(a) { return `Y:${a.scrollbarYHidden} X:${a.scrollbarXHidden} C:${a.cornerHidden}` } })) }; }, refs() { return { orientation: 'vertical', scrollPosition: { x: 0, y: 0 }, scrollYTimeout: new Timeout(), scrollXTimeout: new Timeout(), scrollEndTimeout: new Timeout(), startX: 0, startY: 0, startScrollTop: 0, startScrollLeft: 0, programmaticScroll: true }; }, initialState() { return 'idle'; }, watch({ track, prop, context, send }) { track([() => prop('dir'), () => context.hash('hiddenState')], () => send({ type: 'thumb.measure' })); }, effects: ['trackContentResize', 'trackViewportVisibility', 'trackWheelEvent'], entry: ['checkHovering'], exit: ['clearTimeouts'], on: { 'thumb.measure': { actions: ['setThumbSize'] }, 'viewport.scroll': { actions: ['setThumbSize', 'setScrolling', 'setProgrammaticScroll'] }, 'root.pointerenter': { actions: ['setTouchModality', 'setHovering'] }, 'root.pointerdown': { actions: ['setTouchModality'] }, 'root.pointerleave': { actions: ['clearHovering'] } }, states: { idle: { on: { 'scrollbar.pointerdown': { target: 'dragging', actions: ['scrollToPointer', 'startDragging'] }, 'thumb.pointerdown': { target: 'dragging', actions: ['startDragging'] } } }, dragging: { effects: ['trackPointerMove'], on: { 'thumb.pointermove': { actions: ['setDraggingScroll'] }, 'scrollbar.pointerup': { target: 'idle', actions: ['stopDragging'] }, 'thumb.pointerup': { target: 'idle', actions: ['clearScrolling', 'stopDragging'] } } } }, implementations: { actions: { setTouchModality() {}, setHovering() {}, clearHovering() {}, setProgrammaticScroll() {}, clearScrolling() {}, setThumbSize() { setStyleProperty(null, '--scroll-area-overflow-x-start', '0px'); setStyleProperty(null, '--scroll-area-overflow-x-end', '0px'); setStyleProperty(null, '--scroll-area-overflow-y-start', '0px'); setStyleProperty(null, '--scroll-area-overflow-y-end', '0px'); clampValue(0, 0, 1); isEqual({}, {}); }, checkHovering() {}, setScrolling() {}, scrollToPointer() {}, startDragging() {}, setDraggingScroll() {}, stopDragging() {}, clearTimeouts() {} }, effects: { trackContentResize() { new ResizeObserver(() => {}); }, trackViewportVisibility() { new IntersectionObserver(() => {}); }, trackWheelEvent() { addDomEvent(null, 'wheel', () => {}, { passive: false }); return callAll(); }, trackPointerMove() { return trackPointerMove(document, { onPointerMove({ point }) {}, onPointerUp() {} }); } } } });",
      "",
      "class Timeout { start(delay: number, fn: Function) { setTimeout(fn, delay); } clear() {} disposeEffect() { return this.clear; } }",
      "type ScrollRecord<T> = Record<'top' | 'right' | 'bottom' | 'left', T>;",
      "type ScrollbarHiddenState = { scrollbarYHidden: boolean; scrollbarXHidden: boolean; cornerHidden: boolean };",
      "type ScrollAreaSchema = any;",
      "function getScrollOffset() { return 0; }",
      "function getScrollSides() { return { top: true, right: false, bottom: false, left: true }; }",
      "function getScrollProgress() { return { x: 0, y: 0 }; }",
      "function scrollTo(node: HTMLElement | null | undefined, options = {}) { compact(options); node?.scrollTo(options as ScrollToOptions); }",
      "function smoothScroll(node: HTMLElement | null | undefined) { requestAnimationFrame(() => node?.scrollTo({ top: 0, left: 0 })); }",
      "function scrollToEdge(node: HTMLElement | null | undefined, edge: 'top' | 'right' | 'bottom' | 'left', dir?: 'ltr' | 'rtl') { const isRtl = dir === 'rtl'; smoothScroll(node); return { edge, isRtl }; }",
      "",
      "const dom = { getRootId: 'root-id', getViewportId: 'viewport-id', getContentId: 'content-id', getRootEl: 'root-el', getViewportEl: 'viewport-el', getContentEl: 'content-el', getScrollbarXEl: 'scrollbar-x-el', getScrollbarYEl: 'scrollbar-y-el', getThumbXEl: 'thumb-x-el', getThumbYEl: 'thumb-y-el', getCornerEl: 'corner-el', query };",
      "",
      "export function ScrollAreaMachineProbe() {",
      "  const service = useMachine(scrollArea.machine, { id: 'docs-scroll', dir: 'rtl' });",
      "  const api = scrollArea.connect(service, normalizeProps);",
      "  api.isAtTop; api.isAtBottom; api.isAtLeft; api.isAtRight; api.hasOverflowX; api.hasOverflowY; api.getScrollProgress(); api.scrollToEdge({ edge: 'bottom', behavior: 'smooth' }); api.scrollTo({ top: 24, left: 12, behavior: 'smooth' }); api.getScrollbarState({ orientation: 'horizontal' }); api.getScrollbarState({ orientation: 'vertical' });",
      "  const evidence = 'isAtTop isAtBottom isAtLeft isAtRight hasOverflowX hasOverflowY getScrollProgress scrollToEdge scrollTo getScrollbarState getRootProps getViewportProps getContentProps getScrollbarProps getThumbProps getCornerProps onPointerEnter onPointerMove onPointerDown onPointerLeave onScroll onWheel onTouchMove onKeyDown getEventTarget contains getEventPoint data-overflow-x data-overflow-y data-ownedby data-orientation data-scrolling data-hover data-dragging data-state hidden visible --corner-width --corner-height --thumb-width --thumb-height position absolute touchAction userSelect WebkitUserSelect toPx';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <div {...api.getViewportProps()}><div {...api.getContentProps()}>Scrollable content</div></div>",
      "      <div {...api.getScrollbarProps({ orientation: 'vertical' })}><div {...api.getThumbProps({ orientation: 'vertical' })} /></div>",
      "      <div {...api.getScrollbarProps({ orientation: 'horizontal' })}><div {...api.getThumbProps({ orientation: 'horizontal' })} /></div>",
      "      <div {...api.getCornerProps()} />",
      "      {String(machine)}{JSON.stringify(dom)}{String(getScrollOffset)}{String(getScrollSides)}{String(getScrollProgress)}{String(scrollTo)}{String(smoothScroll)}{String(scrollToEdge)}{String(anatomy)}{String(addDomEvent)}{String(setStyleProperty)}{String(trackPointerMove)}{String(getEventPoint)}{String(getEventTarget)}{String(callAll)}{String(clampValue)}{String(ensureProps)}{String(isEqual)}{String(toPx)}{String(React)}",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/scroll-area": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "scroll-area-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      refSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      utilitySignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "props-ensure-id", "bindable-context", "refs", "initial-idle", "watch-hidden-state", "top-level-effects", "entry-check-hovering", "exit-clear-timeouts", "thumb-measure-event", "viewport-scroll-event", "root-pointer-events", "idle-state", "dragging-state", "scrollbar-pointerdown-event", "thumb-pointerdown-event", "thumb-pointermove-event", "pointerup-events"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["scrolling-x", "scrolling-y", "hovering", "dragging", "touch-modality", "at-sides", "corner-size", "thumb-size", "hidden-state"]));
    expect(readySignals(report.refSignals)).toEqual(expect.arrayContaining(["orientation-ref", "scroll-position-ref", "scroll-y-timeout", "scroll-x-timeout", "scroll-end-timeout", "start-x", "start-y", "start-scroll-top", "start-scroll-left", "programmatic-scroll"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-content-resize", "resize-observer", "track-viewport-visibility", "intersection-observer", "track-wheel-event", "add-dom-event", "track-pointer-move"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-touch-modality", "set-hovering", "clear-hovering", "set-programmatic-scroll", "clear-scrolling", "set-thumb-size", "set-overflow-css-vars", "set-at-sides", "scroll-to-pointer", "start-dragging", "set-dragging-scroll", "stop-dragging", "clear-timeouts"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "viewport-id", "content-id", "root-el", "viewport-el", "content-el", "scrollbar-x-el", "scrollbar-y-el", "thumb-x-el", "thumb-y-el", "corner-el"]));
    expect(readySignals(report.utilitySignals)).toEqual(expect.arrayContaining(["scroll-offset", "scroll-sides", "timeout", "scroll-to", "smooth-scroll", "scroll-progress", "scroll-to-edge", "rtl-scroll", "compact-scroll-options", "request-animation-frame"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["is-at-top", "is-at-bottom", "is-at-left", "is-at-right", "has-overflow-x", "has-overflow-y", "get-scroll-progress", "scroll-to-edge", "scroll-to", "get-scrollbar-state", "root-props", "viewport-props", "content-props", "scrollbar-props", "thumb-props", "corner-props", "root-pointer-handlers", "viewport-scroll-handler", "viewport-user-interaction", "scrollbar-pointer-handlers", "thumb-pointer-handler", "data-overflow", "data-ownedby", "data-orientation", "data-scrolling", "data-hover", "data-dragging", "corner-state", "css-vars"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/scroll-area", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "scroll-area-readiness.md"), "utf8");
    expect(markdown).toContain("Machine Signals");
    expect(markdown).toContain("@zag-js/scroll-area");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "scroll-area-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("@zag-js/scroll-area");
  });

  it("detects avatar readiness without loading images", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-avatar-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-avatar-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "radix-avatar.tsx"), [
      "import * as React from 'react';",
      "import * as Avatar from '@radix-ui/react-avatar';",
      "export function RadixAvatarCard() {",
      "  const [status, setStatus] = React.useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');",
      "  const hydrationEvidence = 'useIsHydrated complete naturalWidth naturalHeight renderToString hydrate SSR';",
      "  void hydrationEvidence;",
      "  return (",
      "    <Avatar.Root data-testid=\"avatar-root\" aria-label=\"Ada Lovelace avatar\">",
      "      <Avatar.Image src=\"/ada.png\" srcSet=\"/ada@2x.png 2x\" alt=\"Ada Lovelace\" referrerPolicy=\"no-referrer\" crossOrigin=\"anonymous\" onLoadingStatusChange={setStatus} data-state={status} />",
      "      <Avatar.Fallback delayMs={300} data-testid=\"avatar-fallback\">AL</Avatar.Fallback>",
      "    </Avatar.Root>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "zag-avatar.tsx"), [
      "import * as avatar from '@zag-js/avatar';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagAvatarCard() {",
      "  const service = useMachine(avatar.machine, { id: 'profile-avatar', dir: 'ltr', ids: { root: 'avatar-root', image: 'avatar-image', fallback: 'avatar-fallback' }, onStatusChange(details) { console.log(details.status); } });",
      "  const api = avatar.connect(service, normalizeProps);",
      "  const removalEvidence = 'trackImageRemoval img.unmount observeChildren removedNodes';",
      "  void removalEvidence;",
      "  api.setSrc('/next-avatar.png');",
      "  api.setLoaded();",
      "  api.setError();",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"avatar\" data-part=\"root\">",
      "      <img {...api.getImageProps()} src=\"/avatar.png\" srcSet=\"/avatar@2x.png 2x\" alt=\"Profile avatar\" />",
      "      <span {...api.getFallbackProps()} data-state={api.loaded ? 'hidden' : 'visible'}>PA</span>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "avatar.spec.tsx"), [
      "import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';",
      "import { axe } from 'vitest-axe';",
      "import { renderToString } from 'react-dom/server';",
      "import { afterEach, describe, expect, it } from 'vitest';",
      "import { RadixAvatarCard } from '../src/radix-avatar';",
      "afterEach(cleanup);",
      "describe('avatar readiness', () => {",
      "  it('keeps fallback image loading and accessibility testable', async () => {",
      "    const rendered = render(<RadixAvatarCard />);",
      "    expect(await axe(rendered.container)).toHaveNoViolations();",
      "    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('AL');",
      "    await waitFor(() => expect(screen.queryByRole('img')).not.toBeInTheDocument());",
      "    const html = renderToString(<RadixAvatarCard />);",
      "    expect(html).toContain('avatar-root');",
      "    const image = document.createElement('img');",
      "    fireEvent.load(image);",
      "    fireEvent.error(image);",
      "    expect(screen.queryByAltText('Ada Lovelace')).not.toBeInTheDocument();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "avatar.yml"), [
      "name: avatar",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- avatar",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: avatar-traces",
      "          path: test-results/avatar"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@radix-ui/react-avatar": "latest",
        "@zag-js/avatar": "latest",
        "@zag-js/react": "latest",
        "react": "latest",
        "react-dom": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "vitest": "latest",
        "vitest-axe": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "avatar-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      avatarSetups: Array<{ filePath: string; framework: string; avatarCount: number; imageCount: number; fallbackCount: number; loadingStatusCount: number; delayCount: number; srcCount: number; altCount: number; eventCount: number; ssrCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      imageSignals: Array<{ signal: string; readiness: string }>;
      eventSignals: Array<{ signal: string; readiness: string }>;
      ssrSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Avatar readiness Radix Avatar Zag avatar image fallback loading loaded error delayMs alt src srcset SSR axe tests");
    expect(report.avatarSetups.some((item) => item.filePath === "src/radix-avatar.tsx" && item.framework === "radix-avatar" && item.avatarCount > 0 && item.imageCount > 0 && item.fallbackCount > 0 && item.loadingStatusCount > 0 && item.delayCount > 0 && item.srcCount > 0 && item.altCount > 0 && item.ssrCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.avatarSetups.some((item) => item.filePath === "src/zag-avatar.tsx" && item.framework === "zag-avatar" && item.avatarCount > 0 && item.imageCount > 0 && item.fallbackCount > 0 && item.loadingStatusCount > 0 && item.srcCount > 0 && item.altCount > 0 && item.eventCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-avatar", "zag-avatar", "native-img"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "image", "fallback", "provider-context", "anatomy-parts"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "loading", "loaded", "error", "data-state", "hidden", "delay"]));
    expect(readySignals(report.imageSignals)).toEqual(expect.arrayContaining(["src", "srcset", "alt", "referrer-policy", "crossorigin", "complete", "natural-size"]));
    expect(readySignals(report.eventSignals)).toEqual(expect.arrayContaining(["load-event", "error-event", "src-change", "image-removal", "status-change", "set-loaded-error"]));
    expect(readySignals(report.ssrSignals)).toEqual(expect.arrayContaining(["hydration", "render-to-string", "use-is-hydrated", "server-render"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["alt-text", "role-img", "axe", "label", "fallback-text"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "axe", "wait-for", "role-test", "fallback-test", "ssr-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-avatar", "@zag-js/avatar", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-avatar"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records avatar readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "avatar-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "avatar-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "avatar-readiness.html"))).resolves.toBeUndefined();
    const avatarMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "avatar-readiness.md"), "utf8");
    expect(avatarMarkdown).toContain("Avatar Readiness");
    expect(avatarMarkdown).toContain("@radix-ui/react-avatar");
    const avatarHtml = await fs.readFile(path.join(result.session.outputPaths.html, "avatar-readiness.html"), "utf8");
    expect(avatarHtml).toContain("avatar-readiness-card");
    expect(avatarHtml).toContain("data-source-pattern=\"Avatar\"");
    expect(avatarHtml).toContain("RepoTutor records avatar readiness only");
  });

  it("detects Zag avatar machine readiness from source-confirmed contracts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-avatar-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-avatar-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-avatar-machine.tsx"), [
      "import * as avatar from '@zag-js/avatar';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagAvatarMachineProbe() {",
      "  const service = useMachine(avatar.machine, { id: 'avatar-machine', ids: { root: 'zag-avatar-root', image: 'zag-avatar-image', fallback: 'zag-avatar-fallback' }, onStatusChange(details) { console.log(details.status); } });",
      "  const api = avatar.connect(service, normalizeProps);",
      "  const machineContract = 'createMachine initialState loading states loaded error src.change img.unmount img.loaded img.error checkImageStatus invokeOnLoad invokeOnError onStatusChange';",
      "  const effectContract = 'trackImageRemoval trackSrcChange observeChildren observeAttributes removedNodes src srcset';",
      "  const domContract = 'getRootId getImageId getFallbackId getRootEl getImageEl data-scope avatar data-part image data-state hidden';",
      "  void machineContract;",
      "  void effectContract;",
      "  void domContract;",
      "  api.setSrc('/next-avatar.png');",
      "  api.setLoaded();",
      "  api.setError();",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"avatar\" data-part=\"root\">",
      "      <img {...api.getImageProps()} src=\"/avatar.png\" srcSet=\"/avatar@2x.png 2x\" alt=\"Zag avatar\" />",
      "      <span {...api.getFallbackProps()} hidden={api.loaded} data-state={api.loaded ? 'hidden' : 'visible'}>ZA</span>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/avatar": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "avatar-readiness-report.json"), "utf8")) as {
      avatarSetups: Array<{ filePath: string; framework: string; avatarCount: number; imageCount: number; fallbackCount: number; loadingStatusCount: number; srcCount: number; altCount: number; eventCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.avatarSetups.some((item) => item.filePath === "src/zag-avatar-machine.tsx" && item.framework === "zag-avatar" && item.avatarCount > 0 && item.imageCount > 0 && item.fallbackCount > 0 && item.loadingStatusCount > 0 && item.srcCount > 0 && item.altCount > 0 && item.eventCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-avatar"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "loading-state", "loaded-state", "error-state", "src-change-event", "image-unmount-event", "image-loaded-event", "image-error-event", "check-image-status", "status-callback"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-image-removal", "track-src-change", "observe-children", "observe-attributes", "removed-nodes", "src-srcset-watch"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "image-id", "fallback-id", "root-el", "image-el", "data-scope-part", "data-state", "hidden"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["loaded", "set-src", "set-loaded", "set-error", "root-props", "image-props", "fallback-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/avatar", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const avatarMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "avatar-readiness.md"), "utf8");
    expect(avatarMarkdown).toContain("Machine Signals");
    expect(avatarMarkdown).toContain("@zag-js/avatar");
    const avatarHtml = await fs.readFile(path.join(result.session.outputPaths.html, "avatar-readiness.html"), "utf8");
    expect(avatarHtml).toContain("Machine Signals");
    expect(avatarHtml).toContain("@zag-js/avatar");
  });

  it("detects pin input readiness without entering codes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-pin-input-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-pin-input-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "radix-otp.tsx"), [
      "import * as React from 'react';",
      "import * as OneTimePasswordField from '@radix-ui/react-one-time-password-field';",
      "export function RadixOtpForm() {",
      "  const [value, setValue] = React.useState('');",
      "  const validationEvidence = 'validationType numeric alpha alphanumeric sanitizeValue pattern inputMode one-time-code';",
      "  const actionEvidence = 'SET_CHAR CLEAR_CHAR PASTE onBeforeInput INPUT.CHANGE onChange Backspace Delete ArrowLeft ArrowRight Home End autoSubmit requestSubmit reset useIsHydrated RovingFocusGroup focusedIndex setFocusedIndex focusedValue advanceFocusedIndex INPUT.ADVANCE';",
      "  void validationEvidence;",
      "  void actionEvidence;",
      "  return (",
      "    <form id=\"otp-form\">",
      "      <OneTimePasswordField.Root value={value} defaultValue=\"\" onValueChange={setValue} onAutoSubmit={() => undefined} autoSubmit autoComplete=\"one-time-code\" autoFocus form=\"otp-form\" name=\"code\" placeholder=\"------\" type=\"password\" orientation=\"horizontal\" dir=\"ltr\" validationType=\"numeric\" sanitizeValue={(text) => text.replace(/-/g, '')} role=\"group\" aria-label=\"One-time code\">",
      "        <OneTimePasswordField.Input index={0} onInvalidChange={() => undefined} />",
      "        <OneTimePasswordField.Input index={1} />",
      "        <OneTimePasswordField.HiddenInput name=\"code\" />",
      "      </OneTimePasswordField.Root>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "zag-pin-input.tsx"), [
      "import * as pinInput from '@zag-js/pin-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagPinInputForm() {",
      "  const service = useMachine(pinInput.machine, { id: 'pin-code', name: 'pin', form: 'pin-form', count: 6, otp: true, type: 'numeric', pattern: '[0-9]', mask: true, autoFocus: true, autoSubmit: true, blurOnComplete: true, selectOnFocus: true, required: true, invalid: false, readOnly: false, disabled: false, defaultValue: ['', '', '', '', '', ''], onValueChange(details) { console.log(details.valueAsString); }, onValueComplete(details) { console.log(details.value); }, onValueInvalid(details) { console.warn(details.index); }, sanitizeValue(value) { return value.replace(/\\s/g, ''); }, translations: { inputLabel: (index, length) => `pin code ${index + 1} of ${length}` } });",
      "  const api = pinInput.connect(service, normalizeProps);",
      "  api.focus();",
      "  api.setValue(['1', '2', '3', '4', '5', '6']);",
      "  api.setValueAtIndex(0, '9');",
      "  api.clearValue();",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"pin-input\" data-part=\"root\">",
      "      <label {...api.getLabelProps()}>Code</label>",
      "      <input {...api.getHiddenInputProps()} />",
      "      <div {...api.getControlProps()}>{api.items.map((index) => <input key={index} {...api.getInputProps({ index })} inputMode=\"numeric\" autoComplete=\"one-time-code\" aria-label={`pin code ${index + 1} of ${api.count}`} />)}</div>",
      "      <span data-complete={api.complete}>{api.valueAsString}</span>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "pin-input.spec.tsx"), [
      "import { cleanup, render, screen } from '@testing-library/react';",
      "import { userEvent } from '@testing-library/user-event';",
      "import { axe } from 'vitest-axe';",
      "import { afterEach, describe, expect, it, vi } from 'vitest';",
      "import { RadixOtpForm } from '../src/radix-otp';",
      "afterEach(cleanup);",
      "describe('pin input readiness', () => {",
      "  it('types, pastes, navigates, validates, submits, and remains accessible', async () => {",
      "    const user = userEvent.setup();",
      "    const rendered = render(<RadixOtpForm />);",
      "    expect(await axe(rendered.container)).toHaveNoViolations();",
      "    const inputs = screen.getAllByRole('textbox', { hidden: false });",
      "    await user.click(inputs[0]!);",
      "    await user.keyboard('1{ArrowRight}2{Backspace}{Delete}{Home}{End}{Enter}');",
      "    await user.paste('123456');",
      "    const requestSubmit = vi.fn();",
      "    HTMLFormElement.prototype.requestSubmit = requestSubmit;",
      "    rendered.container.querySelector('form')?.reset();",
      "    expect(screen.getByRole('group', { name: /one-time code/i })).toBeInTheDocument();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "pin-input.yml"), [
      "name: pin-input",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- pin-input",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: pin-input-traces",
      "          path: test-results/pin-input"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@radix-ui/react-one-time-password-field": "latest",
        "@zag-js/pin-input": "latest",
        "@zag-js/react": "latest",
        "react": "latest",
        "react-dom": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest",
        "vitest-axe": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "pin-input-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      pinInputSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; hiddenInputCount: number; valueCount: number; validationCount: number; interactionCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Pin input readiness Radix OneTimePasswordField Zag pin-input OTP hidden input paste keyboard validation form submit accessibility tests");
    expect(report.pinInputSetups.some((item) => item.filePath === "src/radix-otp.tsx" && item.framework === "radix-otp" && item.rootCount > 0 && item.inputCount > 0 && item.hiddenInputCount > 0 && item.valueCount > 0 && item.validationCount > 0 && item.interactionCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.pinInputSetups.some((item) => item.filePath === "src/zag-pin-input.tsx" && item.framework === "zag-pin-input" && item.rootCount > 0 && item.inputCount > 0 && item.hiddenInputCount > 0 && item.valueCount > 0 && item.validationCount > 0 && item.interactionCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["radix-otp", "zag-pin-input", "native-input"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "input", "hidden-input", "label", "control", "collection"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "value-as-string", "complete", "count", "focused-index", "set-value", "clear-value", "set-index"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["numeric", "alpha", "alphanumeric", "pattern", "sanitize", "invalid", "mask"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["paste", "before-input", "change", "backspace", "delete", "arrow-left", "arrow-right", "home", "end", "enter", "focus-blur", "auto-advance"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "form", "auto-submit", "request-submit", "hidden-submit-input", "reset"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "group-role", "input-mode", "autocomplete-one-time-code", "disabled", "readonly", "required"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "axe", "keyboard-test", "paste-test", "form-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@radix-ui/react-one-time-password-field", "@zag-js/pin-input", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@radix-ui/react-one-time-password-field"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records pin input readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "pin-input-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "pin-input-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "pin-input-readiness.html"))).resolves.toBeUndefined();
    const pinMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pin-input-readiness.md"), "utf8");
    expect(pinMarkdown).toContain("Pin Input Readiness");
    expect(pinMarkdown).toContain("@radix-ui/react-one-time-password-field");
    const pinHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pin-input-readiness.html"), "utf8");
    expect(pinHtml).toContain("pin-input-readiness-card");
    expect(pinHtml).toContain("data-source-pattern=\"PinInput\"");
    expect(pinHtml).toContain("RepoTutor records pin input readiness only");
  });

  it("detects Zag pin input machine readiness without entering codes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-pin-input-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-pin-input-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-pin-input-machine.tsx"), [
      "import * as pinInput from '@zag-js/pin-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagPinInputMachineProbe() {",
      "  const service = useMachine(pinInput.machine, { id: 'pin-machine', ids: { root: 'pin-root', hiddenInput: 'pin-hidden', label: 'pin-label', control: 'pin-control', input: (id) => `pin-input-${id}` }, count: 4, autoFocus: true, autoSubmit: true, blurOnComplete: true, selectOnFocus: true, otp: true, type: 'numeric', pattern: '[0-9]', mask: true, required: true, invalid: false, readOnly: false, disabled: false, name: 'code', form: 'code-form', defaultValue: ['', '', '', ''], onValueChange(details) { console.log(details.valueAsString); }, onValueComplete(details) { console.log(details.value); }, onValueInvalid(details) { console.warn(details.index); }, sanitizeValue(value) { return value.replace(/-/g, ''); } });",
      "  const api = pinInput.connect(service, normalizeProps);",
      "  const machineContract = 'createMachine initialState idle states focused VALUE.SET VALUE.CLEAR INPUT.FOCUS INPUT.CHANGE INPUT.ADVANCE INPUT.PASTE INPUT.BLUR INPUT.DELETE INPUT.ARROW_LEFT INPUT.ARROW_RIGHT INPUT.HOME INPUT.END INPUT.BACKSPACE INPUT.ENTER VALUE.INVALID';",
      "  const computedContract = '_value valueLength filledValueLength isValueComplete valueAsString focusedValue bindable focusedIndex count';",
      "  const guardContract = 'autoFocus hasValue isValueComplete hasIndex isValidValue pattern numeric alphabetic alphanumeric sanitizeValue';",
      "  const actionContract = 'setInputCount focusInput selectInputIfNeeded invokeOnComplete invokeOnInvalid dispatchInputEvent syncInputElements requestFormSubmit autoSubmitIfNeeded blurFocusedInputIfNeeded setPastedValue setLastValueFocusIndex';",
      "  const domContract = 'getRootId getInputId getHiddenInputId getLabelId getControlId getInputEls getInputElAtIndex getFirstInputEl getHiddenInputEl setInputValue data-complete data-ownedby data-invalid data-disabled data-readonly data-filled data-index';",
      "  void machineContract;",
      "  void computedContract;",
      "  void guardContract;",
      "  void actionContract;",
      "  void domContract;",
      "  api.focus();",
      "  api.setValue(['1', '2', '3', '4']);",
      "  api.setValueAtIndex(2, '9');",
      "  api.clearValue();",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"pin-input\" data-part=\"root\">",
      "      <label {...api.getLabelProps()}>Code</label>",
      "      <input {...api.getHiddenInputProps()} />",
      "      <div {...api.getControlProps()}>{api.items.map((index) => <input key={index} {...api.getInputProps({ index })} inputMode=\"numeric\" autoComplete=\"one-time-code\" aria-label={`pin code ${index + 1} of ${api.count}`} />)}</div>",
      "      <output data-complete={api.complete}>{api.valueAsString}</output>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/pin-input": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "pin-input-readiness-report.json"), "utf8")) as {
      pinInputSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; hiddenInputCount: number; valueCount: number; validationCount: number; interactionCount: number; formCount: number; accessibilityCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.pinInputSetups.some((item) => item.filePath === "src/zag-pin-input-machine.tsx" && item.framework === "zag-pin-input" && item.rootCount > 0 && item.inputCount > 0 && item.hiddenInputCount > 0 && item.valueCount > 0 && item.validationCount > 0 && item.interactionCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-pin-input"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "focused-state", "value-set-event", "value-clear-event", "input-focus-event", "input-change-event", "input-paste-event", "input-keyboard-events", "value-invalid-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["normalized-value", "value-length", "filled-value-length", "is-value-complete", "value-as-string", "focused-value"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["auto-focus", "has-value", "is-value-complete", "has-index", "valid-value"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-input-count", "focus-input", "select-input", "invoke-complete", "invoke-invalid", "dispatch-input-event", "sync-input-elements", "request-form-submit", "auto-submit"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "input-id", "hidden-input-id", "label-id", "control-id", "input-elements", "data-complete", "data-ownedby", "data-invalid"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["focus", "items", "set-value", "clear-value", "set-value-at-index", "root-props", "label-props", "hidden-input-props", "control-props", "input-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/pin-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const pinMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pin-input-readiness.md"), "utf8");
    expect(pinMarkdown).toContain("Machine Signals");
    expect(pinMarkdown).toContain("@zag-js/pin-input");
    const pinHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pin-input-readiness.html"), "utf8");
    expect(pinHtml).toContain("Machine Signals");
    expect(pinHtml).toContain("@zag-js/pin-input");
  });

  it("detects pagination readiness without changing page state", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-pagination-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-pagination-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-pagination.tsx"), [
      "import * as pagination from '@zag-js/pagination';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagPaginationNav() {",
      "  const guardEvidence = 'clampPage isValidPage Math.min Math.max';",
      "  void guardEvidence;",
      "  const service = useMachine(pagination.machine, { id: 'docs-pages', dir: 'rtl', count: 245, page: 3, defaultPage: 1, pageSize: 25, defaultPageSize: 10, siblingCount: 2, boundaryCount: 1, type: 'link', getPageUrl: ({ page, pageSize }) => `/docs?page=${page}&pageSize=${pageSize}`, onPageChange(details) { console.log(details.page, details.pageSize); }, onPageSizeChange(details) { console.log(details.pageSize); }, translations: { rootLabel: 'Docs pages', firstTriggerLabel: 'First page', prevTriggerLabel: 'Previous page', nextTriggerLabel: 'Next page', lastTriggerLabel: 'Last page', itemLabel: (details) => `Page ${details.page}` } });",
      "  const api = pagination.connect(service, normalizeProps);",
      "  api.setPage(4);",
      "  api.setPageSize(50);",
      "  api.goToNextPage();",
      "  api.goToPrevPage();",
      "  api.goToFirstPage();",
      "  api.goToLastPage();",
      "  api.pageRange;",
      "  api.slice([{ id: 1 }, { id: 2 }, { id: 3 }]);",
      "  return (",
      "    <nav {...api.getRootProps()} aria-label=\"Docs pages\">",
      "      <a {...api.getFirstTriggerProps()}>First</a>",
      "      <a {...api.getPrevTriggerProps()} data-disabled=\"false\">Prev</a>",
      "      {api.pages.map((page, index) => page.type === 'page' ? <a key={page.value} {...api.getItemProps({ page: page.value })} aria-current={page.value === api.page ? 'page' : undefined} data-selected={page.value === api.page}>{page.value}</a> : <span key={index} {...api.getEllipsisProps({ index })}>...</span>)}",
      "      <a {...api.getNextTriggerProps()} href={api.nextPage ? `/docs?page=${api.nextPage}` : undefined}>Next</a>",
      "      <a {...api.getLastTriggerProps()} href={`/docs?page=${api.totalPages}`}>Last</a>",
      "    </nav>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "tanstack-pagination.tsx"), [
      "import * as React from 'react';",
      "import { getCoreRowModel, getPaginationRowModel, useReactTable, type PaginationState } from '@tanstack/react-table';",
      "export function TanStackPaginationTable() {",
      "  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 2, pageSize: 20 });",
      "  const table = useReactTable({ data: [], columns: [], state: { pagination }, onPaginationChange: setPagination, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), manualPagination: true, rowCount: 500, pageCount: 25, autoResetPageIndex: false, paginateExpandedRows: false });",
      "  table.firstPage();",
      "  table.previousPage();",
      "  table.nextPage();",
      "  table.lastPage();",
      "  table.setPageIndex(4);",
      "  table.resetPageIndex();",
      "  table.setPageSize(50);",
      "  table.getCanPreviousPage();",
      "  table.getCanNextPage();",
      "  table.getPageCount();",
      "  table.getPageOptions();",
      "  return (",
      "    <footer aria-label=\"Table pagination\">",
      "      <button type=\"button\" disabled={!table.getCanPreviousPage()}>Previous</button>",
      "      <span>Page {pagination.pageIndex + 1} of {table.getPageCount()}</span>",
      "      <select value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))}><option value=\"20\">20</option><option value=\"50\">50</option></select>",
      "      <button type=\"button\" disabled={!table.getCanNextPage()}>Next</button>",
      "    </footer>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "pagination.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagPaginationNav } from '../src/zag-pagination';",
      "describe('pagination readiness', () => {",
      "  it('keeps current page, disabled links, and table row model testable', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ZagPaginationNav />);",
      "    expect(screen.getByRole('navigation', { name: /docs pages/i })).toBeInTheDocument();",
      "    expect(screen.getByRole('link', { name: /page 3/i })).toHaveAttribute('aria-current', 'page');",
      "    expect(screen.getByText('...')).toBeInTheDocument();",
      "    await user.click(screen.getByRole('link', { name: /next/i }));",
      "    await user.click(screen.getByRole('link', { name: /last/i }));",
      "    expect(document.querySelector('[data-disabled]')).toHaveAttribute('data-disabled');",
      "    expect('row model pagination pageSize pageIndex upload-artifact pagination-traces').toContain('pagination-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "pagination.yml"), [
      "name: pagination",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- pagination",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: pagination-traces",
      "          path: test-results/pagination"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@tanstack/react-table": "latest",
        "@tanstack/table-core": "latest",
        "@zag-js/pagination": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "pagination-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      paginationSetups: Array<{ filePath: string; framework: string; rootCount: number; itemCount: number; triggerCount: number; ellipsisCount: number; pageStateCount: number; pageSizeCount: number; rangeCount: number; navigationCount: number; linkCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      renderSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Pagination readiness Zag pagination TanStack table page pageSize totalPages pageRange next previous first last aria-current disabled tests");
    expect(report.paginationSetups.some((item) => item.filePath === "src/zag-pagination.tsx" && item.framework === "zag-pagination" && item.rootCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.ellipsisCount > 0 && item.pageStateCount > 0 && item.pageSizeCount > 0 && item.rangeCount > 0 && item.navigationCount > 0 && item.linkCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.paginationSetups.some((item) => item.filePath === "src/tanstack-pagination.tsx" && item.framework === "tanstack-table" && item.rootCount > 0 && item.pageStateCount > 0 && item.pageSizeCount > 0 && item.rangeCount > 0 && item.navigationCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-pagination", "tanstack-table", "native-controls"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "item", "ellipsis", "first-trigger", "prev-trigger", "next-trigger", "last-trigger"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["page", "default-page", "page-size", "default-page-size", "total-pages", "page-count", "row-count", "page-range", "manual-pagination", "auto-reset"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["set-page", "set-page-size", "first-page", "previous-page", "next-page", "last-page", "can-next-prev", "clamp", "slice"]));
    expect(readySignals(report.renderSignals)).toEqual(expect.arrayContaining(["button-mode", "link-mode", "href", "selected", "disabled", "ellipsis", "page-options", "row-model"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "aria-current", "data-selected", "data-disabled", "translations", "dir"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "disabled-test", "aria-test", "row-model-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/pagination", "@tanstack/react-table", "@tanstack/table-core", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/pagination"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records pagination readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "pagination-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "pagination-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "pagination-readiness.html"))).resolves.toBeUndefined();
    const paginationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pagination-readiness.md"), "utf8");
    expect(paginationMarkdown).toContain("Pagination Readiness");
    expect(paginationMarkdown).toContain("@zag-js/pagination");
    const paginationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pagination-readiness.html"), "utf8");
    expect(paginationHtml).toContain("pagination-readiness-card");
    expect(paginationHtml).toContain("data-source-pattern=\"Pagination\"");
    expect(paginationHtml).toContain("RepoTutor records pagination readiness only");
  });

  it("detects Zag pagination machine readiness without changing pages", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-pagination-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-pagination-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-pagination-machine.tsx"), [
      "import * as pagination from '@zag-js/pagination';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagPaginationMachineProbe() {",
      "  const service = useMachine(pagination.machine, { id: 'docs-pages', ids: { root: 'pagination-root', firstTrigger: 'pagination-first', prevTrigger: 'pagination-prev', nextTrigger: 'pagination-next', lastTrigger: 'pagination-last', ellipsis: (index) => `pagination-ellipsis-${index}`, item: (page) => `pagination-item-${page}` }, dir: 'ltr', count: 245, page: 3, defaultPage: 1, pageSize: 25, defaultPageSize: 10, siblingCount: 2, boundaryCount: 1, type: 'link', getPageUrl: ({ page, pageSize }) => `/docs?page=${page}&pageSize=${pageSize}`, onPageChange(details) { console.log(details.page, details.pageSize); }, onPageSizeChange(details) { console.log(details.pageSize); }, translations: { rootLabel: 'Docs pages', firstTriggerLabel: 'First page', prevTriggerLabel: 'Previous page', nextTriggerLabel: 'Next page', lastTriggerLabel: 'Last page', itemLabel: (details) => `Page ${details.page} of ${details.totalPages}` } });",
      "  const api = pagination.connect(service, normalizeProps);",
      "  const machineContract = 'createMachine initialState idle bindable page pageSize watch SET_PAGE SET_PAGE_SIZE FIRST_PAGE LAST_PAGE PREVIOUS_PAGE NEXT_PAGE';",
      "  const computedContract = 'totalPages pageRange previousPage nextPage isValidPage computed memo';",
      "  const guardContract = 'isValidPage isValidCount canGoToNextPage canGoToPrevPage';",
      "  const actionContract = 'setPage setPageSize goToFirstPage goToLastPage goToPrevPage goToNextPage setPageIfNeeded clampPage';",
      "  const rangeContract = 'range transform getRange getTransformedRange siblingCount boundaryCount showLeftEllipsis showRightEllipsis ELLIPSIS';",
      "  const domContract = 'getRootId getFirstTriggerId getPrevTriggerId getNextTriggerId getLastTriggerId getEllipsisId getItemId data-selected data-disabled aria-current aria-label';",
      "  void machineContract;",
      "  void computedContract;",
      "  void guardContract;",
      "  void actionContract;",
      "  void rangeContract;",
      "  void domContract;",
      "  api.setPage(4);",
      "  api.setPageSize(50);",
      "  api.goToNextPage();",
      "  api.goToPrevPage();",
      "  api.goToFirstPage();",
      "  api.goToLastPage();",
      "  api.slice([{ id: 1 }, { id: 2 }, { id: 3 }]);",
      "  return (",
      "    <nav {...api.getRootProps()} data-scope=\"pagination\" data-part=\"root\">",
      "      <a {...api.getFirstTriggerProps()}>First</a>",
      "      <a {...api.getPrevTriggerProps()}>Prev</a>",
      "      {api.pages.map((page, index) => page.type === 'page' ? <a key={page.value} {...api.getItemProps({ type: 'page', value: page.value })}>{page.value}</a> : <span key={index} {...api.getEllipsisProps({ index })}>...</span>)}",
      "      <a {...api.getNextTriggerProps()}>Next</a>",
      "      <a {...api.getLastTriggerProps()}>Last</a>",
      "      <output>{api.page}/{api.totalPages}/{api.previousPage}/{api.nextPage}/{api.pageRange.start}-{api.pageRange.end}/{api.count}/{api.pageSize}</output>",
      "    </nav>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/pagination": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "pagination-readiness-report.json"), "utf8")) as {
      paginationSetups: Array<{ filePath: string; framework: string; rootCount: number; itemCount: number; triggerCount: number; ellipsisCount: number; pageStateCount: number; pageSizeCount: number; rangeCount: number; navigationCount: number; linkCount: number; accessibilityCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      rangeSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.paginationSetups.some((item) => item.filePath === "src/zag-pagination-machine.tsx" && item.framework === "zag-pagination" && item.rootCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.ellipsisCount > 0 && item.pageStateCount > 0 && item.pageSizeCount > 0 && item.rangeCount > 0 && item.navigationCount > 0 && item.linkCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-pagination"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "page-bindable", "page-size-bindable", "page-size-watch", "set-page-event", "set-page-size-event", "first-page-event", "previous-page-event", "next-page-event", "last-page-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["total-pages", "page-range", "previous-page", "next-page", "valid-page"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["valid-page", "valid-count", "can-next-page", "can-prev-page"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-page", "set-page-size", "first-page", "previous-page", "next-page", "last-page", "set-page-if-needed", "clamp-page"]));
    expect(readySignals(report.rangeSignals)).toEqual(expect.arrayContaining(["range-helper", "transform-helper", "transformed-range", "sibling-count", "boundary-count", "left-ellipsis", "right-ellipsis", "ellipsis-collapse"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "first-trigger-id", "prev-trigger-id", "next-trigger-id", "last-trigger-id", "ellipsis-id", "item-id", "data-selected", "data-disabled"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["page", "count", "page-size", "total-pages", "pages", "previous-page", "next-page", "page-range", "slice", "set-page", "set-page-size", "first-page", "previous-page-action", "next-page-action", "last-page-action", "root-props", "item-props", "ellipsis-props", "trigger-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/pagination", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const paginationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "pagination-readiness.md"), "utf8");
    expect(paginationMarkdown).toContain("Machine Signals");
    expect(paginationMarkdown).toContain("@zag-js/pagination");
    const paginationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "pagination-readiness.html"), "utf8");
    expect(paginationHtml).toContain("Machine Signals");
    expect(paginationHtml).toContain("@zag-js/pagination");
  });

  it("detects number input readiness without mutating values", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-number-input-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-number-input-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-number-input.tsx"), [
      "import * as numberInput from '@zag-js/number-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagPriceNumberInput() {",
      "  const sourceEvidence = 'valueAsNumber formattedValue clampValue clampValueOnBlur allowOverflow isAtMin isAtMax isOutOfRange canIncrement canDecrement createFormatter createParser parseValue formatValue getDefaultStep trackFormControl fieldsetDisabled recordCursor restoreCursor setCaretToEnd requestPointerLock virtual cursor';",
      "  void sourceEvidence;",
      "  const service = useMachine(numberInput.machine, { id: 'price', dir: 'rtl', locale: 'en-US', value: '5', defaultValue: '1', min: 0, max: 10, step: 0.5, allowMouseWheel: true, allowOverflow: false, clampValueOnBlur: true, focusInputOnChange: true, inputMode: 'decimal', pattern: '-?[0-9]*(.[0-9]+)?', name: 'price', form: 'checkout', disabled: false, readOnly: false, required: true, invalid: false, spinOnPress: true, formatOptions: { style: 'currency', currency: 'USD' }, translations: { incrementLabel: 'Increase price', decrementLabel: 'Decrease price', valueText: (value) => `${value} dollars` }, onValueChange(details) { console.log(details.value, details.valueAsNumber); }, onValueInvalid(details) { console.log(details.reason); }, onFocusChange(details) { console.log(details.focused); }, onValueCommit(details) { console.log(details.value); } });",
      "  const api = numberInput.connect(service, normalizeProps);",
      "  api.setValue('6');",
      "  api.clearValue();",
      "  api.increment();",
      "  api.decrement();",
      "  api.setToMax();",
      "  api.setToMin();",
      "  api.focus();",
      "  return (",
      "    <div {...api.getRootProps()}>",
      "      <label {...api.getLabelProps()}>Price</label>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getDecrementTriggerProps()} aria-controls=\"price-input\" aria-label=\"Decrease price\" data-disabled=\"false\">-</button>",
      "        <input {...api.getInputProps()} id=\"price-input\" role=\"spinbutton\" aria-valuemin={0} aria-valuemax={10} aria-valuenow={5} aria-valuetext=\"5 dollars\" aria-invalid={false} />",
      "        <button {...api.getIncrementTriggerProps()} aria-controls=\"price-input\" aria-label=\"Increase price\" data-disabled=\"false\">+</button>",
      "      </div>",
      "      <output {...api.getValueTextProps()}>{api.valueAsNumber} {api.formattedValue}</output>",
      "      <span {...api.getScrubberProps()}>scrubber pointer wheel</span>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-number-input.tsx"), [
      "export function NativeQuantityInput() {",
      "  return (",
      "    <section data-number-input-root>",
      "      <label htmlFor=\"quantity\">Quantity</label>",
      "      <input id=\"quantity\" type=\"number\" role=\"spinbutton\" min={0} max={10} step={0.5} defaultValue={1} inputMode=\"decimal\" pattern=\"-?[0-9]*(.[0-9]+)?\" name=\"quantity\" form=\"checkout\" required readOnly={false} disabled={false} aria-valuemin={0} aria-valuemax={10} aria-valuenow={1} aria-valuetext=\"1 item\" aria-invalid={false} onFocus={() => undefined} onBlur={() => undefined} onChange={() => undefined} onKeyDown={() => undefined} />",
      "      <button type=\"button\" aria-controls=\"quantity\" aria-label=\"Decrease quantity\" data-disabled=\"false\">Decrease</button>",
      "      <button type=\"button\" aria-controls=\"quantity\" aria-label=\"Increase quantity\" data-disabled=\"false\">Increase</button>",
      "      <span>ArrowUp ArrowDown Home End Enter beforeinput wheel pointer setToMin setToMax</span>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "number-input.spec.tsx"), [
      "import { fireEvent, render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagPriceNumberInput } from '../src/zag-number-input';",
      "describe('number input readiness', () => {",
      "  it('keeps spinbutton attributes, keyboard, pointer, wheel, and artifact coverage visible', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ZagPriceNumberInput />);",
      "    const spinbutton = screen.getByRole('spinbutton', { name: /price/i });",
      "    expect(spinbutton).toHaveAttribute('aria-valuemin', '0');",
      "    expect(spinbutton).toHaveAttribute('aria-valuemax', '10');",
      "    expect(spinbutton).toHaveAttribute('aria-valuenow', '5');",
      "    expect(spinbutton).toHaveAttribute('aria-valuetext', '5 dollars');",
      "    expect(spinbutton).toHaveAttribute('aria-invalid', 'false');",
      "    await user.keyboard('{ArrowUp}{ArrowDown}{Home}{End}{Enter}');",
      "    await user.pointer([{ keys: '[MouseLeft]', target: screen.getByText(/scrubber/i) }]);",
      "    fireEvent.wheel(spinbutton);",
      "    expect('keyboard-test pointer-test wheel-test aria-test upload-artifact number-input-traces').toContain('number-input-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "number-input.yml"), [
      "name: number-input-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- number-input",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: number-input-traces",
      "          path: test-results/number-input"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/number-input": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "number-input-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      numberInputSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; triggerCount: number; scrubberCount: number; valueCount: number; boundsCount: number; formatCount: number; keyboardCount: number; interactionCount: number; accessibilityCount: number; formCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      boundsSignals: Array<{ signal: string; readiness: string }>;
      formatSignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Number input readiness Zag number-input native spinbutton value min max step clamp format locale keyboard scrubber wheel tests");
    expect(report.numberInputSetups.some((item) => item.filePath === "src/zag-number-input.tsx" && item.framework === "zag-number-input" && item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.scrubberCount > 0 && item.valueCount > 0 && item.boundsCount > 0 && item.formatCount > 0 && item.keyboardCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(report.numberInputSetups.some((item) => item.filePath === "src/native-number-input.tsx" && item.framework === "native-spinbutton" && item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.valueCount > 0 && item.boundsCount > 0 && item.formatCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-number-input", "native-spinbutton", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "input", "increment-trigger", "decrement-trigger", "scrubber", "value-text"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "value-as-number", "formatted-value", "set-value", "clear-value", "increment", "decrement", "set-to-min-max"]));
    expect(readySignals(report.boundsSignals)).toEqual(expect.arrayContaining(["min", "max", "step", "allow-overflow", "clamp-on-blur", "at-min-max", "out-of-range", "invalid"]));
    expect(readySignals(report.formatSignals)).toEqual(expect.arrayContaining(["locale", "format-options", "parser", "formatter", "pattern", "input-mode", "value-text"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-up", "arrow-down", "home", "end", "enter", "before-input", "change", "blur", "focus"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["spin-on-press", "mouse-wheel", "pointer", "scrubber", "pointer-lock", "virtual-cursor", "caret"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-spinbutton", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-invalid", "aria-controls", "aria-label", "data-disabled", "required-readonly"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "form", "track-form-control", "disabled-fieldset", "value-commit"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "wheel-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/number-input", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/number-input"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records number input readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "number-input-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "number-input-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "number-input-readiness.html"))).resolves.toBeUndefined();
    const numberInputMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "number-input-readiness.md"), "utf8");
    expect(numberInputMarkdown).toContain("Number Input Readiness");
    expect(numberInputMarkdown).toContain("@zag-js/number-input");
    const numberInputHtml = await fs.readFile(path.join(result.session.outputPaths.html, "number-input-readiness.html"), "utf8");
    expect(numberInputHtml).toContain("number-input-readiness-card");
    expect(numberInputHtml).toContain("data-source-pattern=\"NumberInput\"");
    expect(numberInputHtml).toContain("RepoTutor records number input readiness only");
  });

  it("detects Zag number input machine readiness without mutating values", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-number-input-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-number-input-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-number-input-machine.tsx"), [
      "import * as numberInput from '@zag-js/number-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagNumberInputMachineProbe() {",
      "  const service = useMachine(numberInput.machine, { id: 'price', ids: { root: 'price-root', label: 'price-label', input: 'price-input', incrementTrigger: 'price-inc', decrementTrigger: 'price-dec', scrubber: 'price-scrubber' }, dir: 'rtl', locale: 'en-US', value: '5', defaultValue: '1', min: 0, max: 10, step: 0.5, allowMouseWheel: true, allowOverflow: false, clampValueOnBlur: true, focusInputOnChange: true, inputMode: 'decimal', pattern: '-?[0-9]*(.[0-9]+)?', name: 'price', form: 'checkout', disabled: false, readOnly: false, required: true, invalid: false, spinOnPress: true, formatOptions: { style: 'currency', currency: 'USD' }, translations: { incrementLabel: 'Increase price', decrementLabel: 'Decrease price', valueText: (value) => `${value} dollars` }, onValueChange(details) { console.log(details.value, details.valueAsNumber); }, onValueInvalid(details) { console.warn(details.reason); }, onFocusChange(details) { console.log(details.focused); }, onValueCommit(details) { console.log(details.value); } });",
      "  const api = numberInput.connect(service, normalizeProps);",
      "  const machineContract = 'setup createMachine initialState idle focused before:spin spinning scrubbing VALUE.SET VALUE.CLEAR VALUE.INCREMENT VALUE.DECREMENT TRIGGER.PRESS_DOWN TRIGGER.PRESS_UP SCRUBBER.PRESS_DOWN SCRUBBER.POINTER_MOVE SCRUBBER.POINTER_UP INPUT.FOCUS INPUT.BLUR INPUT.CHANGE INPUT.ENTER INPUT.ARROW_UP INPUT.ARROW_DOWN INPUT.HOME INPUT.END CHANGE_DELAY SPIN';",
      "  const computedContract = 'valueAsNumber formattedValue isAtMin isAtMax isOutOfRange isValueEmpty isDisabled canIncrement canDecrement valueText isRtl formatter parser';",
      "  const effectContract = 'trackFormControl attachWheelListener activatePointerLock trackMousemove setupVirtualCursor preventTextSelection trackButtonDisabled waitForChangeDelay spinValue observeAttributes addDomEvent requestPointerLock';",
      "  const actionContract = 'focusInput increment decrement setClampedValue setRawValue setValue clearValue incrementToMax decrementToMin setHint clearHint invokeOnFocus invokeOnBlur invokeOnInvalid invokeOnValueCommit syncInputElement setFormattedValue setCursorPoint clearCursorPoint setVirtualCursorPosition';",
      "  const domContract = 'getRootId getInputId getIncrementTriggerId getDecrementTriggerId getScrubberId getCursorId getLabelId getInputEl getIncrementTriggerEl getDecrementTriggerEl getScrubberEl getCursorEl getPressedTriggerEl getMousemoveValue data-scrubbing data-focus data-invalid data-disabled aria-valuemin aria-valuemax aria-valuenow aria-valuetext aria-roledescription';",
      "  const cursorContract = 'recordCursor restoreCursor getNextCursorPosition selectionStart selectionEnd setSelectionRange prefixLength suffixLength setCaretToEnd';",
      "  void machineContract;",
      "  void computedContract;",
      "  void effectContract;",
      "  void actionContract;",
      "  void domContract;",
      "  void cursorContract;",
      "  api.setValue(6);",
      "  api.clearValue();",
      "  api.increment();",
      "  api.decrement();",
      "  api.setToMax();",
      "  api.setToMin();",
      "  api.focus();",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"numberInput\" data-part=\"root\">",
      "      <label {...api.getLabelProps()}>Price</label>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getDecrementTriggerProps()}>-</button>",
      "        <input {...api.getInputProps()} />",
      "        <button {...api.getIncrementTriggerProps()}>+</button>",
      "      </div>",
      "      <output {...api.getValueTextProps()}>{api.value} {api.valueAsNumber} {api.focused ? 'focused' : 'idle'} {api.invalid ? 'invalid' : 'valid'} {api.empty ? 'empty' : 'filled'}</output>",
      "      <span {...api.getScrubberProps()}>scrubber</span>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@internationalized/number": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/number-input": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "number-input-readiness-report.json"), "utf8")) as {
      numberInputSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; triggerCount: number; scrubberCount: number; valueCount: number; boundsCount: number; formatCount: number; keyboardCount: number; interactionCount: number; accessibilityCount: number; formCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      cursorSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.numberInputSetups.some((item) => item.filePath === "src/zag-number-input-machine.tsx" && item.framework === "zag-number-input" && item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.scrubberCount > 0 && item.valueCount > 0 && item.boundsCount > 0 && item.formatCount > 0 && item.keyboardCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-number-input"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "focused-state", "before-spin-state", "spinning-state", "scrubbing-state", "value-set-event", "value-clear-event", "value-increment-event", "value-decrement-event", "trigger-press-events", "scrubber-events", "input-events", "spin-events"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["value-as-number", "formatted-value", "at-min", "at-max", "out-of-range", "value-empty", "disabled", "can-increment", "can-decrement", "value-text", "rtl", "formatter", "parser"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-form-control", "wheel-listener", "pointer-lock", "mouse-move", "virtual-cursor", "prevent-text-selection", "button-disabled", "change-delay", "spin-value"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["focus-input", "increment", "decrement", "set-clamped-value", "set-raw-value", "set-value", "clear-value", "set-to-max", "set-to-min", "hint", "focus-callback", "blur-callback", "invalid-callback", "commit-callback", "sync-input", "formatted-value", "cursor-point", "virtual-cursor-position"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "input-id", "increment-trigger-id", "decrement-trigger-id", "scrubber-id", "cursor-id", "label-id", "input-el", "trigger-el", "scrubber-el", "cursor-el", "pressed-trigger", "mousemove-value", "data-state", "aria-spinbutton"]));
    expect(readySignals(report.cursorSignals)).toEqual(expect.arrayContaining(["record-cursor", "restore-cursor", "next-cursor-position", "selection-range", "prefix-suffix", "fallback-end"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["focused", "invalid", "empty", "value", "value-as-number", "set-value", "clear-value", "increment", "decrement", "set-to-max", "set-to-min", "focus", "root-props", "label-props", "control-props", "value-text-props", "input-props", "trigger-props", "scrubber-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/number-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@internationalized/number", "react"]));
    const numberInputMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "number-input-readiness.md"), "utf8");
    expect(numberInputMarkdown).toContain("Machine Signals");
    expect(numberInputMarkdown).toContain("@zag-js/number-input");
    const numberInputHtml = await fs.readFile(path.join(result.session.outputPaths.html, "number-input-readiness.html"), "utf8");
    expect(numberInputHtml).toContain("Machine Signals");
    expect(numberInputHtml).toContain("@zag-js/number-input");
  });

  it("detects rating group readiness without mutating ratings", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-rating-group-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-rating-group-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-rating-group.tsx"), [
      "import * as ratingGroup from '@zag-js/rating-group';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagProductRating() {",
      "  const sourceEvidence = 'trackFormControl fieldsetDisabled onFormReset hoveredValue allowHalf roundValueIfNeeded ratingValueText isInteractive isHovering getEventPoint getRelativePoint getPercentValue isMidway getEventKey isLeftClick data-highlighted data-half data-checked aria-roledescription aria-setsize aria-posinset radiogroup radio';",
      "  void sourceEvidence;",
      "  const service = useMachine(ratingGroup.machine, { id: 'product-rating', name: 'rating', form: 'review', dir: 'rtl', count: 5, value: 3.5, defaultValue: 2, allowHalf: true, required: true, readOnly: false, disabled: false, autoFocus: true, translations: { ratingValueText: (index) => `${index} stars` }, onValueChange(details) { console.log(details.value); }, onHoverChange(details) { console.log(details.hoveredValue); } });",
      "  const api = ratingGroup.connect(service, normalizeProps);",
      "  api.setValue(4);",
      "  api.clearValue();",
      "  api.hovering;",
      "  api.hoveredValue;",
      "  api.getItemState({ index: 3 });",
      "  return (",
      "    <div {...api.getRootProps()}>",
      "      <input {...api.getHiddenInputProps()} />",
      "      <label {...api.getLabelProps()}>Rating</label>",
      "      <div {...api.getControlProps()} role=\"radiogroup\" aria-orientation=\"horizontal\" aria-labelledby=\"rating-label\" aria-readonly={false} data-disabled=\"false\" data-readonly=\"false\">",
      "        {api.items.map((index) => {",
      "          const state = api.getItemState({ index });",
      "          return <span key={index} {...api.getItemProps({ index })} role=\"radio\" aria-label={`${index} stars`} aria-checked={state.checked} aria-setsize={api.count} aria-posinset={index} aria-roledescription=\"rating\" data-highlighted={state.highlighted} data-half={state.half} data-checked={state.checked}>{index}</span>;",
      "        })}",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-rating-group.tsx"), [
      "export function NativeRatingGroup() {",
      "  return (",
      "    <fieldset role=\"radiogroup\" aria-label=\"Rating\" aria-readonly={false} data-rating-group-root>",
      "      <legend>Rating</legend>",
      "      <input type=\"hidden\" name=\"rating\" form=\"review\" required defaultValue=\"3\" />",
      "      <label><input type=\"radio\" name=\"rating-radio\" value=\"1\" aria-label=\"1 star\" aria-checked={false} aria-setsize={5} aria-posinset={1} />1</label>",
      "      <label><input type=\"radio\" name=\"rating-radio\" value=\"2\" aria-label=\"2 stars\" aria-checked={false} aria-setsize={5} aria-posinset={2} data-highlighted=\"true\" />2</label>",
      "      <label><input type=\"radio\" name=\"rating-radio\" value=\"3\" aria-label=\"3 stars\" aria-checked={true} aria-setsize={5} aria-posinset={3} data-half=\"true\" data-checked=\"true\" />3</label>",
      "      <span>ArrowLeft ArrowRight ArrowUp ArrowDown Home End Space pointerover pointerleave click focus blur reset fieldsetDisabled hoveredValue allowHalf half star</span>",
      "    </fieldset>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "rating-group.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagProductRating } from '../src/zag-rating-group';",
      "describe('rating group readiness', () => {",
      "  it('keeps radio semantics, keyboard, pointer, half state, and artifacts visible', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ZagProductRating />);",
      "    expect(screen.getByRole('radiogroup', { name: /rating/i })).toHaveAttribute('aria-readonly', 'false');",
      "    expect(screen.getByRole('radio', { name: /3 stars/i })).toHaveAttribute('aria-posinset', '3');",
      "    expect(screen.getByRole('radio', { name: /3 stars/i })).toHaveAttribute('aria-setsize', '5');",
      "    await user.keyboard('{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}{Home}{End}{Space}');",
      "    await user.pointer([{ keys: '[MouseLeft]', target: screen.getByRole('radio', { name: /4 stars/i }) }]);",
      "    expect('keyboard-test pointer-test aria-test form-test half-test upload-artifact rating-group-traces').toContain('rating-group-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "rating-group.yml"), [
      "name: rating-group-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- rating-group",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: rating-group-traces",
      "          path: test-results/rating-group"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/rating-group": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "rating-group-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      ratingGroupSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; hiddenInputCount: number; controlCount: number; itemCount: number; valueCount: number; hoverCount: number; halfCount: number; keyboardCount: number; pointerCount: number; accessibilityCount: number; formCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Rating group readiness Zag rating-group native radiogroup radio value hover half keyboard pointer form accessibility tests");
    expect(report.ratingGroupSetups.some((item) => item.filePath === "src/zag-rating-group.tsx" && item.framework === "zag-rating-group" && item.rootCount > 0 && item.labelCount > 0 && item.hiddenInputCount > 0 && item.controlCount > 0 && item.itemCount > 0 && item.valueCount > 0 && item.hoverCount > 0 && item.halfCount > 0 && item.keyboardCount > 0 && item.pointerCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(report.ratingGroupSetups.some((item) => item.filePath === "src/native-rating-group.tsx" && item.framework === "native-radiogroup" && item.rootCount > 0 && item.labelCount > 0 && item.hiddenInputCount > 0 && item.controlCount > 0 && item.itemCount > 0 && item.valueCount > 0 && item.hoverCount > 0 && item.halfCount > 0 && item.keyboardCount > 0 && item.pointerCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-rating-group", "native-radiogroup", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "hidden-input", "control", "item"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "hovered-value", "count", "items", "set-value", "clear-value", "item-state"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["highlighted", "half", "checked", "allow-half", "rounding"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer-over", "pointer-leave", "click", "focus-blur", "space", "arrow-left", "arrow-right", "home", "end"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["radiogroup", "radio", "aria-label", "aria-checked", "aria-setsize", "aria-posinset", "aria-readonly", "disabled-readonly-required", "dir"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "form", "hidden-input", "track-form-control", "reset", "fieldset-disabled"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "aria-test", "form-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/rating-group", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/rating-group"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records rating group readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "rating-group-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "rating-group-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "rating-group-readiness.html"))).resolves.toBeUndefined();
    const ratingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "rating-group-readiness.md"), "utf8");
    expect(ratingMarkdown).toContain("Rating Group Readiness");
    expect(ratingMarkdown).toContain("@zag-js/rating-group");
    const ratingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "rating-group-readiness.html"), "utf8");
    expect(ratingHtml).toContain("rating-group-readiness-card");
    expect(ratingHtml).toContain("data-source-pattern=\"RatingGroup\"");
    expect(ratingHtml).toContain("RepoTutor records rating group readiness only");
  });

  it("detects Zag rating group machine readiness without mutating ratings", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-rating-group-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-rating-group-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-rating-group-machine.tsx"), [
      "import * as ratingGroup from '@zag-js/rating-group';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagRatingGroupMachineProbe() {",
      "  const service = useMachine(ratingGroup.machine, { id: 'rating', ids: { root: 'rating-root', label: 'rating-label', hiddenInput: 'rating-input', control: 'rating-control', item: (id) => `rating-item-${id}` }, name: 'rating', form: 'review', dir: 'rtl', count: 5, value: 3.5, defaultValue: 2, allowHalf: true, autoFocus: true, disabled: false, readOnly: false, required: true, translations: { ratingValueText: (index) => `${index} stars` }, onValueChange(details) { console.log(details.value); }, onHoverChange(details) { console.log(details.hoveredValue); } });",
      "  const api = ratingGroup.connect(service, normalizeProps);",
      "  const machineContract = 'createMachine initialState idle hover focus SET_VALUE CLEAR_VALUE GROUP_POINTER_OVER GROUP_POINTER_LEAVE POINTER_OVER CLICK FOCUS BLUR SPACE ARROW_LEFT ARROW_RIGHT HOME END';",
      "  const computedContract = 'isInteractive isHovering isDisabled hoveredValue fieldsetDisabled value';",
      "  const effectContract = 'trackFormControl trackFormControlState onFieldsetDisabledChange onFormReset';",
      "  const guardContract = 'isInteractive isHoveredValueEmpty isValueEmpty isRadioFocused';",
      "  const actionContract = 'clearHoveredValue focusActiveRadio setPrevValue setNextValue setValueToMin setValueToMax setValue clearValue setHoveredValue roundValueIfNeeded dispatchChangeEvent';",
      "  const domContract = 'getRootId getLabelId getHiddenInputId getControlId getItemId getRootEl getControlEl getRadioEl getHiddenInputEl dispatchInputValueEvent aria-posinset';",
      "  void machineContract;",
      "  void computedContract;",
      "  void effectContract;",
      "  void guardContract;",
      "  void actionContract;",
      "  void domContract;",
      "  api.setValue(4);",
      "  api.clearValue();",
      "  api.hovering;",
      "  api.hoveredValue;",
      "  const third = api.getItemState({ index: 3 });",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"ratingGroup\" data-part=\"root\">",
      "      <input {...api.getHiddenInputProps()} />",
      "      <label {...api.getLabelProps()}>Rating</label>",
      "      <div {...api.getControlProps()}>",
      "        {api.items.map((index) => {",
      "          const state = api.getItemState({ index });",
      "          return <span key={index} {...api.getItemProps({ index })}>{state.highlighted ? 'highlighted' : 'plain'} {state.half ? 'half' : 'whole'} {state.checked ? 'checked' : 'unchecked'}</span>;",
      "        })}",
      "      </div>",
      "      <output>{api.value} {api.hoveredValue} {api.count} {third.highlighted ? 'highlighted' : 'plain'}</output>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/rating-group": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "rating-group-readiness-report.json"), "utf8")) as {
      ratingGroupSetups: Array<{ filePath: string; framework: string; rootCount: number; hiddenInputCount: number; controlCount: number; itemCount: number; valueCount: number; hoverCount: number; halfCount: number; keyboardCount: number; pointerCount: number; accessibilityCount: number; formCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.ratingGroupSetups.some((item) => item.filePath === "src/zag-rating-group-machine.tsx" && item.framework === "zag-rating-group" && item.rootCount > 0 && item.hiddenInputCount > 0 && item.controlCount > 0 && item.itemCount > 0 && item.valueCount > 0 && item.hoverCount > 0 && item.halfCount > 0 && item.keyboardCount > 0 && item.pointerCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-rating-group"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "hover-state", "focus-state", "set-value-event", "clear-value-event", "group-pointer-over-event", "group-pointer-leave-event", "pointer-over-event", "click-event", "focus-blur-events", "keyboard-events"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["interactive", "hovering", "disabled"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-form-control", "fieldset-disabled", "form-reset"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["interactive", "hovered-value-empty", "value-empty", "radio-focused"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["clear-hovered-value", "focus-active-radio", "set-prev-value", "set-next-value", "set-min-value", "set-max-value", "set-value", "clear-value", "set-hovered-value", "round-value", "dispatch-change-event"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "label-id", "hidden-input-id", "control-id", "item-id", "root-el", "control-el", "radio-el", "hidden-input-el", "dispatch-change-event", "aria-posinset-query"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["hovering", "value", "hovered-value", "count", "items", "item-state", "set-value", "clear-value", "root-props", "hidden-input-props", "label-props", "control-props", "item-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/rating-group", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const ratingMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "rating-group-readiness.md"), "utf8");
    expect(ratingMarkdown).toContain("Machine Signals");
    expect(ratingMarkdown).toContain("@zag-js/rating-group");
    const ratingHtml = await fs.readFile(path.join(result.session.outputPaths.html, "rating-group-readiness.html"), "utf8");
    expect(ratingHtml).toContain("Machine Signals");
    expect(ratingHtml).toContain("@zag-js/rating-group");
  });

  it("detects color picker readiness without sampling colors", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-color-picker-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-color-picker-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-color-picker.tsx"), [
      "import * as colorPicker from '@zag-js/color-picker';",
      "import { parseColor } from '@zag-js/color-utils';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagBrandColorPicker() {",
      "  const sourceEvidence = 'trackFormControl fieldsetDisabled onFormReset dispatchInputValueEvent syncInputElements trackDismissableElement INTERACT_OUTSIDE onInteractOutside onPointerDownOutside onFocusOutside openEyeDropper EyeDropper getColorAreaGradient getEventStep getEventPoint getEventKey getChannelRange getSliderBackground getSwatchTriggerState valueAsString defaultFormat getChannelValue getChannelValueText setChannelValue setAlpha setFormat getAreaProps getAreaThumbProps getChannelSliderProps getChannelSliderTrackProps getChannelSliderThumbProps getChannelInputProps getSwatchTriggerProps getFormatSelectProps getEyeDropperTriggerProps aria-valuemin aria-valuemax aria-valuenow aria-valuetext 2d slider dialog aria-expanded data-state hidden input';",
      "  void sourceEvidence;",
      "  const service = useMachine(colorPicker.machine, { id: 'brand-color', name: 'brandColor', dir: 'rtl', value: parseColor('#3366ff'), defaultValue: parseColor('#000000'), format: 'rgba', defaultFormat: 'hsba', open: true, defaultOpen: true, inline: false, required: true, invalid: false, readOnly: false, disabled: false, closeOnSelect: true, openAutoFocus: true, positioning: { placement: 'bottom-start' }, onValueChange(details) { console.log(details.valueAsString); }, onValueChangeEnd(details) { console.log(details.valueAsString); }, onFormatChange(details) { console.log(details.format); }, onOpenChange(details) { console.log(details.open); } });",
      "  const api = colorPicker.connect(service, normalizeProps);",
      "  api.setOpen(true);",
      "  api.setValue('#ff00aa');",
      "  api.setChannelValue('hue', 180);",
      "  api.setAlpha(0.5);",
      "  api.setFormat('hsla');",
      "  api.getChannelValue('hue');",
      "  api.getChannelValueText('alpha', 'en-US');",
      "  api.getSwatchTriggerState({ value: '#ff00aa' });",
      "  const channels = ['hue', 'alpha'] as const;",
      "  return (",
      "    <div {...api.getRootProps()} data-color-picker-root>",
      "      <label {...api.getLabelProps()}>Brand color</label>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getTriggerProps()} aria-expanded={api.open}>Choose color</button>",
      "        <input {...api.getHiddenInputProps()} />",
      "        <span {...api.getValueTextProps()}>{api.valueAsString}</span>",
      "      </div>",
      "      <div {...api.getPositionerProps()}><div {...api.getContentProps()} role=\"dialog\" data-state={api.open ? 'open' : 'closed'}>",
      "        <div {...api.getAreaProps({ xChannel: 'saturation', yChannel: 'brightness' })}>",
      "          <div {...api.getAreaBackgroundProps({ xChannel: 'saturation', yChannel: 'brightness' })} />",
      "          <div {...api.getAreaThumbProps({ xChannel: 'saturation', yChannel: 'brightness' })} role=\"slider\" aria-roledescription=\"2d slider\" aria-valuemin={0} aria-valuemax={100} aria-valuenow={50} aria-valuetext=\"saturation 50, brightness 50\" />",
      "        </div>",
      "        {channels.map((channel) => <div key={channel} {...api.getChannelSliderProps({ channel, orientation: 'horizontal' })}>",
      "          <div {...api.getChannelSliderLabelProps({ channel })}>{channel}</div>",
      "          <div {...api.getChannelSliderTrackProps({ channel, orientation: 'horizontal' })}>",
      "            <div {...api.getChannelSliderThumbProps({ channel, orientation: 'horizontal' })} role=\"slider\" aria-label={channel} aria-orientation=\"horizontal\" aria-valuemin={0} aria-valuemax={channel === 'hue' ? 360 : 1} aria-valuenow={channel === 'hue' ? 180 : 0.5} aria-valuetext={`${channel} value`} />",
      "          </div>",
      "          <span {...api.getChannelSliderValueTextProps({ channel })}>{api.getChannelValueText(channel, 'en-US')}</span>",
      "        </div>)}",
      "        <input {...api.getChannelInputProps({ channel: 'hex' })} aria-label=\"hex\" />",
      "        <input {...api.getChannelInputProps({ channel: 'alpha' })} aria-label=\"alpha\" />",
      "        <div {...api.getTransparencyGridProps({ size: '10px' })} />",
      "        <button {...api.getEyeDropperTriggerProps()}>Pick screen color</button>",
      "        <div {...api.getSwatchGroupProps()}>{['#ff00aa', '#3366ff'].map((value) => <button key={value} {...api.getSwatchTriggerProps({ value })} data-value={value}><span {...api.getSwatchProps({ value, respectAlpha: true })} /><span {...api.getSwatchIndicatorProps({ value })}>selected</span></button>)}</div>",
      "        <button {...api.getFormatTriggerProps()}>Format</button>",
      "        <select {...api.getFormatSelectProps()}><option value=\"hsba\">HSBA</option><option value=\"hsla\">HSLA</option><option value=\"rgba\">RGBA</option></select>",
      "      </div></div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-color-input.tsx"), [
      "export function NativeColorInput() {",
      "  return (",
      "    <form id=\"theme-form\">",
      "      <label htmlFor=\"accent\">Accent color</label>",
      "      <input id=\"accent\" type=\"color\" name=\"accent\" required defaultValue=\"#3366ff\" aria-label=\"Accent color\" />",
      "      <input type=\"hidden\" name=\"accent-rgba\" value=\"rgba(51,102,255,1)\" />",
      "      <output aria-live=\"polite\">valueAsString hex hsba hsla rgba hue saturation brightness alpha channel slider swatch eyedropper format select reset disabled fieldset invalid readOnly</output>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "color-picker.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagBrandColorPicker } from '../src/zag-color-picker';",
      "describe('color picker readiness', () => {",
      "  it('keeps dialog, 2d slider, channel sliders, swatches, form, and artifacts visible', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ZagBrandColorPicker />);",
      "    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');",
      "    expect(screen.getByRole('slider', { name: /saturation and brightness/i })).toHaveAttribute('aria-roledescription', '2d slider');",
      "    expect(screen.getByRole('slider', { name: /hue/i })).toHaveAttribute('aria-orientation', 'horizontal');",
      "    await user.keyboard('{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}{PageUp}{PageDown}{Home}{End}{Enter}');",
      "    await user.pointer([{ keys: '[MouseLeft]', target: screen.getByRole('slider', { name: /hue/i }) }]);",
      "    await user.click(screen.getByRole('button', { name: /pick screen color/i }));",
      "    expect('keyboard-test pointer-test eyedropper-test swatch-test format-test form-test aria-test upload-artifact color-picker-traces').toContain('color-picker-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "color-picker.yml"), [
      "name: color-picker-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- color-picker",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: color-picker-traces",
      "          path: test-results/color-picker"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/color-picker": "latest",
        "@zag-js/color-utils": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "color-picker-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      colorPickerSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; triggerCount: number; contentCount: number; areaCount: number; areaThumbCount: number; channelSliderCount: number; channelInputCount: number; swatchCount: number; eyeDropperCount: number; formatCount: number; valueCount: number; interactionCount: number; accessibilityCount: number; formCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      channelSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Color picker readiness Zag color-picker native color input area channel slider swatch eyedropper format form accessibility tests");
    expect(report.colorPickerSetups.some((item) => item.filePath === "src/zag-color-picker.tsx" && item.framework === "zag-color-picker" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.areaCount > 0 && item.areaThumbCount > 0 && item.channelSliderCount > 0 && item.channelInputCount > 0 && item.swatchCount > 0 && item.eyeDropperCount > 0 && item.formatCount > 0 && item.valueCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(report.colorPickerSetups.some((item) => item.filePath === "src/native-color-input.tsx" && item.framework === "native-color-input" && item.labelCount > 0 && item.valueCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-color-picker", "native-color-input", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "trigger", "content", "area", "area-thumb", "channel-slider", "channel-input", "swatch", "eyedropper", "format-select"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "value-as-string", "format", "alpha", "set-value", "set-channel-value", "set-format"]));
    expect(readySignals(report.channelSignals)).toEqual(expect.arrayContaining(["hue", "saturation", "brightness", "alpha", "hex", "rgba", "hsla", "hsba"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["open-close", "area-pointer", "channel-pointer", "keyboard", "page-keys", "home-end", "channel-input", "swatch-click", "eyedropper", "dismissable"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["dialog", "slider", "2d-slider", "aria-label", "aria-valuemin-max", "aria-valuenow", "aria-valuetext", "aria-expanded", "disabled-readonly-invalid-required", "dir"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "hidden-input", "track-form-control", "reset", "fieldset-disabled", "required"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "eyedropper-test", "swatch-test", "format-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/color-picker", "@zag-js/color-utils", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/color-picker"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records color picker readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "color-picker-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "color-picker-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "color-picker-readiness.html"))).resolves.toBeUndefined();
    const colorMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "color-picker-readiness.md"), "utf8");
    expect(colorMarkdown).toContain("Color Picker Readiness");
    expect(colorMarkdown).toContain("@zag-js/color-picker");
    const colorHtml = await fs.readFile(path.join(result.session.outputPaths.html, "color-picker-readiness.html"), "utf8");
    expect(colorHtml).toContain("color-picker-readiness-card");
    expect(colorHtml).toContain("data-source-pattern=\"ColorPicker\"");
    expect(colorHtml).toContain("RepoTutor records color picker readiness only");
  });

  it("detects Zag color picker machine readiness without sampling colors", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-color-picker-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-color-picker-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-color-picker-machine.tsx"), [
      "import * as colorPicker from '@zag-js/color-picker';",
      "import { parseColor } from '@zag-js/color-utils';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "export function ZagColorPickerMachineProbe() {",
      "  const service = useMachine(colorPicker.machine, { id: 'brand-color', ids: { root: 'color-root', control: 'color-control', trigger: 'color-trigger', label: 'color-label', hiddenInput: 'color-hidden', content: 'color-content', area: 'color-area', areaGradient: 'color-area-gradient', positioner: 'color-positioner', formatSelect: 'color-format', areaThumb: 'color-area-thumb', channelInput: (id) => `color-input-${id}`, channelSliderTrack: (id) => `color-track-${id}`, channelSliderThumb: (id) => `color-thumb-${id}` }, dir: 'rtl', value: parseColor('#3366ff'), defaultValue: parseColor('#000000'), format: 'rgba', defaultFormat: 'hsba', open: true, defaultOpen: true, inline: false, name: 'brandColor', positioning: { placement: 'bottom-start' }, initialFocusEl: () => null, closeOnSelect: true, openAutoFocus: true, disabled: false, readOnly: false, required: true, invalid: false, onValueChange(details) { console.log(details.valueAsString); }, onValueChangeEnd(details) { console.log(details.valueAsString); }, onOpenChange(details) { console.log(details.open); }, onFormatChange(details) { console.log(details.format); }, onInteractOutside(event) { console.log(event.type); }, onPointerDownOutside(event) { console.log(event.type); }, onFocusOutside(event) { console.log(event.type); } });",
      "  const api = colorPicker.connect(service, normalizeProps);",
      "  const machineContract = 'createMachine initialState idle focused open open.idle open.dragging closed dragging VALUE.SET FORMAT.SET CHANNEL_INPUT.CHANGE EYEDROPPER.CLICK SWATCH_TRIGGER.CLICK CONTROLLED.OPEN CONTROLLED.CLOSE TRIGGER.CLICK TRIGGER.BLUR AREA.POINTER_DOWN AREA.POINTER_MOVE AREA.POINTER_UP AREA.ARROW_LEFT AREA.ARROW_RIGHT AREA.ARROW_UP AREA.ARROW_DOWN AREA.PAGE_UP AREA.PAGE_DOWN CHANNEL_SLIDER.POINTER_DOWN CHANNEL_SLIDER.POINTER_MOVE CHANNEL_SLIDER.POINTER_UP CHANNEL_SLIDER.ARROW_LEFT CHANNEL_SLIDER.ARROW_RIGHT CHANNEL_SLIDER.ARROW_UP CHANNEL_SLIDER.ARROW_DOWN CHANNEL_SLIDER.PAGE_UP CHANNEL_SLIDER.PAGE_DOWN CHANNEL_SLIDER.HOME CHANNEL_SLIDER.END INTERACT_OUTSIDE OPEN CLOSE';",
      "  const computedContract = 'disabled rtl interactive valueAsString areaValue';",
      "  const effectContract = 'trackFormControl trackPositioning trackDismissableElement trackPointerMove disableTextSelection onFieldsetDisabledChange onFormReset getPlacement';",
      "  const guardContract = 'closeOnSelect isOpenControlled shouldRestoreFocus';",
      "  const actionContract = 'openEyeDropper setActiveChannel clearActiveChannel setAreaColorFromPoint setChannelColorFromPoint setValue setFormat dispatchChangeEvent syncInputElements invokeOnChangeEnd setChannelColorFromInput incrementChannel decrementChannel incrementAreaXChannel decrementAreaXChannel incrementAreaYChannel decrementAreaYChannel setChannelToMax setChannelToMin focusAreaThumb focusChannelThumb setInitialFocus setReturnFocus syncFormatSelectElement syncValueWithFormat invokeOnOpen invokeOnClose toggleVisibility';",
      "  const domContract = 'getRootId getLabelId getHiddenInputId getControlId getTriggerId getContentId getPositionerId getFormatSelectId getAreaId getAreaGradientId getAreaThumbId getChannelSliderTrackId getChannelSliderThumbId getContentEl getAreaThumbEl getChannelSliderThumbEl getChannelInputEl getFormatSelectEl getHiddenInputEl getAreaEl getAreaValueFromPoint getControlEl getTriggerEl getPositionerEl getChannelSliderTrackEl getChannelSliderValueFromPoint getChannelInputEls';",
      "  void machineContract;",
      "  void computedContract;",
      "  void effectContract;",
      "  void guardContract;",
      "  void actionContract;",
      "  void domContract;",
      "  api.setOpen(true);",
      "  api.setValue('#ff00aa');",
      "  api.setChannelValue('hue', 180);",
      "  api.setAlpha(0.5);",
      "  api.setFormat('hsla');",
      "  api.getChannelValue('hue');",
      "  api.getChannelValueText('alpha', 'en-US');",
      "  api.getSwatchTriggerState({ value: '#ff00aa' });",
      "  return (",
      "    <div {...api.getRootProps()} data-scope=\"colorPicker\" data-part=\"root\">",
      "      <label {...api.getLabelProps()}>Brand color</label>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getTriggerProps()}>{api.open ? 'open' : 'closed'}</button>",
      "        <input {...api.getHiddenInputProps()} />",
      "        <output {...api.getValueTextProps()}>{api.valueAsString} {api.alpha} {api.inline ? 'inline' : 'popover'} {api.dragging ? 'dragging' : 'idle'}</output>",
      "      </div>",
      "      <div {...api.getPositionerProps()}><div {...api.getContentProps()}>",
      "        <div {...api.getAreaProps({ xChannel: 'saturation', yChannel: 'brightness' })}><div {...api.getAreaBackgroundProps({ xChannel: 'saturation', yChannel: 'brightness' })} /><div {...api.getAreaThumbProps({ xChannel: 'saturation', yChannel: 'brightness' })} /></div>",
      "        <div {...api.getChannelSliderProps({ channel: 'hue', orientation: 'horizontal', format: 'hsba' })}><div {...api.getChannelSliderLabelProps({ channel: 'hue' })}>Hue</div><div {...api.getChannelSliderTrackProps({ channel: 'hue', orientation: 'horizontal', format: 'hsba' })}><div {...api.getChannelSliderThumbProps({ channel: 'hue', orientation: 'horizontal', format: 'hsba' })} /></div><span {...api.getChannelSliderValueTextProps({ channel: 'hue' })}>hue</span></div>",
      "        <input {...api.getChannelInputProps({ channel: 'hex' })} />",
      "        <div {...api.getTransparencyGridProps({ size: '10px' })} />",
      "        <button {...api.getEyeDropperTriggerProps()}>Pick screen color</button>",
      "        <div {...api.getSwatchGroupProps()}><button {...api.getSwatchTriggerProps({ value: '#ff00aa' })}><span {...api.getSwatchProps({ value: '#ff00aa', respectAlpha: true })} /><span {...api.getSwatchIndicatorProps({ value: '#ff00aa' })}>selected</span></button></div>",
      "        <button {...api.getFormatTriggerProps()}>Format</button>",
      "        <select {...api.getFormatSelectProps()}><option value=\"hsba\">HSBA</option><option value=\"hsla\">HSLA</option><option value=\"rgba\">RGBA</option></select>",
      "      </div></div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/color-picker": "latest",
        "@zag-js/color-utils": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "color-picker-readiness-report.json"), "utf8")) as {
      colorPickerSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; triggerCount: number; contentCount: number; areaCount: number; areaThumbCount: number; channelSliderCount: number; channelInputCount: number; swatchCount: number; eyeDropperCount: number; formatCount: number; valueCount: number; interactionCount: number; accessibilityCount: number; formCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.colorPickerSetups.some((item) => item.filePath === "src/zag-color-picker-machine.tsx" && item.framework === "zag-color-picker" && item.rootCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.areaCount > 0 && item.areaThumbCount > 0 && item.channelSliderCount > 0 && item.channelInputCount > 0 && item.swatchCount > 0 && item.eyeDropperCount > 0 && item.formatCount > 0 && item.valueCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-color-picker"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "focused-state", "open-state", "dragging-state", "value-set-event", "format-set-event", "channel-input-events", "eyedropper-event", "swatch-trigger-event", "trigger-events", "area-pointer-events", "channel-slider-events", "controlled-open-close-events"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["disabled", "rtl", "interactive", "value-as-string", "area-value"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-form-control", "track-positioning", "dismissable-element", "pointer-move", "text-selection"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["close-on-select", "open-controlled", "restore-focus"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["open-eyedropper", "active-channel", "clear-active-channel", "area-color-from-point", "channel-color-from-point", "set-value", "set-format", "dispatch-change-event", "sync-inputs", "change-end-callback", "channel-color-from-input", "increment-decrement-channel", "area-channel-increment", "channel-min-max", "focus-thumbs", "initial-focus", "return-focus", "sync-format-select", "sync-value-with-format", "open-close-callback", "toggle-visibility"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "label-id", "hidden-input-id", "control-id", "trigger-id", "content-id", "positioner-id", "format-select-id", "area-id", "area-gradient-id", "area-thumb-id", "channel-slider-ids", "content-el", "area-thumb-el", "channel-input-els", "format-select-el", "hidden-input-el", "area-point", "slider-point"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["dragging", "open", "inline", "value", "value-as-string", "set-open", "set-value", "channel-value", "channel-value-text", "set-channel-value", "format", "set-format", "alpha", "set-alpha", "root-props", "trigger-props", "content-props", "area-props", "channel-props", "hidden-input-props", "eyedropper-props", "swatch-props", "format-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/color-picker", "@zag-js/color-utils", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react"]));
    const colorMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "color-picker-readiness.md"), "utf8");
    expect(colorMarkdown).toContain("Machine Signals");
    expect(colorMarkdown).toContain("@zag-js/color-picker");
    const colorHtml = await fs.readFile(path.join(result.session.outputPaths.html, "color-picker-readiness.html"), "utf8");
    expect(colorHtml).toContain("Machine Signals");
    expect(colorHtml).toContain("@zag-js/color-picker");
  });

  it("detects splitter readiness without resizing panels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-splitter-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-splitter-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-splitter.tsx"), [
      "import * as splitter from '@zag-js/splitter';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "const panels = [{ id: 'nav', minSize: 15, maxSize: 45, collapsible: true, collapsedSize: 0, resizeBehavior: 'preserve-relative-size' }, { id: 'editor', minSize: 30 }, { id: 'preview', minSize: 20, maxSize: 60, collapsible: true, collapsedSize: 5, resizeBehavior: 'preserve-pixel-size' }];",
      "export function ZagWorkspaceSplitter() {",
      "  const sourceEvidence = 'observeChildren resizeObserverBorderBox trackPointerMove validateSizes resolvePanelSizes resizeByDelta preserveFixedPanelSizes getAriaValue setupGlobalCursor removeGlobalCursor registry register getResizeTriggerState getResizeTriggerIndicator getItems getSizes setSizes resetSizes collapsePanel expandPanel resizePanel getPanelSize isPanelCollapsed isPanelExpanded getLayout POINTER_DOWN POINTER_MOVE POINTER_UP KEYBOARD_MOVE FOCUS.CYCLE aria-valuenow aria-valuemin aria-valuemax aria-controls aria-orientation role separator data-orientation data-dragging data-focus data-disabled';",
      "  void sourceEvidence;",
      "  const service = useMachine(splitter.machine, { id: 'workspace-splitter', dir: 'rtl', orientation: 'horizontal', panels, defaultSize: [25, 45, 30], size: [25, 45, 30], keyboardResizeBy: 5, nonce: 'splitter-nonce', onResize(details) { console.log(details.size, details.layout, details.resizeTriggerId, details.expandToSizes); }, onResizeStart() { console.log('start'); }, onResizeEnd(details) { console.log(details.size, details.resizeTriggerId); }, onCollapse(details) { console.log(details.panelId, details.size); }, onExpand(details) { console.log(details.panelId, details.size); } });",
      "  const api = splitter.connect(service, normalizeProps);",
      "  api.getPanels();",
      "  api.getItems();",
      "  api.getSizes();",
      "  api.setSizes([20, 50, 30]);",
      "  api.resetSizes();",
      "  api.collapsePanel('nav');",
      "  api.expandPanel('nav', 15);",
      "  api.resizePanel('editor', 50);",
      "  api.getPanelById('editor');",
      "  api.getPanelSize('editor');",
      "  api.isPanelCollapsed('nav');",
      "  api.isPanelExpanded('preview');",
      "  api.getLayout();",
      "  const items = api.getItems();",
      "  return (",
      "    <div {...api.getRootProps()} data-splitter-root>",
      "      {items.map((item) => item.type === 'panel'",
      "        ? <section key={item.id} {...api.getPanelProps({ id: item.id })} aria-label={`${item.id} panel`}>{item.id}</section>",
      "        : <div key={item.id} {...api.getResizeTriggerProps({ id: item.id })} role=\"separator\" aria-orientation={api.orientation} aria-valuenow={50} aria-valuemin={15} aria-valuemax={85} aria-controls=\"nav editor\" data-orientation={api.orientation}><span {...api.getResizeTriggerIndicator({ id: item.id })}>handle</span></div>)}",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-splitter.tsx"), [
      "export function NativeSplitter() {",
      "  return (",
      "    <div data-splitter-root data-orientation=\"vertical\" dir=\"ltr\">",
      "      <section data-panel-id=\"top\" style={{ minHeight: 120, maxHeight: 400 }}>Top</section>",
      "      <div role=\"separator\" tabIndex={0} aria-orientation=\"vertical\" aria-valuemin={20} aria-valuemax={80} aria-valuenow={40} aria-controls=\"top bottom\" data-resize-trigger data-dragging=\"false\" data-focus=\"false\" />",
      "      <section data-panel-id=\"bottom\" data-collapsible=\"true\" data-collapsed-size=\"0\">Bottom</section>",
      "      <span>ArrowLeft ArrowRight ArrowUp ArrowDown Home End Enter F6 pointerdown pointermove pointerup collapse expand resize minSize maxSize defaultSize keyboardResizeBy</span>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "splitter.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { ZagWorkspaceSplitter } from '../src/zag-splitter';",
      "describe('splitter readiness', () => {",
      "  it('keeps separator keyboard, pointer, collapse, and artifact evidence visible', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ZagWorkspaceSplitter />);",
      "    expect(screen.getAllByRole('separator')[0]).toHaveAttribute('aria-orientation', 'horizontal');",
      "    expect(screen.getAllByRole('separator')[0]).toHaveAttribute('aria-valuemin', '15');",
      "    expect(screen.getAllByRole('separator')[0]).toHaveAttribute('aria-valuemax', '85');",
      "    await user.keyboard('{ArrowLeft}{ArrowRight}{ArrowUp}{ArrowDown}{Home}{End}{Enter}{F6}');",
      "    await user.pointer([{ keys: '[MouseLeft]', target: screen.getAllByRole('separator')[0] }]);",
      "    expect('keyboard-test pointer-test aria-test collapse-test upload-artifact splitter-traces').toContain('splitter-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "splitter.yml"), [
      "name: splitter-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- splitter",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: splitter-traces",
      "          path: test-results/splitter"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/react": "latest",
        "@zag-js/splitter": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "splitter-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      splitterSetups: Array<{ filePath: string; framework: string; rootCount: number; panelCount: number; handleCount: number; sizeCount: number; collapseCount: number; keyboardCount: number; pointerCount: number; orientationCount: number; boundsCount: number; accessibilityCount: number; registryCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      sizeSignals: Array<{ signal: string; readiness: string }>;
      collapseSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      registrySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Splitter readiness Zag splitter panel resize trigger separator size collapse keyboard pointer orientation bounds accessibility tests");
    expect(report.splitterSetups.some((item) => item.filePath === "src/zag-splitter.tsx" && item.framework === "zag-splitter" && item.rootCount > 0 && item.panelCount > 0 && item.handleCount > 0 && item.sizeCount > 0 && item.collapseCount > 0 && item.keyboardCount > 0 && item.pointerCount > 0 && item.orientationCount > 0 && item.boundsCount > 0 && item.accessibilityCount > 0 && item.registryCount > 0)).toBe(true);
    expect(report.splitterSetups.some((item) => item.filePath === "src/native-splitter.tsx" && item.framework === "native-resize-handle" && item.rootCount > 0 && item.panelCount > 0 && item.handleCount > 0 && item.keyboardCount > 0 && item.pointerCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-splitter", "native-resize-handle", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "panel", "resize-trigger", "indicator", "items", "layout"]));
    expect(readySignals(report.sizeSignals)).toEqual(expect.arrayContaining(["size", "default-size", "set-sizes", "reset-sizes", "get-sizes", "panel-size", "min-max", "validate-sizes"]));
    expect(readySignals(report.collapseSignals)).toEqual(expect.arrayContaining(["collapsible", "collapsed-size", "collapse-panel", "expand-panel", "is-collapsed", "is-expanded"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer-down", "pointer-move", "pointer-up", "keyboard-move", "enter", "home-end", "f6", "focus-blur"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["separator", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-controls", "aria-orientation", "data-orientation", "dir"]));
    expect(readySignals(report.registrySignals)).toEqual(expect.arrayContaining(["registry", "root-resize", "global-cursor", "preserve-fixed-size"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "aria-test", "collapse-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/splitter", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/splitter"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records splitter readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "splitter-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "splitter-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "splitter-readiness.html"))).resolves.toBeUndefined();
    const splitterMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "splitter-readiness.md"), "utf8");
    expect(splitterMarkdown).toContain("Splitter Readiness");
    expect(splitterMarkdown).toContain("@zag-js/splitter");
    const splitterHtml = await fs.readFile(path.join(result.session.outputPaths.html, "splitter-readiness.html"), "utf8");
    expect(splitterHtml).toContain("splitter-readiness-card");
    expect(splitterHtml).toContain("data-source-pattern=\"Splitter\"");
    expect(splitterHtml).toContain("RepoTutor records splitter readiness only");
  });

  it("detects Zag splitter machine readiness without resizing panels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-splitter-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-splitter-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-splitter-machine.tsx"), [
      "import * as splitter from '@zag-js/splitter';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const panels = [",
      "  { id: 'nav', order: 0, minSize: '12rem', maxSize: 40, collapsible: true, collapsedSize: 0, resizeBehavior: 'preserve-relative-size' },",
      "  { id: 'editor', order: 1, minSize: 30, maxSize: '70%' },",
      "  { id: 'preview', order: 2, minSize: '16rem', maxSize: '45rem', collapsible: true, collapsedSize: '6rem', resizeBehavior: 'preserve-pixel-size' }",
      "];",
      "",
      "export function SourceBackedZagSplitter() {",
      "  const service = useMachine(splitter.machine, {",
      "    id: 'source-backed-splitter',",
      "    dir: 'rtl',",
      "    orientation: 'vertical',",
      "    panels,",
      "    defaultSize: ['20%', 50, '30%'],",
      "    size: [20, 50, 30],",
      "    keyboardResizeBy: 8,",
      "    nonce: 'splitter-cursor-nonce',",
      "    registry: { register: () => () => undefined },",
      "    onResize: console.info,",
      "    onResizeStart: console.info,",
      "    onResizeEnd: console.info,",
      "    onCollapse: console.info,",
      "    onExpand: console.info",
      "  });",
      "  const api = splitter.connect(service, normalizeProps);",
      "  api.dragging;",
      "  api.orientation;",
      "  api.getPanels();",
      "  api.getPanelById('editor');",
      "  api.getItems();",
      "  api.getSizes();",
      "  api.setSizes([18, 52, 30]);",
      "  api.resetSizes();",
      "  api.collapsePanel('nav');",
      "  api.expandPanel('nav', 12);",
      "  api.resizePanel('preview', 34);",
      "  api.getPanelSize('editor');",
      "  api.isPanelCollapsed('nav');",
      "  api.isPanelExpanded('preview');",
      "  api.getLayout();",
      "  api.getResizeTriggerState({ id: 'nav:editor', disabled: false });",
      "  const evidence = 'createMachine initialState idle hover:temp hover focused dragging tags focus SIZE.SET SIZE.RESET PANEL.COLLAPSE PANEL.EXPAND PANEL.RESIZE ROOT.RESIZE POINTER_OVER HOVER_DELAY POINTER_LEAVE POINTER_DOWN POINTER_MOVE POINTER_UP FOCUS BLUR ENTER KEYBOARD_MOVE FOCUS.CYCLE horizontal computed trackResizeHandles trackRootResize waitForHoverDelay trackPointerMove isResizeTriggerFocused setSize resetSize syncSize setDraggingState clearDraggingState setKeyboardState clearKeyboardState collapsePanel expandPanel resizePanel setPointerValue setKeyboardValue invokeOnResizeEnd invokeOnResizeStart collapseOrExpandPanel setGlobalCursor clearGlobalCursor focusNextResizeTrigger getRootId getResizeTriggerId getLabelId getPanelId getPanelEls getRootEl getResizeTriggerEl getPanelEl resolveResizeTriggerId getCursor setupGlobalCursor removeGlobalCursor getResizeTriggerEls calculateAriaValues getAriaValue fuzzyCompareNumbers fuzzyNumbersEqual fuzzySizeEqual sortPanels serializePanels getPanelFlexBoxStyle getUnsafeDefaultSize parsePanelSize toCssPanelSize resolvePanelSizes normalizePanels resizeByDelta validateSizes preserveFixedPanelSizes SplitterRegistry register getRootProps getPanelProps getResizeTriggerProps getResizeTriggerIndicator @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      {api.getItems().map((item) => item.type === 'panel'",
      "        ? <section key={item.id} {...api.getPanelProps({ id: item.id })}>{item.id}</section>",
      "        : <div key={item.id} {...api.getResizeTriggerProps({ id: item.id, disabled: false })}>",
      "            <span {...api.getResizeTriggerIndicator({ id: item.id, disabled: false })}>resize</span>",
      "          </div>)}",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "@zag-js/splitter": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "splitter-readiness-report.json"), "utf8")) as {
      splitterSetups: Array<{ filePath: string; framework: string; rootCount: number; panelCount: number; handleCount: number; sizeCount: number; collapseCount: number; keyboardCount: number; pointerCount: number; orientationCount: number; boundsCount: number; accessibilityCount: number; registryCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      utilitySignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.splitterSetups.some((item) => item.filePath === "src/zag-splitter-machine.tsx" && item.framework === "zag-splitter" && item.rootCount > 0 && item.panelCount > 0 && item.handleCount > 0 && item.sizeCount > 0 && item.collapseCount > 0 && item.keyboardCount > 0 && item.pointerCount > 0 && item.orientationCount > 0 && item.boundsCount > 0 && item.accessibilityCount > 0 && item.registryCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-splitter"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "hover-temp-state", "hover-state", "focused-state", "dragging-state", "size-events", "panel-events", "root-resize-event", "pointer-events", "focus-events", "keyboard-events", "focus-cycle-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["horizontal"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-resize-handles", "track-root-resize", "hover-delay", "pointer-move"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["resize-trigger-focused"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-size", "reset-size", "sync-size", "dragging-state", "keyboard-state", "collapse-panel", "expand-panel", "resize-panel", "pointer-value", "keyboard-value", "resize-callbacks", "collapse-or-expand", "global-cursor", "focus-next-trigger"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "resize-trigger-id", "label-id", "panel-id", "panel-els", "root-el", "resize-trigger-el", "panel-el", "resolve-trigger-id", "cursor", "global-cursor"]));
    expect(readySignals(report.utilitySignals)).toEqual(expect.arrayContaining(["aria-values", "fuzzy-compare", "panel-layout", "panel-flex-style", "default-size", "parse-panel-size", "css-panel-size", "resolve-panel-sizes", "normalize-panels", "resize-by-delta", "validate-sizes", "preserve-fixed-size", "registry"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["dragging", "orientation", "panels", "items", "sizes", "set-sizes", "reset-sizes", "collapse-panel", "expand-panel", "resize-panel", "panel-size", "panel-state", "layout", "resize-trigger-state", "root-props", "panel-props", "resize-trigger-props", "resize-trigger-indicator"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/splitter", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const splitterMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "splitter-readiness.md"), "utf8");
    expect(splitterMarkdown).toContain("Machine Signals");
    expect(splitterMarkdown).toContain("@zag-js/splitter");
    const splitterHtml = await fs.readFile(path.join(result.session.outputPaths.html, "splitter-readiness.html"), "utf8");
    expect(splitterHtml).toContain("Machine Signals");
    expect(splitterHtml).toContain("@zag-js/splitter");
  });

  it("detects tags input readiness without editing tags", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tags-input-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tags-input-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tags-input.tsx"), [
      "import * as tagsInput from '@zag-js/tags-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function SkillsTagsInput() {",
      "  const service = useMachine(tagsInput.machine, {",
      "    id: 'skills-tags',",
      "    dir: 'rtl',",
      "    name: 'skills',",
      "    form: 'skills-form',",
      "    value: ['React', 'TypeScript'],",
      "    defaultValue: ['React'],",
      "    inputValue: 'RepoTutor',",
      "    defaultInputValue: 'docs',",
      "    max: 4,",
      "    maxLength: 24,",
      "    addOnPaste: true,",
      "    allowDuplicates: false,",
      "    allowOverflow: false,",
      "    delimiter: /[,;]/,",
      "    editable: true,",
      "    blurBehavior: 'add',",
      "    required: true,",
      "    invalid: false,",
      "    validate: ({ inputValue, value }) => inputValue.length > 1 && value.length <= 4,",
      "    sanitizeValue: (value) => value.trim().toLowerCase(),",
      "    translations: {",
      "      clearTriggerLabel: 'Clear all tags',",
      "      deleteTagTriggerLabel: (value) => `Delete tag ${value}`,",
      "      tagAdded: (value) => `Added tag ${value}`,",
      "      tagsPasted: (values) => `Pasted ${values.length} tags`,",
      "      tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,",
      "      tagUpdated: (value) => `Tag update to ${value}`,",
      "      tagDeleted: (value) => `Tag ${value} deleted`,",
      "      tagSelected: (value) => `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`",
      "    },",
      "    onValueChange: console.info,",
      "    onInputValueChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onValueInvalid: console.warn,",
      "    onInteractOutside: console.info,",
      "    onFocusOutside: console.info,",
      "    onPointerDownOutside: console.info",
      "  });",
      "  const api = tagsInput.connect(service, normalizeProps);",
      "  api.setValue(['React', 'TypeScript']);",
      "  api.addValue('Testing');",
      "  api.clearValue('React');",
      "  api.setValueAtIndex(0, 'Accessibility');",
      "  api.setInputValue('state machines');",
      "  api.clearInputValue();",
      "  api.focus();",
      "  api.valueAsString;",
      "  api.getItemState({ value: 'React', index: 0 });",
      "  const evidence = 'trackLiveRegion createLiveRegion announceLog translations tagAdded tagUpdated tagDeleted tagsPasted tagSelected trackFormControl fieldsetDisabled onFormReset dispatchInputEvent trackInteractOutside autoResizeInput invalidTag rangeOverflow ADD_TAG INSERT_TAG CLEAR_VALUE SET_VALUE SET_VALUE_AT_INDEX SET_INPUT_VALUE TAG_INPUT_ENTER TAG_INPUT_ESCAPE TAG_INPUT_TYPE TAG_INPUT_BLUR DOUBLE_CLICK_TAG POINTER_DOWN_TAG CLICK_DELETE_TAG PASTE DELIMITER_KEY ARROW_LEFT ARROW_RIGHT BACKSPACE DELETE ESCAPE ENTER aria-invalid aria-label data-highlighted data-disabled data-readonly data-required data-empty';",
      "  return (",
      "    <div {...api.getRootProps()} data-tags-input-root data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Skills</label>",
      "      <div {...api.getControlProps()}>",
      "        <input {...api.getHiddenInputProps()} />",
      "        {api.value.map((value, index) => {",
      "          const item = { value, index };",
      "          return (",
      "            <span key={value} {...api.getItemProps(item)}>",
      "              <span {...api.getItemPreviewProps(item)}>",
      "                <span {...api.getItemTextProps(item)}>{value}</span>",
      "                <button {...api.getItemDeleteTriggerProps(item)}>Delete</button>",
      "              </span>",
      "              <input {...api.getItemInputProps(item)} />",
      "            </span>",
      "          );",
      "        })}",
      "        <input {...api.getInputProps()} aria-label='Add skill' />",
      "        <button {...api.getClearTriggerProps()}>Clear</button>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-tags-input.tsx"), [
      "export function NativeTagsInput() {",
      "  return (",
      "    <div data-tags-input-root data-empty='false' data-readonly='false' data-disabled='false' data-required='true' dir='ltr'>",
      "      <label htmlFor='tag-entry'>Topics</label>",
      "      <div data-tags-input-control>",
      "        <input id='tag-hidden' type='hidden' name='topics' form='topic-form' required value='react,testing' />",
      "        <span data-part='item' data-value='react'>",
      "          <span data-part='item-preview' data-highlighted='true'>",
      "            <span data-part='item-text'>react</span>",
      "            <button type='button' aria-label='Delete tag react' data-highlighted='true'>Delete</button>",
      "          </span>",
      "          <input data-part='item-input' aria-label='Editing tag react. Press enter to save or escape to cancel.' maxLength={24} hidden />",
      "        </span>",
      "        <input id='tag-entry' data-part='input' aria-invalid='false' autoComplete='off' placeholder='Add topic' />",
      "        <button type='button' aria-label='Clear all tags' data-clear-trigger>Clear</button>",
      "      </div>",
      "      <p>keyboard-test paste-test edit-test delete-test aria-test live-region form-reset dispatch-input-event allow-duplicates allow-overflow sanitize-value validate maxLength delimiter addOnPaste blurBehavior upload-artifact tags-input-traces</p>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "tags-input.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { SkillsTagsInput } from '../src/zag-tags-input';",
      "",
      "describe('tags input readiness', () => {",
      "  it('covers keyboard, paste, edit, delete, and aria traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<SkillsTagsInput />);",
      "    expect(screen.getByLabelText('Add skill')).toHaveAttribute('aria-invalid', 'false');",
      "    await user.type(screen.getByLabelText('Add skill'), 'accessibility{enter}');",
      "    await user.paste('docs,qa');",
      "    await user.keyboard('{ArrowLeft}{ArrowRight}{Backspace}{Delete}{Escape}{Enter}');",
      "    await user.dblClick(screen.getByText('React'));",
      "    await user.click(screen.getByLabelText('Delete tag React'));",
      "    expect(vi.fn()).toBeDefined();",
      "    expect('keyboard-test paste-test edit-test delete-test aria-test upload-artifact tags-input-traces').toContain('tags-input-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "tags-input.yml"), [
      "name: tags-input-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- tags-input",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: tags-input-traces",
      "          path: test-results/tags-input"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/react": "latest",
        "@zag-js/tags-input": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tags-input-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tagsInputSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; hiddenInputCount: number; itemCount: number; editCount: number; deleteCount: number; valueCount: number; validationCount: number; interactionCount: number; accessibilityCount: number; formCount: number; liveRegionCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      liveRegionSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Tags input readiness Zag tags input value array editable tags paste delimiter validation live region form hidden input keyboard delete accessibility tests");
    expect(report.tagsInputSetups.some((item) => item.filePath === "src/zag-tags-input.tsx" && item.framework === "zag-tags-input" && item.rootCount > 0 && item.inputCount > 0 && item.hiddenInputCount > 0 && item.itemCount > 0 && item.editCount > 0 && item.deleteCount > 0 && item.valueCount > 0 && item.validationCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0 && item.formCount > 0 && item.liveRegionCount > 0)).toBe(true);
    expect(report.tagsInputSetups.some((item) => item.filePath === "src/native-tags-input.tsx" && item.framework === "native-token-input" && item.rootCount > 0 && item.inputCount > 0 && item.hiddenInputCount > 0 && item.itemCount > 0 && item.deleteCount > 0 && item.accessibilityCount > 0 && item.formCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-tags-input", "native-token-input", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "input", "hidden-input", "item", "item-preview", "item-input", "item-text", "clear-trigger", "delete-trigger"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "input-value", "default-input-value", "value-as-string", "set-value", "add-value", "clear-value", "set-value-at-index", "count-at-max"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["max", "max-length", "validate", "sanitize-value", "allow-duplicates", "allow-overflow", "invalid-reason"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["type", "enter", "delimiter", "paste", "blur", "arrow-navigation", "backspace-delete", "escape", "double-click-edit", "pointer-tag", "focus"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["label", "aria-invalid", "aria-label", "data-highlighted", "data-disabled", "data-readonly", "data-required", "data-empty", "dir"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["hidden-input", "name", "form", "required", "disabled-fieldset", "form-reset", "dispatch-input-event"]));
    expect(readySignals(report.liveRegionSignals)).toEqual(expect.arrayContaining(["live-region", "translations", "announce-add", "announce-update", "announce-delete", "announce-paste", "announce-select"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "paste-test", "edit-test", "delete-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tags-input", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/tags-input"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records tags input readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "tags-input-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "tags-input-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "tags-input-readiness.html"))).resolves.toBeUndefined();
    const tagsInputMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tags-input-readiness.md"), "utf8");
    expect(tagsInputMarkdown).toContain("Tags Input Readiness");
    expect(tagsInputMarkdown).toContain("@zag-js/tags-input");
    const tagsInputHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tags-input-readiness.html"), "utf8");
    expect(tagsInputHtml).toContain("tags-input-readiness-card");
    expect(tagsInputHtml).toContain("data-source-pattern=\"TagsInput\"");
    expect(tagsInputHtml).toContain("RepoTutor records tags input readiness only");
  });

  it("detects Zag tags input machine readiness without editing tags", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tags-input-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tags-input-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tags-input-machine.tsx"), [
      "import * as tagsInput from '@zag-js/tags-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function SourceBackedTagsInput() {",
      "  const service = useMachine(tagsInput.machine, {",
      "    id: 'source-backed-tags',",
      "    dir: 'rtl',",
      "    name: 'skills',",
      "    form: 'skills-form',",
      "    value: ['React', 'TypeScript'],",
      "    defaultValue: ['React'],",
      "    inputValue: 'RepoTutor',",
      "    defaultInputValue: 'docs',",
      "    max: 4,",
      "    maxLength: 24,",
      "    addOnPaste: true,",
      "    allowDuplicates: false,",
      "    allowOverflow: false,",
      "    delimiter: /[,;]/,",
      "    editable: true,",
      "    autoFocus: true,",
      "    blurBehavior: 'add',",
      "    required: true,",
      "    invalid: false,",
      "    validate: ({ inputValue, value }) => inputValue.length > 1 && value.length <= 4,",
      "    sanitizeValue: (value) => value.trim().toLowerCase(),",
      "    translations: {",
      "      clearTriggerLabel: 'Clear all tags',",
      "      deleteTagTriggerLabel: (value) => `Delete tag ${value}`,",
      "      tagAdded: (value) => `Added tag ${value}`,",
      "      tagsPasted: (values) => `Pasted ${values.length} tags`,",
      "      tagEdited: (value) => `Editing tag ${value}. Press enter to save or escape to cancel.`,",
      "      tagUpdated: (value) => `Tag update to ${value}`,",
      "      tagDeleted: (value) => `Tag ${value} deleted`,",
      "      tagSelected: (value) => `Tag ${value} selected. Press enter to edit, delete or backspace to remove.`",
      "    },",
      "    onValueChange: console.info,",
      "    onInputValueChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onValueInvalid: console.warn,",
      "    onInteractOutside: console.info,",
      "    onFocusOutside: console.info,",
      "    onPointerDownOutside: console.info",
      "  });",
      "  const api = tagsInput.connect(service, normalizeProps);",
      "  api.empty;",
      "  api.inputValue;",
      "  api.value;",
      "  api.valueAsString;",
      "  api.count;",
      "  api.atMax;",
      "  api.setValue(['React', 'TypeScript']);",
      "  api.addValue('Testing');",
      "  api.clearValue('React');",
      "  api.setValueAtIndex(0, 'Accessibility');",
      "  api.setInputValue('state machines');",
      "  api.clearInputValue();",
      "  api.focus();",
      "  api.getItemState({ value: 'React', index: 0, disabled: false });",
      "  const evidence = 'createMachine createGuards idle focused:input navigating:tag editing:tag tags focused editing value inputValue fieldsetDisabled editedTagValue editedTagId editedTagIndex highlightedTagId count valueAsString sanitizedInputValue isDisabled isInteractive isAtMax isOverflowing trackLiveRegion trackFormControlState trackInteractOutside autoResize DOUBLE_CLICK_TAG POINTER_DOWN_TAG CLICK_DELETE_TAG SET_INPUT_VALUE SET_VALUE CLEAR_TAG SET_VALUE_AT_INDEX CLEAR_VALUE ADD_TAG INSERT_TAG EXTERNAL_BLUR TYPE BLUR ENTER DELIMITER_KEY ARROW_LEFT ARROW_RIGHT ARROW_DOWN BACKSPACE DELETE ESCAPE PASTE TAG_INPUT_TYPE TAG_INPUT_ESCAPE TAG_INPUT_BLUR TAG_INPUT_ENTER isInputRelatedTarget isAtMax hasHighlightedTag isFirstTagHighlighted isLastTagHighlighted isEditedTagEmpty isInputValueEmpty hasTags allowOverflow autoFocus addOnBlur clearOnBlur addOnPaste isTagEditable isCaretAtStart raiseInsertTagEvent raiseExternalBlurEvent dispatchChangeEvent highlightNextTag highlightFirstTag highlightLastTag highlightPrevTag highlightTag highlightTagAtIndex deleteTag deleteHighlightedTag setEditedId clearEditedId clearEditedTagValue setEditedTagValue submitEditedTagValue setValueAtIndex focusEditedTagInput setInputValue clearHighlightedId focusInput clearInputValue syncInputValue syncEditedTagInputValue addTag addTagFromPaste clearTags invokeOnInvalid clearLog logHighlightedTag announceLog getRootId getInputId getClearTriggerId getHiddenInputId getLabelId getControlId getItemId getItemDeleteTriggerId getItemInputId getEditInputId getEditInputEl getItemEls getTagInputEl getRootEl getInputEl getHiddenInputEl getTagElements getFirstEl getLastEl getPrevEl getNextEl getTagElAtIndex getIndexOfId isInputFocused getTagValue setHoverIntent clearHoverIntent dispatchInputEvent @zag-js/anatomy @zag-js/auto-resize @zag-js/core @zag-js/dom-query @zag-js/interact-outside @zag-js/live-region @zag-js/types @zag-js/utils';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Skills</label>",
      "      <div {...api.getControlProps()}>",
      "        <input {...api.getHiddenInputProps()} />",
      "        {api.value.map((value, index) => {",
      "          const item = { value, index };",
      "          return (",
      "            <span key={value} {...api.getItemProps(item)}>",
      "              <span {...api.getItemPreviewProps(item)}>",
      "                <span {...api.getItemTextProps(item)}>{value}</span>",
      "                <button {...api.getItemDeleteTriggerProps(item)}>Delete</button>",
      "              </span>",
      "              <input {...api.getItemInputProps(item)} />",
      "            </span>",
      "          );",
      "        })}",
      "        <input {...api.getInputProps()} aria-label='Add skill' />",
      "        <button {...api.getClearTriggerProps()}>Clear</button>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/auto-resize": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/interact-outside": "latest",
        "@zag-js/live-region": "latest",
        "@zag-js/react": "latest",
        "@zag-js/tags-input": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tags-input-readiness-report.json"), "utf8")) as {
      tagsInputSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; hiddenInputCount: number; itemCount: number; editCount: number; deleteCount: number; valueCount: number; validationCount: number; interactionCount: number; accessibilityCount: number; formCount: number; liveRegionCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.tagsInputSetups.some((item) => item.filePath === "src/zag-tags-input-machine.tsx" && item.framework === "zag-tags-input" && item.rootCount > 0 && item.inputCount > 0 && item.hiddenInputCount > 0 && item.itemCount > 0 && item.editCount > 0 && item.deleteCount > 0 && item.valueCount > 0 && item.validationCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0 && item.formCount > 0 && item.liveRegionCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-tags-input"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "focused-input-state", "navigating-tag-state", "editing-tag-state", "double-click-tag-event", "pointer-tag-event", "delete-tag-event", "set-value-events", "add-insert-events", "external-blur-event", "input-key-events", "tag-input-events", "paste-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["count", "value-as-string", "sanitized-input-value", "disabled", "interactive", "at-max", "overflowing"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["live-region", "form-control", "interact-outside", "auto-resize"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["input-related-target", "at-max", "highlighted-tag", "first-last-highlighted", "edited-tag-empty", "input-empty", "has-tags", "allow-overflow", "auto-focus", "blur-behavior", "add-on-paste", "tag-editable", "caret-start"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["raise-insert", "external-blur", "dispatch-change", "highlight-navigation", "delete-tag", "edited-id", "edited-tag-value", "submit-edited-tag", "set-value-at-index", "focus-edited-input", "input-value", "highlighted-id", "focus-input", "sync-inputs", "add-tag", "paste-tag", "clear-tags", "set-value", "invalid-callback", "log-announcements"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "input-id", "clear-trigger-id", "hidden-input-id", "label-id", "control-id", "item-id", "item-delete-trigger-id", "item-input-id", "edit-input-id", "item-els", "tag-input-el", "root-el", "input-el", "hidden-input-el", "tag-elements", "first-last", "prev-next", "index-of-id", "input-focused", "tag-value", "hover-intent", "dispatch-input-event"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["empty", "input-value", "value", "value-as-string", "count", "at-max", "set-value", "clear-value", "add-value", "set-value-at-index", "set-input-value", "clear-input-value", "focus", "item-state", "root-props", "label-props", "control-props", "input-props", "hidden-input-props", "item-props", "item-preview-props", "item-text-props", "item-input-props", "item-delete-trigger-props", "clear-trigger-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tags-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/auto-resize", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/live-region", "@zag-js/types", "@zag-js/utils", "react"]));
    const tagsInputMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tags-input-readiness.md"), "utf8");
    expect(tagsInputMarkdown).toContain("Machine Signals");
    expect(tagsInputMarkdown).toContain("@zag-js/tags-input");
    const tagsInputHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tags-input-readiness.html"), "utf8");
    expect(tagsInputHtml).toContain("Machine Signals");
    expect(tagsInputHtml).toContain("@zag-js/tags-input");
  });

  it("detects clipboard readiness without copying clipboard data", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-clipboard-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-clipboard-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-clipboard.tsx"), [
      "import * as clipboard from '@zag-js/clipboard';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ShareLinkClipboard() {",
      "  const service = useMachine(clipboard.machine, {",
      "    id: 'share-link',",
      "    value: 'https://example.test/lesson',",
      "    defaultValue: 'https://example.test/default',",
      "    timeout: 1500,",
      "    translations: {",
      "      triggerLabel: (copied) => copied ? 'Copied to clipboard' : 'Copy to clipboard'",
      "    },",
      "    onStatusChange: console.info,",
      "    onValueChange: console.info",
      "  });",
      "  const api = clipboard.connect(service, normalizeProps);",
      "  api.setValue('https://example.test/updated');",
      "  api.copy();",
      "  api.copied;",
      "  api.value;",
      "  const evidence = 'writeToClipboard navigator.clipboard.writeText execCommand copyText createNode copyNode getSelection createRange selectNodeContents removeAllRanges setRafTimeout COPY COPY.DONE INPUT.COPY VALUE.SET syncInputElement setElementValue data-copied data-readonly aria-label onCopy onFocus triggerLabel onStatusChange onValueChange';",
      "  return (",
      "    <div {...api.getRootProps()} data-clipboard-root data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Share URL</label>",
      "      <div {...api.getControlProps()}>",
      "        <input {...api.getInputProps()} />",
      "        <button {...api.getTriggerProps()}>Copy</button>",
      "        <span {...api.getIndicatorProps({ copied: true })}>Copied</span>",
      "        <span {...api.getIndicatorProps({ copied: false })}>Copy link</span>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-clipboard.tsx"), [
      "export function NativeClipboard() {",
      "  async function copyWithFallback(value: string) {",
      "    if (navigator.clipboard?.writeText) {",
      "      await navigator.clipboard.writeText(value);",
      "      return;",
      "    }",
      "    const node = document.createElement('pre');",
      "    node.textContent = value;",
      "    document.body.appendChild(node);",
      "    const selection = window.getSelection();",
      "    const range = document.createRange();",
      "    range.selectNodeContents(node);",
      "    selection?.removeAllRanges();",
      "    selection?.addRange(range);",
      "    document.execCommand('copy');",
      "    selection?.removeAllRanges();",
      "    document.body.removeChild(node);",
      "  }",
      "  return (",
      "    <div data-clipboard-root data-copied='false'>",
      "      <label htmlFor='share-url'>Share URL</label>",
      "      <input id='share-url' readOnly data-readonly='true' value='https://example.test/native' onCopy={() => copyWithFallback('https://example.test/native')} />",
      "      <button type='button' aria-label='Copy to clipboard' data-copied='false' onClick={() => copyWithFallback('https://example.test/native')}>Copy</button>",
      "      <span hidden data-copied='true'>Copied to clipboard</span>",
      "      <p>click-test copy-test aria-test status-test upload-artifact clipboard-traces COPY.DONE setRafTimeout triggerLabel data-copied</p>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "clipboard.spec.tsx"), [
      "import { fireEvent, render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { ShareLinkClipboard } from '../src/zag-clipboard';",
      "",
      "describe('clipboard readiness', () => {",
      "  it('covers click, copy, aria, and status traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ShareLinkClipboard />);",
      "    expect(screen.getByLabelText('Share URL')).toHaveAttribute('data-readonly', 'true');",
      "    expect(screen.getByRole('button', { name: /copy/i })).toHaveAttribute('aria-label');",
      "    await user.click(screen.getByRole('button', { name: /copy/i }));",
      "    fireEvent.copy(screen.getByLabelText('Share URL'));",
      "    vi.useFakeTimers();",
      "    vi.advanceTimersByTime(1500);",
      "    vi.useRealTimers();",
      "    expect('click-test copy-test aria-test status-test upload-artifact clipboard-traces').toContain('clipboard-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "clipboard.yml"), [
      "name: clipboard-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- clipboard",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: clipboard-traces",
      "          path: test-results/clipboard"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/clipboard": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "clipboard-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      clipboardSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; triggerCount: number; indicatorCount: number; valueCount: number; copyCount: number; statusCount: number; timerCount: number; accessibilityCount: number; fallbackCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      copySignals: Array<{ signal: string; readiness: string }>;
      statusSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Clipboard readiness Zag clipboard copy value trigger indicator timeout native clipboard fallback accessibility tests");
    expect(report.clipboardSetups.some((item) => item.filePath === "src/zag-clipboard.tsx" && item.framework === "zag-clipboard" && item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.valueCount > 0 && item.copyCount > 0 && item.statusCount > 0 && item.timerCount > 0 && item.accessibilityCount > 0 && item.fallbackCount > 0)).toBe(true);
    expect(report.clipboardSetups.some((item) => item.filePath === "src/native-clipboard.tsx" && item.framework === "native-clipboard" && item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.copyCount > 0 && item.accessibilityCount > 0 && item.fallbackCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-clipboard", "native-clipboard", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "input", "trigger", "indicator"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "set-value", "sync-input", "read-only-input"]));
    expect(readySignals(report.copySignals)).toEqual(expect.arrayContaining(["copy", "input-copy", "navigator-clipboard", "exec-command", "selection-range", "fallback-node", "copy-done"]));
    expect(readySignals(report.statusSignals)).toEqual(expect.arrayContaining(["copied-state", "data-copied", "status-change", "timeout", "translations"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "label", "read-only", "data-readonly", "focus-select", "hidden-indicator"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "copy-test", "aria-test", "status-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/clipboard", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/clipboard"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records clipboard readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "clipboard-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "clipboard-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "clipboard-readiness.html"))).resolves.toBeUndefined();
    const clipboardMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "clipboard-readiness.md"), "utf8");
    expect(clipboardMarkdown).toContain("Clipboard Readiness");
    expect(clipboardMarkdown).toContain("@zag-js/clipboard");
    const clipboardHtml = await fs.readFile(path.join(result.session.outputPaths.html, "clipboard-readiness.html"), "utf8");
    expect(clipboardHtml).toContain("clipboard-readiness-card");
    expect(clipboardHtml).toContain("data-source-pattern=\"Clipboard\"");
    expect(clipboardHtml).toContain("RepoTutor records clipboard readiness only");
  });

  it("detects Zag clipboard machine readiness without writing clipboard data", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-clipboard-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-clipboard-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-clipboard-machine.tsx"), [
      "import * as clipboard from '@zag-js/clipboard';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ClipboardMachineFixture() {",
      "  const service = useMachine(clipboard.machine, {",
      "    id: 'copy-code',",
      "    value: 'pnpm test',",
      "    defaultValue: 'pnpm build',",
      "    timeout: 3000,",
      "    ids: { root: 'clip-root', input: 'clip-input', label: 'clip-label' },",
      "    translations: { triggerLabel: (copied) => copied ? 'Copied to clipboard' : 'Copy to clipboard' },",
      "    onStatusChange(details) { console.info(details.copied); },",
      "    onValueChange(details) { console.info(details.value); }",
      "  });",
      "  const api = clipboard.connect(service, normalizeProps);",
      "  const copied = api.copied;",
      "  const value = api.value;",
      "  api.setValue(value);",
      "  api.copy();",
      "  const machineEvidence = 'createMachine ClipboardSchema initialState idle states copied VALUE.SET COPY INPUT.COPY COPY.DONE watch track context.get value defaultValue timeout translations triggerLabel waitForTimeout setRafTimeout setValue copyToClipboard invokeOnCopy syncInputElement setElementValue send COPY';",
      "  const domEvidence = 'getRootId getInputId getLabelId getInputEl writeToClipboard createNode copyNode copyText navigator.clipboard.writeText execCommand getSelection createRange selectNodeContents removeAllRanges addRange appendChild removeChild';",
      "  const packageEvidence = '@zag-js/clipboard @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={machineEvidence}>",
      "      <label {...api.getLabelProps()}>Command</label>",
      "      <div {...api.getControlProps()} data-dom-evidence={domEvidence} data-package-evidence={packageEvidence}>",
      "        <input {...api.getInputProps()} />",
      "        <button {...api.getTriggerProps()}>Copy</button>",
      "        <span {...api.getIndicatorProps({ copied: true })}>Copied</span>",
      "        <span {...api.getIndicatorProps({ copied: false })}>Copy command</span>",
      "      </div>",
      "      <output>{copied ? value : 'ready'}</output>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/clipboard": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "clipboard-readiness-report.json"), "utf8")) as {
      clipboardSetups: Array<{ filePath: string; framework: string; rootCount: number; inputCount: number; triggerCount: number; indicatorCount: number; valueCount: number; copyCount: number; statusCount: number; timerCount: number; accessibilityCount: number; fallbackCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.clipboardSetups.some((item) => item.filePath === "src/zag-clipboard-machine.tsx" && item.framework === "zag-clipboard" && item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.valueCount > 0 && item.copyCount > 0 && item.statusCount > 0 && item.timerCount > 0 && item.accessibilityCount > 0 && item.fallbackCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-clipboard"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "copied-state", "value-context", "value-set-event", "copy-event", "input-copy-event", "copy-done-event", "watch-value-sync", "default-value", "timeout-default", "translation-label"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["timeout-effect", "raf-timeout"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-value", "copy-to-clipboard", "invoke-on-copy", "sync-input-element", "send-copy"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "input-id", "label-id", "input-el", "write-to-clipboard", "create-node", "copy-node", "copy-text", "navigator-write-text", "exec-command", "selection-range", "append-remove-node"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["copied", "value", "set-value", "copy", "root-props", "label-props", "control-props", "input-props", "trigger-props", "indicator-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/clipboard", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const clipboardMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "clipboard-readiness.md"), "utf8");
    expect(clipboardMarkdown).toContain("Machine Signals");
    expect(clipboardMarkdown).toContain("@zag-js/clipboard");
    const clipboardHtml = await fs.readFile(path.join(result.session.outputPaths.html, "clipboard-readiness.html"), "utf8");
    expect(clipboardHtml).toContain("Machine Signals");
    expect(clipboardHtml).toContain("@zag-js/clipboard");
  });

  it("detects QR code readiness without generating downloads", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-qr-code-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-qr-code-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-qr-code.tsx"), [
      "import * as qrCode from '@zag-js/qr-code';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ShareQrCode() {",
      "  const service = useMachine(qrCode.machine, {",
      "    id: 'share-qr',",
      "    value: 'https://example.test/lesson',",
      "    defaultValue: 'https://example.test/default',",
      "    pixelSize: 8,",
      "    encoding: { ecc: 'M', maskPattern: 2 },",
      "    onValueChange: console.info",
      "  });",
      "  const api = qrCode.connect(service, normalizeProps);",
      "  api.setValue('https://example.test/updated');",
      "  api.getDataUrl('image/png', 0.92);",
      "  api.value;",
      "  const evidence = 'encode uqr encoded.size encoded.data pixelSize paths.join viewBox getDataUrl getFrameEl DOWNLOAD_TRIGGER.CLICK downloadQrCode mimeType quality fileName dataUri createElement(\"a\") rel noopener download click setTimeout remove VALUE.SET onValueChange getRootProps getFrameProps getPatternProps getOverlayProps getDownloadTriggerProps';",
      "  return (",
      "    <div {...api.getRootProps()} data-qr-code-root data-evidence={evidence}>",
      "      <svg {...api.getFrameProps()} role='img' aria-label='QR code for share URL'>",
      "        <path {...api.getPatternProps()} />",
      "      </svg>",
      "      <div {...api.getOverlayProps()} aria-label='Brand overlay'>RT</div>",
      "      <button {...api.getDownloadTriggerProps({ mimeType: 'image/png', quality: 0.92, fileName: 'share-qr.png' })}>Download QR</button>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-qr-code.tsx"), [
      "export function NativeQrCode() {",
      "  const pathData = 'M0,0h8v8h-8z M16,0h8v8h-8z';",
      "  function downloadSvg() {",
      "    const svg = document.querySelector('svg[data-qr-frame]');",
      "    const dataUrl = `data:image/svg+xml,${encodeURIComponent(String(svg))}`;",
      "    const anchor = document.createElement('a');",
      "    anchor.href = dataUrl;",
      "    anchor.download = 'native-qr.svg';",
      "    anchor.rel = 'noopener';",
      "    anchor.click();",
      "    setTimeout(() => anchor.remove(), 0);",
      "  }",
      "  return (",
      "    <figure data-qr-code-root>",
      "      <svg data-qr-frame role='img' aria-label='QR code for payment link' viewBox='0 0 128 128'>",
      "        <path data-qr-pattern d={pathData} />",
      "      </svg>",
      "      <figcaption data-qr-overlay aria-label='Logo overlay'>Pay</figcaption>",
      "      <button type='button' data-download-trigger onClick={downloadSvg}>Download QR</button>",
      "      <p>download-test data-url-test svg-test upload-artifact qr-code-traces mimeType quality fileName pixelSize encoding uqr overlay-alt</p>",
      "    </figure>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "qr-code.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { ShareQrCode } from '../src/zag-qr-code';",
      "",
      "describe('qr code readiness', () => {",
      "  it('covers svg, data url, and download traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<ShareQrCode />);",
      "    expect(screen.getByRole('img', { name: /qr code/i })).toBeDefined();",
      "    await user.click(screen.getByRole('button', { name: /download qr/i }));",
      "    expect(vi.fn()).toBeDefined();",
      "    expect('download-test data-url-test svg-test upload-artifact qr-code-traces').toContain('qr-code-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "qr-code.yml"), [
      "name: qr-code-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- qr-code",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: qr-code-traces",
      "          path: test-results/qr-code"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/qr-code": "latest",
        "@zag-js/react": "latest",
        "react": "latest",
        "uqr": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "qr-code-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      qrCodeSetups: Array<{ filePath: string; framework: string; rootCount: number; frameCount: number; patternCount: number; overlayCount: number; downloadCount: number; valueCount: number; encodingCount: number; pixelCount: number; renderCount: number; dataUrlCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      encodingSignals: Array<{ signal: string; readiness: string }>;
      downloadSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("QR code readiness Zag qr-code uqr SVG pattern overlay download data URL encoding pixel size accessibility tests");
    expect(report.qrCodeSetups.some((item) => item.filePath === "src/zag-qr-code.tsx" && item.framework === "zag-qr-code" && item.rootCount > 0 && item.frameCount > 0 && item.patternCount > 0 && item.overlayCount > 0 && item.downloadCount > 0 && item.valueCount > 0 && item.encodingCount > 0 && item.pixelCount > 0 && item.renderCount > 0 && item.dataUrlCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.qrCodeSetups.some((item) => item.filePath === "src/native-qr-code.tsx" && item.framework === "native-svg-qr" && item.rootCount > 0 && item.frameCount > 0 && item.patternCount > 0 && item.overlayCount > 0 && item.downloadCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-qr-code", "native-svg-qr", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "frame", "pattern", "overlay", "download-trigger"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "set-value", "on-value-change"]));
    expect(readySignals(report.encodingSignals)).toEqual(expect.arrayContaining(["encoding", "uqr", "encoded-size", "pixel-size", "path-data", "viewbox"]));
    expect(readySignals(report.downloadSignals)).toEqual(expect.arrayContaining(["get-data-url", "download-trigger", "mime-type", "quality", "file-name", "anchor-click"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-img", "aria-label", "svg", "button", "overlay-alt"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "download-test", "data-url-test", "svg-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/qr-code", "uqr", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/qr-code"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records QR code readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "qr-code-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "qr-code-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "qr-code-readiness.html"))).resolves.toBeUndefined();
    const qrMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "qr-code-readiness.md"), "utf8");
    expect(qrMarkdown).toContain("QR Code Readiness");
    expect(qrMarkdown).toContain("@zag-js/qr-code");
    const qrHtml = await fs.readFile(path.join(result.session.outputPaths.html, "qr-code-readiness.html"), "utf8");
    expect(qrHtml).toContain("qr-code-readiness-card");
    expect(qrHtml).toContain("data-source-pattern=\"QRCode\"");
    expect(qrHtml).toContain("RepoTutor records QR code readiness only");
  });

  it("detects Zag QR code machine readiness without generating downloads", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-qr-code-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-qr-code-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-qr-code-machine.tsx"), [
      "import * as qrCode from '@zag-js/qr-code';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function QrCodeMachineFixture() {",
      "  const service = useMachine(qrCode.machine, {",
      "    id: 'share-qr',",
      "    value: 'https://example.test/current',",
      "    defaultValue: 'https://example.test/default',",
      "    pixelSize: 10,",
      "    ids: { root: 'qr-root', frame: 'qr-frame' },",
      "    encoding: { ecc: 'M', maskPattern: 2 },",
      "    onValueChange(details) { console.info(details.value); }",
      "  });",
      "  const api = qrCode.connect(service, normalizeProps);",
      "  const value = api.value;",
      "  api.setValue(value);",
      "  api.getDataUrl('image/png', 0.92);",
      "  const machineEvidence = 'createMachine QrCodeSchema initialState idle context.get value defaultValue pixelSize 10 computed encoded memo encode uqr QrCodeGenerateOptions QrCodeGenerateResult VALUE.SET DOWNLOAD_TRIGGER.CLICK setValue downloadQrCode getDataUrl mimeType quality fileName dataUri createElement(\"a\") rel noopener download a.click setTimeout remove';",
      "  const renderEvidence = 'encoded.size encoded.data width height paths.push paths.join viewBox getRootId getFrameId getFrameEl getRootProps getFrameProps getPatternProps getOverlayProps getDownloadTriggerProps';",
      "  const packageEvidence = '@zag-js/qr-code @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils proxy-memoize uqr react';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={machineEvidence}>",
      "      <svg {...api.getFrameProps()} role='img' aria-label='QR code for share URL' data-render-evidence={renderEvidence}>",
      "        <path {...api.getPatternProps()} />",
      "      </svg>",
      "      <div {...api.getOverlayProps()} data-package-evidence={packageEvidence}>RT</div>",
      "      <button {...api.getDownloadTriggerProps({ mimeType: 'image/png', quality: 0.92, fileName: 'share-qr.png' })}>Download QR</button>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/qr-code": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "proxy-memoize": "latest",
        "react": "latest",
        "react-dom": "latest",
        "uqr": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "qr-code-readiness-report.json"), "utf8")) as {
      qrCodeSetups: Array<{ filePath: string; framework: string; rootCount: number; frameCount: number; patternCount: number; overlayCount: number; downloadCount: number; valueCount: number; encodingCount: number; pixelCount: number; renderCount: number; dataUrlCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.qrCodeSetups.some((item) => item.filePath === "src/zag-qr-code-machine.tsx" && item.framework === "zag-qr-code" && item.rootCount > 0 && item.frameCount > 0 && item.patternCount > 0 && item.overlayCount > 0 && item.downloadCount > 0 && item.valueCount > 0 && item.encodingCount > 0 && item.pixelCount > 0 && item.renderCount > 0 && item.dataUrlCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-qr-code"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "idle-state", "value-context", "default-value", "pixel-size-default", "computed-encoded", "memo-encoded", "encode-uqr", "value-set-event", "download-trigger-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["encoded", "encoded-size", "encoded-data", "width-height", "path-list"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-value", "download-qr-code", "get-data-url", "anchor-create", "anchor-download", "anchor-click", "anchor-remove"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "frame-id", "frame-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["value", "set-value", "get-data-url", "root-props", "frame-props", "pattern-props", "overlay-props", "download-trigger-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/qr-code", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "proxy-memoize", "uqr", "react"]));
    const qrMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "qr-code-readiness.md"), "utf8");
    expect(qrMarkdown).toContain("Machine Signals");
    expect(qrMarkdown).toContain("@zag-js/qr-code");
    const qrHtml = await fs.readFile(path.join(result.session.outputPaths.html, "qr-code-readiness.html"), "utf8");
    expect(qrHtml).toContain("Machine Signals");
    expect(qrHtml).toContain("@zag-js/qr-code");
  });

  it("detects timer readiness without advancing timers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-timer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-timer-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-timer.tsx"), [
      "import * as timer from '@zag-js/timer';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function SessionTimer() {",
      "  const service = useMachine(timer.machine, {",
      "    id: 'lesson-timer',",
      "    autoStart: true,",
      "    countdown: true,",
      "    startMs: 60000,",
      "    targetMs: 0,",
      "    interval: 1000,",
      "    translations: { areaLabel: 'Lesson countdown' },",
      "    onTick: console.info,",
      "    onComplete: console.warn",
      "  });",
      "  const api = timer.connect(service, normalizeProps);",
      "  api.start();",
      "  api.pause();",
      "  api.resume();",
      "  api.reset();",
      "  api.restart();",
      "  api.running;",
      "  api.paused;",
      "  api.time;",
      "  api.formattedTime;",
      "  api.progressPercent;",
      "  const evidence = 'setRafInterval setRafTimeout keepTicking waitForNextTick TICK CONTINUE START PAUSE RESUME RESET RESTART updateTime resetTime invokeOnTick invokeOnComplete hasReachedTarget progressPercent msToTime formatTime toPercent clampValue roundToInterval padStart countdown startMs targetMs interval autoStart aria-atomic aria-hidden role timer areaLabel running paused formattedTime';",
      "  const parts = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'] as const;",
      "  return (",
      "    <div {...api.getRootProps()} data-timer-root data-evidence={evidence}>",
      "      <div {...api.getAreaProps()} role='timer' aria-label='Lesson countdown' aria-atomic='true'>",
      "        {parts.map((part) => (",
      "          <span key={part} {...api.getItemProps({ type: part })}>",
      "            <span {...api.getItemLabelProps({ type: part })}>{part}</span>",
      "            <span {...api.getItemValueProps({ type: part })}>{api.time[part]}</span>",
      "          </span>",
      "        ))}",
      "        <span {...api.getSeparatorProps()}>:</span>",
      "      </div>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getActionTriggerProps({ action: 'start' })}>Start</button>",
      "        <button {...api.getActionTriggerProps({ action: 'pause' })}>Pause</button>",
      "        <button {...api.getActionTriggerProps({ action: 'resume' })}>Resume</button>",
      "        <button {...api.getActionTriggerProps({ action: 'reset' })}>Reset</button>",
      "        <button {...api.getActionTriggerProps({ action: 'restart' })}>Restart</button>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-timer.tsx"), [
      "export function NativeTimer() {",
      "  const state = 'idle running paused running-temp auto-start';",
      "  const actions = 'START PAUSE RESUME RESET RESTART TICK CONTINUE onTick onComplete';",
      "  return (",
      "    <section data-timer-root>",
      "      <output role='timer' aria-label='Workout timer' aria-atomic='true'>",
      "        <span data-timer-item='minutes'><span data-timer-label>minutes</span><span data-timer-value>10</span></span>",
      "        <span data-timer-separator aria-hidden='true'>:</span>",
      "        <span data-timer-item='seconds'><span data-timer-label>seconds</span><span data-timer-value>00</span></span>",
      "      </output>",
      "      <div data-timer-control>",
      "        <button data-action-trigger='start'>Start</button>",
      "        <button data-action-trigger='pause'>Pause</button>",
      "        <button data-action-trigger='resume'>Resume</button>",
      "        <button data-action-trigger='reset'>Reset</button>",
      "        <button data-action-trigger='restart'>Restart</button>",
      "      </div>",
      "      <progress aria-label='Timer progress' value='60' max='100' />",
      "      <p>{state} {actions} countdown startMs targetMs interval autoStart progressPercent time formattedTime milliseconds setRafInterval setRafTimeout positive interval nonnegative start nonnegative target stopwatch config countdown config validate props hidden actions</p>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "timer.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { NativeTimer } from '../src/native-timer';",
      "",
      "describe('timer readiness', () => {",
      "  it('covers timer controls, aria, progress, and fake timers', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });",
      "    render(<NativeTimer />);",
      "    expect(screen.getByRole('timer', { name: /workout timer/i })).toHaveAttribute('aria-atomic', 'true');",
      "    expect(screen.getByRole('progressbar', { name: /timer progress/i })).toBeDefined();",
      "    await user.click(screen.getByRole('button', { name: /start/i }));",
      "    await user.click(screen.getByRole('button', { name: /pause/i }));",
      "    vi.advanceTimersByTime(1000);",
      "    expect('click-test aria-test progress-test fake-timers timer-traces upload-artifact').toContain('timer-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "timer.yml"), [
      "name: timer-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- timer",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: timer-traces",
      "          path: test-results/timer"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/react": "latest",
        "@zag-js/timer": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "timer-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      timerSetups: Array<{ filePath: string; framework: string; rootCount: number; areaCount: number; itemCount: number; controlCount: number; actionCount: number; stateCount: number; timeCount: number; tickCount: number; progressCount: number; accessibilityCount: number; validationCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      timeSignals: Array<{ signal: string; readiness: string }>;
      controlSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Timer readiness Zag timer countdown stopwatch interval tick progress controls aria timer completion tests");
    expect(report.timerSetups.some((item) => item.filePath === "src/zag-timer.tsx" && item.framework === "zag-timer" && item.rootCount > 0 && item.areaCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.actionCount > 0 && item.stateCount > 0 && item.timeCount > 0 && item.tickCount > 0 && item.progressCount > 0 && item.accessibilityCount > 0 && item.validationCount > 0)).toBe(true);
    expect(report.timerSetups.some((item) => item.filePath === "src/native-timer.tsx" && item.framework === "native-timer" && item.rootCount > 0 && item.areaCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.actionCount > 0 && item.stateCount > 0 && item.timeCount > 0 && item.progressCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-timer", "native-timer", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "area", "control", "item", "item-label", "item-value", "separator", "action-trigger"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "running", "paused", "running-temp", "auto-start"]));
    expect(readySignals(report.timeSignals)).toEqual(expect.arrayContaining(["time-parts", "formatted-time", "progress-percent", "countdown", "start-ms", "target-ms", "interval"]));
    expect(readySignals(report.controlSignals)).toEqual(expect.arrayContaining(["start", "pause", "resume", "reset", "restart", "tick", "complete"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-timer", "aria-label", "aria-atomic", "aria-hidden", "hidden-actions"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["validate-props", "positive-interval", "nonnegative-start", "nonnegative-target", "countdown-config", "stopwatch-config"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "fake-timers", "click-test", "aria-test", "progress-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/timer", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/timer"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records timer readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "timer-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "timer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "timer-readiness.html"))).resolves.toBeUndefined();
    const timerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "timer-readiness.md"), "utf8");
    expect(timerMarkdown).toContain("Timer Readiness");
    expect(timerMarkdown).toContain("@zag-js/timer");
    const timerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "timer-readiness.html"), "utf8");
    expect(timerHtml).toContain("timer-readiness-card");
    expect(timerHtml).toContain("data-source-pattern=\"Timer\"");
    expect(timerHtml).toContain("RepoTutor records timer readiness only");
  });

  it("detects Zag timer machine readiness without advancing timers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-timer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-timer-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-timer-machine.tsx"), [
      "import * as timer from '@zag-js/timer';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function TimerMachineFixture() {",
      "  const service = useMachine(timer.machine, {",
      "    id: 'lesson-timer',",
      "    autoStart: true,",
      "    countdown: true,",
      "    startMs: 60000,",
      "    targetMs: 0,",
      "    interval: 1000,",
      "    ids: { root: 'timer-root', area: 'timer-area' },",
      "    translations: { areaLabel: () => 'Lesson countdown' },",
      "    onTick(details) { console.info(details.value, details.time, details.formattedTime); },",
      "    onComplete() { console.info('complete'); }",
      "  });",
      "  const api = timer.connect(service, normalizeProps);",
      "  api.start();",
      "  api.pause();",
      "  api.resume();",
      "  api.reset();",
      "  api.restart();",
      "  const stateEvidence = `${api.running} ${api.paused} ${api.progressPercent} ${api.formattedTime.seconds}`;",
      "  const machineEvidence = 'createMachine TimerSchema validateProps interval 1000 startMs 0 initialState autoStart idle running running:temp paused currentMs RESTART START PAUSE RESUME RESET TICK CONTINUE hasReachedTarget';",
      "  const computedEvidence = 'computed time formattedTime progressPercent memo clampValue msToTime formatTime toPercent roundToInterval padStart days hours minutes seconds milliseconds';",
      "  const effectEvidence = 'keepTicking waitForNextTick setRafInterval setRafTimeout updateTime resetTime invokeOnTick invokeOnComplete countdown targetMs Math.max Math.min';",
      "  const apiEvidence = 'validActions getRootProps getAreaProps getControlProps getItemProps getItemLabelProps getItemValueProps getSeparatorProps getActionTriggerProps hidden match role timer aria-label aria-atomic aria-hidden';",
      "  const parseEvidence = 'parse isObject isTimeSegment Invalid date days hours minutes seconds milliseconds new Date getTime';",
      "  const packageEvidence = '@zag-js/timer @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={machineEvidence}>",
      "      <div {...api.getAreaProps()} data-computed-evidence={computedEvidence} data-effect-evidence={effectEvidence} data-state-evidence={stateEvidence}>",
      "        <span {...api.getItemProps({ type: 'minutes' })}>",
      "          <span {...api.getItemLabelProps({ type: 'minutes' })}>minutes</span>",
      "          <span {...api.getItemValueProps({ type: 'minutes' })}>{api.time.minutes}</span>",
      "        </span>",
      "        <span {...api.getSeparatorProps()}>:</span>",
      "        <span {...api.getItemProps({ type: 'seconds' })}>",
      "          <span {...api.getItemLabelProps({ type: 'seconds' })}>seconds</span>",
      "          <span {...api.getItemValueProps({ type: 'seconds' })}>{api.time.seconds}</span>",
      "        </span>",
      "      </div>",
      "      <div {...api.getControlProps()} data-api-evidence={apiEvidence} data-parse-evidence={parseEvidence} data-package-evidence={packageEvidence}>",
      "        <button {...api.getActionTriggerProps({ action: 'start' })}>Start</button>",
      "        <button {...api.getActionTriggerProps({ action: 'pause' })}>Pause</button>",
      "        <button {...api.getActionTriggerProps({ action: 'resume' })}>Resume</button>",
      "        <button {...api.getActionTriggerProps({ action: 'reset' })}>Reset</button>",
      "        <button {...api.getActionTriggerProps({ action: 'restart' })}>Restart</button>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/timer": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "timer-readiness-report.json"), "utf8")) as {
      timerSetups: Array<{ filePath: string; framework: string; rootCount: number; areaCount: number; itemCount: number; controlCount: number; actionCount: number; stateCount: number; timeCount: number; tickCount: number; progressCount: number; accessibilityCount: number; validationCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      parseSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.timerSetups.some((item) => item.filePath === "src/zag-timer-machine.tsx" && item.framework === "zag-timer" && item.rootCount > 0 && item.areaCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.actionCount > 0 && item.stateCount > 0 && item.timeCount > 0 && item.tickCount > 0 && item.progressCount > 0 && item.accessibilityCount > 0 && item.validationCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-timer"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "validate-props", "idle-state", "running-state", "running-temp-state", "paused-state", "auto-start", "restart-event", "start-event", "pause-event", "resume-event", "reset-event", "tick-event", "continue-event", "current-ms-context"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["time", "formatted-time", "progress-percent", "memo-progress", "clamp-value", "ms-to-time", "format-time", "to-percent", "round-to-interval", "pad-start"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["keep-ticking", "wait-next-tick", "raf-interval", "raf-timeout"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["update-time", "reset-time", "invoke-on-tick", "invoke-on-complete", "countdown-delta", "target-clamp"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["has-reached-target", "countdown-target-default", "countdown-target", "stopwatch-target"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "area-id", "area-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["running", "paused", "time", "formatted-time", "progress-percent", "start", "pause", "resume", "reset", "restart", "root-props", "area-props", "control-props", "item-props", "item-label-props", "item-value-props", "separator-props", "action-trigger-props", "valid-actions", "hidden-actions"]));
    expect(readySignals(report.parseSignals)).toEqual(expect.arrayContaining(["parse-string", "parse-time-segment", "time-segments", "milliseconds", "invalid-date", "is-object"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/timer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const timerMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "timer-readiness.md"), "utf8");
    expect(timerMarkdown).toContain("Machine Signals");
    expect(timerMarkdown).toContain("@zag-js/timer");
    const timerHtml = await fs.readFile(path.join(result.session.outputPaths.html, "timer-readiness.html"), "utf8");
    expect(timerHtml).toContain("Machine Signals");
    expect(timerHtml).toContain("@zag-js/timer");
  });

  it("detects steps readiness without navigating real forms", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-steps-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-steps-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-steps.tsx"), [
      "import * as steps from '@zag-js/steps';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function CheckoutSteps() {",
      "  const service = useMachine(steps.machine, {",
      "    id: 'checkout-steps',",
      "    count: 3,",
      "    defaultStep: 1,",
      "    linear: true,",
      "    orientation: 'horizontal',",
      "    isStepValid: (index) => index !== 1,",
      "    isStepSkippable: (index) => index === 2,",
      "    onStepChange: console.info,",
      "    onStepComplete: console.warn,",
      "    onStepInvalid: console.error",
      "  });",
      "  const api = steps.connect(service, normalizeProps);",
      "  api.goToNextStep();",
      "  api.goToPrevStep();",
      "  api.resetStep();",
      "  api.setStep(2);",
      "  api.getItemState({ index: 1 });",
      "  api.value; api.count; api.percent; api.hasNextStep; api.hasPrevStep; api.isCompleted; api.isStepValid(1); api.isStepSkippable(2);",
      "  const evidence = 'STEP.SET STEP.NEXT STEP.PREV STEP.RESET setStep goToNextStep goToPrevStep resetStep validateStepIndex isValueWithinRange isCurrentStepValid isValidStepNavigation invokeOnStepInvalid onStepChange onStepComplete onStepInvalid linear orientation defaultStep count percent completed hasNextStep hasPrevStep current incomplete first last skippable aria-current aria-selected aria-controls aria-owns aria-orientation data-complete data-current data-incomplete role tablist tab tabpanel progressbar';",
      "  return (",
      "    <div {...api.getRootProps()} data-steps-root data-evidence={evidence}>",
      "      <ol {...api.getListProps()} role='tablist' aria-orientation='horizontal'>",
      "        {[0, 1, 2].map((index) => (",
      "          <li key={index} {...api.getItemProps({ index })}>",
      "            <button {...api.getTriggerProps({ index })}>Step {index + 1}</button>",
      "            <span {...api.getIndicatorProps({ index })}>Indicator</span>",
      "            <span {...api.getSeparatorProps({ index })}>/</span>",
      "          </li>",
      "        ))}",
      "      </ol>",
      "      {[0, 1, 2].map((index) => <section key={index} {...api.getContentProps({ index })}>Content {index + 1}</section>)}",
      "      <button {...api.getPrevTriggerProps()}>Previous</button>",
      "      <button {...api.getNextTriggerProps()}>Next</button>",
      "      <div {...api.getProgressProps()} role='progressbar' />",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-steps.tsx"), [
      "export function NativeSteps() {",
      "  const state = 'step defaultStep current completed incomplete first last hasNextStep hasPrevStep isCompleted percent';",
      "  const validation = 'linear isStepValid isStepSkippable onStepInvalid validateStepIndex isValueWithinRange count range check';",
      "  return (",
      "    <section data-steps-root>",
      "      <ol data-steps-list role='tablist' aria-owns='shipping billing review' aria-orientation='horizontal'>",
      "        <li data-steps-item aria-current='step' data-current>",
      "          <button role='tab' aria-selected='true' aria-controls='shipping' data-steps-trigger>Shipping</button>",
      "          <span data-steps-indicator aria-hidden='true'>1</span>",
      "          <span data-steps-separator data-complete>/</span>",
      "        </li>",
      "        <li data-steps-item data-incomplete>",
      "          <button role='tab' aria-selected='false' aria-controls='billing' data-steps-trigger>Billing</button>",
      "        </li>",
      "      </ol>",
      "      <section id='shipping' role='tabpanel' aria-labelledby='shipping-tab' data-steps-content>Shipping content</section>",
      "      <button data-prev-trigger disabled>Previous</button>",
      "      <button data-next-trigger>Next</button>",
      "      <progress aria-label='Checkout progress' value='33' max='100' />",
      "      <p>{state} {validation} STEP.SET STEP.NEXT STEP.PREV STEP.RESET setStep goToNextStep goToPrevStep resetStep click-test aria-test linear-test progress-test steps-traces upload-artifact</p>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "steps.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeSteps } from '../src/native-steps';",
      "",
      "describe('steps readiness', () => {",
      "  it('covers tabs, panels, linear blocking, and progress traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativeSteps />);",
      "    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'horizontal');",
      "    expect(screen.getByRole('tab', { name: /shipping/i })).toHaveAttribute('aria-selected', 'true');",
      "    expect(screen.getByRole('tabpanel')).toBeDefined();",
      "    expect(screen.getByRole('progressbar', { name: /checkout progress/i })).toBeDefined();",
      "    await user.click(screen.getByRole('button', { name: /next/i }));",
      "    expect('click-test aria-test linear-test progress-test steps-traces upload-artifact').toContain('steps-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "steps.yml"), [
      "name: steps-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- steps",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: steps-traces",
      "          path: test-results/steps"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/react": "latest",
        "@zag-js/steps": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "steps-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      stepsSetups: Array<{ filePath: string; framework: string; rootCount: number; listCount: number; itemCount: number; triggerCount: number; contentCount: number; navCount: number; progressCount: number; stateCount: number; validationCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      validationSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Steps readiness Zag steps wizard stepper linear progress tablist validation navigation tests");
    expect(report.stepsSetups.some((item) => item.filePath === "src/zag-steps.tsx" && item.framework === "zag-steps" && item.rootCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.navCount > 0 && item.progressCount > 0 && item.stateCount > 0 && item.validationCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.stepsSetups.some((item) => item.filePath === "src/native-steps.tsx" && item.framework === "native-stepper" && item.rootCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.navCount > 0 && item.progressCount > 0 && item.stateCount > 0 && item.validationCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-steps", "native-stepper", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "list", "item", "trigger", "indicator", "separator", "content", "next-trigger", "prev-trigger", "progress"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["step", "default-step", "current", "completed", "incomplete", "first-last", "has-next-prev", "is-completed", "percent"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["step-set", "step-next", "step-prev", "step-reset", "set-step", "next-step", "prev-step", "reset-step"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["linear", "is-step-valid", "is-step-skippable", "on-step-invalid", "range-check", "count"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["tablist", "tab", "tabpanel", "aria-current", "aria-selected", "aria-controls", "aria-owns", "aria-orientation", "disabled"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "aria-test", "linear-test", "progress-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/steps", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/steps"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records steps readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "steps-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "steps-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "steps-readiness.html"))).resolves.toBeUndefined();
    const stepsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "steps-readiness.md"), "utf8");
    expect(stepsMarkdown).toContain("Steps Readiness");
    expect(stepsMarkdown).toContain("@zag-js/steps");
    const stepsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "steps-readiness.html"), "utf8");
    expect(stepsHtml).toContain("steps-readiness-card");
    expect(stepsHtml).toContain("data-source-pattern=\"Steps\"");
    expect(stepsHtml).toContain("RepoTutor records steps readiness only");
  });

  it("detects Zag steps machine readiness without navigating real forms", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-steps-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-steps-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-steps-machine.tsx"), [
      "import * as steps from '@zag-js/steps';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagStepsMachineFixture() {",
      "  const service = useMachine(steps.machine, {",
      "    id: 'checkout-steps',",
      "    count: 4,",
      "    defaultStep: 1,",
      "    step: 1,",
      "    linear: true,",
      "    orientation: 'vertical',",
      "    ids: { root: 'steps-root', list: 'steps-list', triggerId: (index) => `steps-trigger-${index}`, contentId: (index) => `steps-content-${index}` },",
      "    isStepValid: (index) => index !== 2,",
      "    isStepSkippable: (index) => index === 3,",
      "    onStepChange(details) { console.info(details.step); },",
      "    onStepComplete() { console.info('completed'); },",
      "    onStepInvalid(details) { console.warn(details.step, details.action, details.targetStep); }",
      "  });",
      "  const api = steps.connect(service, normalizeProps);",
      "  api.goToNextStep();",
      "  api.goToPrevStep();",
      "  api.resetStep();",
      "  api.setStep(2);",
      "  const itemState = api.getItemState({ index: 1 });",
      "  const machineEvidence = 'createMachine StepsSchema defaultStep 0 count 1 linear false orientation horizontal bindable step initialState idle entry validateStepIndex STEP.SET STEP.NEXT STEP.PREV STEP.RESET';",
      "  const computedEvidence = 'computed percent memo hasNextStep hasPrevStep completed context.get step prop count';",
      "  const guardEvidence = 'isCurrentStepValid isValidStepNavigation isStepSkippable isStepValid skippable bypass event.value <= current validateStepIndex isValueWithinRange';",
      "  const actionEvidence = 'goToNextStep goToPrevStep resetStep setStep validateStepIndex invokeOnStepInvalid onStepChange onStepComplete Math.min Math.max context.set step';",
      "  const domEvidence = 'getRootId getListId getTriggerId getContentId ids root list triggerId contentId';",
      "  const apiEvidence = 'value count percent hasNextStep hasPrevStep isCompleted isStepValid isStepSkippable goToNextStep goToPrevStep resetStep getItemState setStep getRootProps getListProps getItemProps getTriggerProps getContentProps getNextTriggerProps getPrevTriggerProps getProgressProps getIndicatorProps getSeparatorProps current completed incomplete first last skippable isValid triggerId contentId role tablist tab tabpanel aria-current aria-selected aria-controls aria-owns aria-orientation progressbar';",
      "  const packageEvidence = '@zag-js/steps @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <div {...api.getRootProps()} data-machine-evidence={machineEvidence} data-computed-evidence={computedEvidence}>",
      "      <ol {...api.getListProps()} data-guard-evidence={guardEvidence}>",
      "        {[0, 1, 2, 3].map((index) => (",
      "          <li key={index} {...api.getItemProps({ index })}>",
      "            <button {...api.getTriggerProps({ index })}>Step {index + 1}</button>",
      "            <span {...api.getIndicatorProps({ index })}>Indicator</span>",
      "            <span {...api.getSeparatorProps({ index })}>/</span>",
      "          </li>",
      "        ))}",
      "      </ol>",
      "      {[0, 1, 2, 3].map((index) => <section key={index} {...api.getContentProps({ index })}>Content {index + 1}</section>)}",
      "      <button {...api.getPrevTriggerProps()} data-action-evidence={actionEvidence}>Previous</button>",
      "      <button {...api.getNextTriggerProps()}>Next</button>",
      "      <div {...api.getProgressProps()} data-dom-evidence={domEvidence} data-api-evidence={apiEvidence} data-package-evidence={packageEvidence} />",
      "      <output>{api.value} {api.count} {api.percent} {String(api.hasNextStep)} {String(api.hasPrevStep)} {String(api.isCompleted)} {String(api.isStepValid(1))} {String(api.isStepSkippable(3))} {itemState.triggerId} {itemState.contentId} {String(itemState.current)} {String(itemState.completed)} {String(itemState.incomplete)} {String(itemState.first)} {String(itemState.last)} {String(itemState.skippable)} {String(itemState.isValid())}</output>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/steps": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "steps-readiness-report.json"), "utf8")) as {
      stepsSetups: Array<{ filePath: string; framework: string; rootCount: number; listCount: number; itemCount: number; triggerCount: number; contentCount: number; navCount: number; progressCount: number; stateCount: number; validationCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.stepsSetups.some((item) => item.filePath === "src/zag-steps-machine.tsx" && item.framework === "zag-steps" && item.rootCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.navCount > 0 && item.progressCount > 0 && item.stateCount > 0 && item.validationCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-steps"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-step", "count-default", "linear-default", "orientation-default", "bindable-step", "idle-state", "entry-validate-step", "step-set-event", "step-next-event", "step-prev-event", "step-reset-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["percent", "memo-percent", "has-next-step", "has-prev-step", "completed"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["current-step-valid", "valid-step-navigation", "skippable-bypass", "valid-callback", "range-check"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["go-to-next-step", "go-to-prev-step", "reset-step", "set-step", "validate-step-index", "invoke-step-invalid", "step-change-callback", "step-complete-callback", "min-bound", "max-bound"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "list-id", "trigger-id", "content-id"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["value", "count", "percent", "has-next-step", "has-prev-step", "is-completed", "is-step-valid", "is-step-skippable", "go-to-next-step", "go-to-prev-step", "reset-step", "get-item-state", "set-step", "root-props", "list-props", "item-props", "trigger-props", "content-props", "next-trigger-props", "prev-trigger-props", "progress-props", "indicator-props", "separator-props", "item-state"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/steps", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const stepsMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "steps-readiness.md"), "utf8");
    expect(stepsMarkdown).toContain("Machine Signals");
    expect(stepsMarkdown).toContain("@zag-js/steps");
    const stepsHtml = await fs.readFile(path.join(result.session.outputPaths.html, "steps-readiness.html"), "utf8");
    expect(stepsHtml).toContain("Machine Signals");
    expect(stepsHtml).toContain("@zag-js/steps");
  });

  it("detects carousel readiness without scrolling real DOM", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-carousel-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-carousel-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-carousel.tsx"), [
      "import * as carousel from '@zag-js/carousel';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ProductCarousel() {",
      "  const service = useMachine(carousel.machine, {",
      "    id: 'product-carousel',",
      "    slideCount: 4,",
      "    defaultPage: 1,",
      "    page: 1,",
      "    slidesPerPage: 2,",
      "    slidesPerMove: 'auto',",
      "    spacing: '12px',",
      "    padding: '16px',",
      "    orientation: 'horizontal',",
      "    snapType: 'mandatory',",
      "    loop: true,",
      "    autoplay: { delay: 4000 },",
      "    allowMouseDrag: true,",
      "    inViewThreshold: 0.6,",
      "    autoSize: true,",
      "    onPageChange: console.info,",
      "    onDragStatusChange: console.warn,",
      "    onAutoplayStatusChange: console.error",
      "  });",
      "  const api = carousel.connect(service, normalizeProps);",
      "  api.scrollNext(); api.scrollPrev(); api.scrollTo(2); api.scrollToIndex(3); api.play(); api.pause(); api.refresh();",
      "  api.page; api.pageSnapPoints; api.canScrollNext; api.canScrollPrev; api.isPlaying; api.isDragging; api.isInView(1); api.getProgress(); api.getProgressText();",
      "  const evidence = 'PAGE.NEXT PAGE.PREV PAGE.SET INDEX.SET SNAP.REFRESH PAGE.SCROLL DRAGGING.START DRAGGING DRAGGING.END SCROLL.END AUTOPLAY.START AUTOPLAY.PAUSE AUTOPLAY.TICK VIEWPORT.FOCUS VIEWPORT.BLUR trackSlideMutation trackSlideIntersections trackSlideResize trackScroll trackSettlingScroll trackDocumentVisibility trackPointerMove trackKeyboardScroll setSnapPoints getScrollSnapPositions findSnapPoint scrollToPage scrollToPageIfDrifted setClosestPage setNextPage setPrevPage setMatchingPage disableScrollSnap scrollSlides endDragging invokeAutoplayStart invokeAutoplay invokeAutoplayEnd invokeDragStart invokeDragging invokeDraggingEnd aria-roledescription carousel slide aria-live aria-hidden aria-controls data-current';",
      "  return (",
      "    <div {...api.getRootProps()} data-carousel-root data-evidence={evidence}>",
      "      <div {...api.getItemGroupProps()}>",
      "        {[0, 1, 2, 3].map((index) => <article key={index} {...api.getItemProps({ index, snapAlign: 'start' })}>Slide {index + 1}</article>)}",
      "      </div>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getPrevTriggerProps()}>Previous slide</button>",
      "        <button {...api.getNextTriggerProps()}>Next slide</button>",
      "        <button {...api.getAutoplayTriggerProps()}>Autoplay</button>",
      "      </div>",
      "      <div {...api.getIndicatorGroupProps()}>",
      "        {[0, 1, 2].map((index) => <button key={index} {...api.getIndicatorProps({ index, readOnly: index === 2 })}>Go to slide {index + 1}</button>)}",
      "      </div>",
      "      <p {...api.getProgressTextProps()}>{api.getProgressText()}</p>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-carousel.tsx"), [
      "export function NativeCarousel() {",
      "  const snap = 'scroll-snap-type scrollSnapAlign scrollPaddingInline slidesPerPage slidesPerMove autoSize spacing orientation mandatory snap points pageSnapPoints';",
      "  const events = 'scrollNext scrollPrev scrollTo scrollToIndex indicator click ArrowRight ArrowLeft Home End wheel touch drag mouse autoplay play pause interval visibilitychange';",
      "  return (",
      "    <section data-carousel-root role='region' aria-roledescription='carousel' aria-label='Featured lessons carousel'>",
      "      <div data-carousel-item-group aria-live='polite' style={{ scrollSnapType: 'x mandatory', overflowX: 'auto' }}>",
      "        <article data-carousel-item data-index='0' data-inview role='group' aria-roledescription='slide' aria-label='1 of 3'>Slide 1</article>",
      "        <article data-carousel-item data-index='1' role='group' aria-roledescription='slide' aria-label='2 of 3' aria-hidden='true'>Slide 2</article>",
      "      </div>",
      "      <div data-carousel-control>",
      "        <button data-prev-trigger aria-controls='lesson-carousel-items'>Previous slide</button>",
      "        <button data-next-trigger aria-controls='lesson-carousel-items'>Next slide</button>",
      "        <button data-autoplay-trigger aria-label='Start slide rotation' data-pressed='false'>Play</button>",
      "      </div>",
      "      <div data-indicator-group onKeyDown={() => undefined}>",
      "        <button data-indicator data-current aria-label='Go to slide 1'>1</button>",
      "        <button data-indicator data-readonly aria-label='Go to slide 2'>2</button>",
      "      </div>",
      "      <p data-progress-text>1 / 3</p>",
      "      <p>{snap} {events} onPageChange onDragStatusChange onAutoplayStatusChange click-test keyboard-test autoplay-test drag-test carousel-traces upload-artifact</p>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "carousel.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { NativeCarousel } from '../src/native-carousel';",
      "",
      "describe('carousel readiness', () => {",
      "  it('covers controls, indicators, keyboard, autoplay, and drag traces', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });",
      "    render(<NativeCarousel />);",
      "    expect(screen.getByRole('region', { name: /featured lessons/i })).toHaveAttribute('aria-roledescription', 'carousel');",
      "    expect(screen.getByRole('group', { name: /1 of 3/i })).toHaveAttribute('aria-roledescription', 'slide');",
      "    await user.click(screen.getByRole('button', { name: /next slide/i }));",
      "    await user.keyboard('{ArrowRight}{Home}{End}');",
      "    vi.advanceTimersByTime(4000);",
      "    expect('click-test keyboard-test autoplay-test drag-test carousel-traces upload-artifact').toContain('carousel-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "carousel.yml"), [
      "name: carousel-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- carousel",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: carousel-traces",
      "          path: test-results/carousel"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/carousel": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "carousel-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      carouselSetups: Array<{ filePath: string; framework: string; rootCount: number; itemGroupCount: number; itemCount: number; controlCount: number; triggerCount: number; indicatorCount: number; autoplayCount: number; snapCount: number; scrollCount: number; dragCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      snapSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      autoplaySignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Carousel readiness Zag carousel slides snap autoplay drag scroll indicators accessibility tests");
    expect(report.carouselSetups.some((item) => item.filePath === "src/zag-carousel.tsx" && item.framework === "zag-carousel" && item.rootCount > 0 && item.itemGroupCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.autoplayCount > 0 && item.snapCount > 0 && item.scrollCount > 0 && item.dragCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.carouselSetups.some((item) => item.filePath === "src/native-carousel.tsx" && item.framework === "native-carousel" && item.rootCount > 0 && item.itemGroupCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.autoplayCount > 0 && item.snapCount > 0 && item.scrollCount > 0 && item.dragCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-carousel", "native-carousel", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "item-group", "item", "control", "prev-trigger", "next-trigger", "indicator-group", "indicator", "autoplay-trigger", "progress-text"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["page", "page-snap-points", "slides-in-view", "can-scroll-next-prev", "is-playing", "is-dragging", "loop"]));
    expect(readySignals(report.snapSignals)).toEqual(expect.arrayContaining(["scroll-snap", "snap-points", "slides-per-page", "slides-per-move", "auto-size", "spacing", "orientation"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["scroll-next", "scroll-prev", "scroll-to", "scroll-to-index", "indicator-click", "keyboard", "wheel", "touch", "mouse-drag"]));
    expect(readySignals(report.autoplaySignals)).toEqual(expect.arrayContaining(["autoplay", "play", "pause", "tick", "interval", "visibility", "autoplay-status"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["region", "carousel-roledescription", "slide-roledescription", "aria-live", "aria-label", "aria-hidden", "aria-controls", "data-current"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "autoplay-test", "drag-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/carousel", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/carousel"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records carousel readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "carousel-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "carousel-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "carousel-readiness.html"))).resolves.toBeUndefined();
    const carouselMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "carousel-readiness.md"), "utf8");
    expect(carouselMarkdown).toContain("Carousel Readiness");
    expect(carouselMarkdown).toContain("@zag-js/carousel");
    const carouselHtml = await fs.readFile(path.join(result.session.outputPaths.html, "carousel-readiness.html"), "utf8");
    expect(carouselHtml).toContain("carousel-readiness-card");
    expect(carouselHtml).toContain("data-source-pattern=\"Carousel\"");
    expect(carouselHtml).toContain("RepoTutor records carousel readiness only");
  });

  it("detects Zag carousel machine readiness without scrolling real DOM", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-carousel-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-carousel-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-carousel-machine.tsx"), [
      "import * as carousel from '@zag-js/carousel';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagCarouselMachineFixture() {",
      "  const service = useMachine(carousel.machine, {",
      "    id: 'lesson-carousel',",
      "    slideCount: 5,",
      "    defaultPage: 1,",
      "    page: 1,",
      "    orientation: 'horizontal',",
      "    snapType: 'mandatory',",
      "    loop: true,",
      "    slidesPerPage: 2,",
      "    slidesPerMove: 'auto',",
      "    spacing: '12px',",
      "    padding: '16px',",
      "    autoplay: { delay: 4000 },",
      "    allowMouseDrag: true,",
      "    inViewThreshold: 0.6,",
      "    autoSize: true,",
      "    ids: { root: 'carousel-root', itemGroup: 'carousel-item-group', item: (index) => `carousel-item-${index}`, nextTrigger: 'carousel-next', prevTrigger: 'carousel-prev', indicatorGroup: 'carousel-indicators', indicator: (index) => `carousel-indicator-${index}` },",
      "    translations: { nextTrigger: 'Next slide', prevTrigger: 'Previous slide', indicator: (index) => `Go to slide ${index + 1}`, item: (index, count) => `${index + 1} of ${count}`, autoplayStart: 'Start slide rotation', autoplayStop: 'Stop slide rotation', progressText: ({ page, totalPages }) => `${page} / ${totalPages}` },",
      "    onPageChange(details) { console.info(details.page, details.pageSnapPoint); },",
      "    onDragStatusChange(details) { console.info(details.type, details.page, details.isDragging); },",
      "    onAutoplayStatusChange(details) { console.info(details.type, details.page, details.isPlaying); }",
      "  });",
      "  const api = carousel.connect(service, normalizeProps);",
      "  api.scrollNext(); api.scrollPrev(); api.scrollTo(2); api.scrollToIndex(3); api.play(); api.pause(); api.refresh();",
      "  const apiState = `${api.isPlaying} ${api.isDragging} ${api.page} ${api.pageSnapPoints.length} ${api.canScrollNext} ${api.canScrollPrev} ${api.getProgress()} ${api.getProgressText()} ${api.isInView(1)}`;",
      "  const machineEvidence = 'createMachine CarouselSchema ensureProps slideCount dir ltr defaultPage 0 orientation horizontal snapType mandatory loop autoplay slidesPerPage 1 slidesPerMove auto spacing 0px allowMouseDrag false inViewThreshold 0.6 autoSize false refs timeoutRef initialState idle autoplay focus dragging settling userScroll PAGE.NEXT PAGE.PREV PAGE.SET INDEX.SET SNAP.REFRESH PAGE.SCROLL DRAGGING.START DRAGGING DRAGGING.END SCROLL.END AUTOPLAY.START AUTOPLAY.PAUSE AUTOPLAY.TICK VIEWPORT.FOCUS VIEWPORT.BLUR';",
      "  const computedEvidence = 'computed isRtl isHorizontal canScrollNext canScrollPrev autoplayInterval isObject delay 4000';",
      "  const effectEvidence = 'trackSlideMutation trackSlideIntersections trackSlideResize trackScroll trackSettlingScroll trackDocumentVisibility trackPointerMove trackKeyboardScroll autoUpdateSlide MutationObserver IntersectionObserver resizeObserverBorderBox addDomEvent setInterval clearInterval';",
      "  const actionEvidence = 'clearScrollEndTimer scrollToPage scrollToPageIfDrifted setClosestPage setNextPage setPrevPage setMatchingPage setPage setSnapPoints disableScrollSnap scrollSlides endDragging focusIndicatorEl invokeDragStart invokeDragging invokeDraggingEnd invokeAutoplay invokeAutoplayStart invokeAutoplayEnd getScrollSnapPositions findSnapPoint nextIndex prevIndex clampValue DRIFT_THRESHOLD Math.abs';",
      "  const guardEvidence = 'isFocused scope.isActiveElement canScrollNext canScrollPrev loop state.matches autoplay prop loop DRIFT_THRESHOLD clampValue';",
      "  const domEvidence = 'getRootId getItemId getItemGroupId getNextTriggerId getPrevTriggerId getIndicatorGroupId getIndicatorId getRootEl getItemGroupEl getItemEl getItemEls getIndicatorEl syncTabIndex getTabbables queryAll';",
      "  const apiEvidence = 'isPlaying isDragging page pageSnapPoints canScrollNext canScrollPrev getProgress getProgressText scrollToIndex scrollTo scrollNext scrollPrev play pause isInView refresh getRootProps getItemGroupProps getItemProps getControlProps getPrevTriggerProps getNextTriggerProps getIndicatorGroupProps getIndicatorProps getAutoplayTriggerProps getProgressTextProps role region aria-roledescription carousel slide aria-live aria-hidden aria-controls data-current data-pressed';",
      "  const packageEvidence = '@zag-js/carousel @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/scroll-snap @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <div {...api.getRootProps()} data-machine-evidence={machineEvidence} data-computed-evidence={computedEvidence}>",
      "      <div {...api.getItemGroupProps()} data-effect-evidence={effectEvidence} data-action-evidence={actionEvidence}>",
      "        {[0, 1, 2, 3, 4].map((index) => <article key={index} {...api.getItemProps({ index, snapAlign: 'start' })}>Slide {index + 1}</article>)}",
      "      </div>",
      "      <div {...api.getControlProps()} data-guard-evidence={guardEvidence}>",
      "        <button {...api.getPrevTriggerProps()}>Previous slide</button>",
      "        <button {...api.getNextTriggerProps()}>Next slide</button>",
      "        <button {...api.getAutoplayTriggerProps()}>Autoplay</button>",
      "      </div>",
      "      <div {...api.getIndicatorGroupProps()}>",
      "        {[0, 1, 2].map((index) => <button key={index} {...api.getIndicatorProps({ index, readOnly: index === 2 })}>Go to slide {index + 1}</button>)}",
      "      </div>",
      "      <p {...api.getProgressTextProps()} data-dom-evidence={domEvidence} data-api-evidence={apiEvidence} data-package-evidence={packageEvidence}>{api.getProgressText()} {apiState}</p>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/carousel": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/scroll-snap": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "carousel-readiness-report.json"), "utf8")) as {
      carouselSetups: Array<{ filePath: string; framework: string; rootCount: number; itemGroupCount: number; itemCount: number; controlCount: number; triggerCount: number; indicatorCount: number; autoplayCount: number; snapCount: number; scrollCount: number; dragCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.carouselSetups.some((item) => item.filePath === "src/zag-carousel-machine.tsx" && item.framework === "zag-carousel" && item.rootCount > 0 && item.itemGroupCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.autoplayCount > 0 && item.snapCount > 0 && item.scrollCount > 0 && item.dragCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-carousel"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "ensure-slide-count", "default-page", "orientation-default", "snap-type-default", "loop-autoplay-default", "slides-per-page", "slides-per-move", "autoplay-default", "allow-mouse-drag-default", "in-view-threshold", "auto-size-default", "idle-state", "focus-state", "dragging-state", "settling-state", "user-scroll-state", "autoplay-state", "page-next-event", "page-prev-event", "page-set-event", "index-set-event", "snap-refresh-event", "page-scroll-event", "dragging-events", "autoplay-events", "viewport-events", "scroll-end-event"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-rtl", "is-horizontal", "can-scroll-next", "can-scroll-prev", "autoplay-interval"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-slide-mutation", "track-slide-intersections", "track-slide-resize", "track-scroll", "track-settling-scroll", "track-document-visibility", "track-pointer-move", "track-keyboard-scroll", "auto-update-slide"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["clear-scroll-end-timer", "scroll-to-page", "scroll-if-drifted", "set-closest-page", "set-next-page", "set-prev-page", "set-matching-page", "set-page", "set-snap-points", "disable-scroll-snap", "scroll-slides", "end-dragging", "focus-indicator", "invoke-drag-start", "invoke-dragging", "invoke-dragging-end", "invoke-autoplay", "invoke-autoplay-start", "invoke-autoplay-end"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["is-focused", "can-scroll-next", "can-scroll-prev", "loop-mode", "drift-threshold", "clamp-page"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "item-id", "item-group-id", "next-trigger-id", "prev-trigger-id", "indicator-group-id", "indicator-id", "root-el", "item-group-el", "item-el", "item-els", "indicator-el", "sync-tab-index"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["is-playing", "is-dragging", "page", "page-snap-points", "can-scroll-next", "can-scroll-prev", "progress", "progress-text", "scroll-to-index", "scroll-to", "scroll-next", "scroll-prev", "play", "pause", "is-in-view", "refresh", "root-props", "item-group-props", "item-props", "control-props", "prev-trigger-props", "next-trigger-props", "indicator-group-props", "indicator-props", "autoplay-trigger-props", "progress-text-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/carousel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/scroll-snap", "@zag-js/types", "@zag-js/utils", "react"]));
    const carouselMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "carousel-readiness.md"), "utf8");
    expect(carouselMarkdown).toContain("Machine Signals");
    expect(carouselMarkdown).toContain("@zag-js/carousel");
    const carouselHtml = await fs.readFile(path.join(result.session.outputPaths.html, "carousel-readiness.html"), "utf8");
    expect(carouselHtml).toContain("Machine Signals");
    expect(carouselHtml).toContain("@zag-js/carousel");
  });

  it("detects tree view readiness without expanding real DOM nodes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tree-view-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tree-view-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tree-view.tsx"), [
      "import * as treeView from '@zag-js/tree-view';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import { collection } from '@zag-js/collection';",
      "",
      "const tree = collection.tree({ rootNode: { value: 'root', children: [{ value: 'docs', children: [{ value: 'intro' }] }, { value: 'api' }] } });",
      "",
      "export function RepositoryTreeView() {",
      "  const service = useMachine(treeView.machine, {",
      "    id: 'repository-tree',",
      "    collection: tree,",
      "    selectionMode: 'multiple',",
      "    defaultExpandedValue: ['docs'],",
      "    expandedValue: ['docs'],",
      "    defaultSelectedValue: ['intro'],",
      "    selectedValue: ['intro'],",
      "    defaultCheckedValue: ['api'],",
      "    checkedValue: ['api'],",
      "    defaultFocusedValue: 'docs',",
      "    focusedValue: 'docs',",
      "    expandOnClick: true,",
      "    typeahead: true,",
      "    loadChildren: async ({ signal }) => signal.aborted ? [] : [{ value: 'loaded-child' }],",
      "    scrollToIndexFn: console.info,",
      "    canRename: () => true,",
      "    onExpandedChange: console.info,",
      "    onSelectionChange: console.warn,",
      "    onFocusChange: console.error,",
      "    onCheckedChange: console.info,",
      "    onLoadChildrenComplete: console.info,",
      "    onLoadChildrenError: console.error,",
      "    onRenameStart: console.warn,",
      "    onBeforeRename: () => true,",
      "    onRenameComplete: console.info",
      "  });",
      "  const api = treeView.connect(service, normalizeProps);",
      "  const branch = { node: tree.findNode('docs')!, indexPath: [0] };",
      "  const item = { node: tree.findNode('intro')!, indexPath: [0, 0] };",
      "  api.expandedValue; api.selectedValue; api.checkedValue; api.getVisibleNodes(); api.getCheckedMap(); api.getNodeState(item);",
      "  api.expand(['docs']); api.collapse(['docs']); api.select(['intro']); api.deselect(['api']); api.focus('docs'); api.selectParent('intro'); api.expandParent('intro'); api.setExpandedValue(['docs']); api.setSelectedValue(['intro']);",
      "  api.toggleChecked('docs', true); api.setChecked(['api']); api.clearChecked(); api.startRenaming('intro'); api.submitRenaming('intro', 'Introduction'); api.cancelRenaming();",
      "  const evidence = 'EXPANDED.SET EXPANDED.CLEAR EXPANDED.ALL BRANCH.EXPAND BRANCH.COLLAPSE SELECTED.SET SELECTED.ALL SELECTED.CLEAR NODE.SELECT NODE.DESELECT CHECKED.TOGGLE CHECKED.SET CHECKED.CLEAR NODE.FOCUS NODE.ARROW_DOWN NODE.ARROW_UP NODE.ARROW_LEFT BRANCH_NODE.ARROW_LEFT BRANCH_NODE.ARROW_RIGHT SIBLINGS.EXPAND NODE.HOME NODE.END NODE.CLICK BRANCH_NODE.CLICK BRANCH_TOGGLE.CLICK TREE.TYPEAHEAD NODE.RENAME RENAME.SUBMIT RENAME.CANCEL clearPendingAborts pendingAborts AbortController loadChildren onLoadChildrenComplete onLoadChildrenError scrollToIndexFn focusTreeNextNode focusTreePrevNode focusTreeFirstNode focusTreeLastNode extendSelectionToNextNode extendSelectionToPrevNode getByTypeahead role tree treeitem group checkbox aria-multiselectable aria-selected aria-expanded aria-level aria-checked aria-busy aria-label aria-disabled data-selected data-state data-depth data-indeterminate';",
      "  return (",
      "    <div {...api.getRootProps()} data-tree-view-root data-evidence={evidence}>",
      "      <span {...api.getLabelProps()}>Repository tree</span>",
      "      <div {...api.getTreeProps()}>",
      "        <div {...api.getBranchProps(branch)}>",
      "          <button {...api.getBranchControlProps(branch)}>",
      "            <span {...api.getBranchIndicatorProps(branch)}>open</span>",
      "            <span {...api.getBranchTextProps(branch)}>docs</span>",
      "            <button {...api.getBranchTriggerProps(branch)}>Toggle branch</button>",
      "            <span {...api.getBranchIndentGuideProps(branch)} />",
      "            <span {...api.getNodeCheckboxProps(branch)} />",
      "            <input {...api.getNodeRenameInputProps(branch)} />",
      "          </button>",
      "          <div {...api.getBranchContentProps(branch)}>",
      "            <a {...api.getItemProps(item)}><span {...api.getItemIndicatorProps(item)} /> <span {...api.getItemTextProps(item)}>intro</span></a>",
      "          </div>",
      "        </div>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-tree-view.tsx"), [
      "export function NativeTreeView() {",
      "  const state = 'expandedValue selectedValue checkedValue focusedValue visibleNodes nodeState loadingStatus renamingValue selectionMode multiple single checked map';",
      "  const events = 'ArrowDown ArrowUp ArrowLeft ArrowRight Home End typeahead select parent expand parent meta ctrl shift click F2 Escape Enter rename loadChildren AbortController scrollToIndexFn';",
      "  return (",
      "    <section data-tree-view-root>",
      "      <h2 id='repository-tree-label'>Repository tree</h2>",
      "      <ul role='tree' aria-labelledby='repository-tree-label' aria-multiselectable='true'>",
      "        <li role='treeitem' aria-expanded='true' aria-selected='true' aria-level='1' aria-busy='false' data-state='open' data-depth='1' data-selected data-focus>",
      "          <button data-part='branch-control' aria-label='Toggle docs branch'>docs</button>",
      "          <button data-part='branch-trigger'>Toggle branch</button>",
      "          <span data-part='branch-indicator' aria-hidden='true'>open</span>",
      "          <span data-part='branch-indent-guide' />",
      "          <span role='checkbox' aria-checked='mixed' data-indeterminate />",
      "          <input aria-label='Rename tree item' data-part='node-rename-input' />",
      "          <ul role='group' data-part='branch-content'>",
      "            <li role='treeitem' aria-selected='false' aria-level='2' data-part='item'><span data-part='item-indicator' aria-hidden='true' />intro</li>",
      "          </ul>",
      "        </li>",
      "      </ul>",
      "      <p>{state} {events} click-test keyboard-test typeahead-test rename-test loading-test tree-view-traces upload-artifact</p>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "tree-view.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeTreeView } from '../src/native-tree-view';",
      "",
      "describe('tree view readiness', () => {",
      "  it('covers keyboard, typeahead, rename, loading, and selection traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativeTreeView />);",
      "    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');",
      "    expect(screen.getByRole('treeitem', { name: /docs/i })).toHaveAttribute('aria-expanded', 'true');",
      "    await user.click(screen.getByRole('button', { name: /toggle docs branch/i }));",
      "    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowLeft}{ArrowRight}{Home}{End}docs{F2}{Enter}{Escape}');",
      "    expect('click-test keyboard-test typeahead-test rename-test loading-test tree-view-traces upload-artifact').toContain('tree-view-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "tree-view.yml"), [
      "name: tree-view-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- tree-view",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: tree-view-traces",
      "          path: test-results/tree-view"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/tree-view": "latest",
        "@zag-js/collection": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tree-view-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      treeViewSetups: Array<{ filePath: string; framework: string; rootCount: number; treeCount: number; branchCount: number; itemCount: number; controlCount: number; checkboxCount: number; renameCount: number; selectionCount: number; expansionCount: number; loadingCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      loadingSignals: Array<{ signal: string; readiness: string }>;
      renameSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Tree view readiness Zag tree-view collection expansion selection checking rename lazy loading keyboard accessibility tests");
    expect(report.treeViewSetups.some((item) => item.filePath === "src/zag-tree-view.tsx" && item.framework === "zag-tree-view" && item.rootCount > 0 && item.treeCount > 0 && item.branchCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.checkboxCount > 0 && item.renameCount > 0 && item.selectionCount > 0 && item.expansionCount > 0 && item.loadingCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.treeViewSetups.some((item) => item.filePath === "src/native-tree-view.tsx" && item.framework === "native-tree" && item.rootCount > 0 && item.treeCount > 0 && item.branchCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.checkboxCount > 0 && item.renameCount > 0 && item.selectionCount > 0 && item.expansionCount > 0 && item.loadingCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-tree-view", "native-tree", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "tree", "branch", "branch-control", "branch-trigger", "branch-content", "branch-indicator", "item", "node-checkbox", "node-rename-input"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["expanded-value", "selected-value", "checked-value", "focused-value", "visible-nodes", "node-state", "loading-status", "renaming-value"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["arrow-down", "arrow-up", "arrow-left", "arrow-right", "home", "end", "typeahead", "select-parent", "expand-parent"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["single", "multiple", "select", "deselect", "select-all", "checked-toggle", "checked-map", "shift-selection", "ctrl-selection"]));
    expect(readySignals(report.loadingSignals)).toEqual(expect.arrayContaining(["load-children", "loading-status", "abort-controller", "load-complete", "load-error", "scroll-to-index"]));
    expect(readySignals(report.renameSignals)).toEqual(expect.arrayContaining(["start-renaming", "submit-renaming", "cancel-renaming", "can-rename", "before-rename", "rename-input"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["tree-role", "treeitem-role", "group-role", "checkbox-role", "aria-multiselectable", "aria-selected", "aria-expanded", "aria-level", "aria-checked", "aria-busy", "aria-label"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "typeahead-test", "rename-test", "loading-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tree-view", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/tree-view"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records tree view readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "tree-view-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "tree-view-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "tree-view-readiness.html"))).resolves.toBeUndefined();
    const treeViewMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tree-view-readiness.md"), "utf8");
    expect(treeViewMarkdown).toContain("Tree View Readiness");
    expect(treeViewMarkdown).toContain("@zag-js/tree-view");
    const treeViewHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tree-view-readiness.html"), "utf8");
    expect(treeViewHtml).toContain("tree-view-readiness-card");
    expect(treeViewHtml).toContain("data-source-pattern=\"TreeView\"");
    expect(treeViewHtml).toContain("RepoTutor records tree view readiness only");
  });

  it("detects Zag tree-view machine readiness without mutating real collections", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tree-view-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tree-view-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tree-view-machine.tsx"), [
      "import * as treeView from '@zag-js/tree-view';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import { collection } from '@zag-js/collection';",
      "",
      "const tree = collection({ rootNode: { value: 'root', children: [{ value: 'docs', children: [{ value: 'intro' }] }, { value: 'api' }] } });",
      "",
      "export function ZagTreeViewMachineFixture() {",
      "  const service = useMachine(treeView.machine, {",
      "    id: 'repository-tree',",
      "    collection: tree,",
      "    selectionMode: 'multiple',",
      "    defaultExpandedValue: ['docs'],",
      "    expandedValue: ['docs'],",
      "    defaultSelectedValue: ['intro'],",
      "    selectedValue: ['intro'],",
      "    defaultCheckedValue: ['api'],",
      "    checkedValue: ['api'],",
      "    defaultFocusedValue: 'docs',",
      "    focusedValue: 'docs',",
      "    expandOnClick: true,",
      "    typeahead: true,",
      "    ids: { root: 'tree-root', tree: 'tree-list', label: 'tree-label', node: (value) => `tree-node-${value}` },",
      "    translations: { treeLabel: 'Repository tree', renameInputLabel: 'Rename tree item' },",
      "    loadChildren: async ({ signal }) => signal.aborted ? [] : [{ value: 'loaded-child' }],",
      "    scrollToIndexFn: console.info,",
      "    canRename: () => true,",
      "    onExpandedChange(details) { console.info(details.expandedValue, details.focusedValue, details.expandedNodes); },",
      "    onSelectionChange(details) { console.info(details.selectedValue, details.focusedValue, details.selectedNodes); },",
      "    onFocusChange(details) { console.info(details.focusedValue, details.focusedNode); },",
      "    onCheckedChange(details) { console.info(details.checkedValue); },",
      "    onLoadChildrenComplete(details) { console.info(details.collection); },",
      "    onLoadChildrenError(details) { console.error(details.nodes); },",
      "    onRenameStart(details) { console.warn(details.value, details.node, details.indexPath); },",
      "    onBeforeRename(details) { return details.label.trim().length > 0; },",
      "    onRenameComplete(details) { console.info(details.value, details.label, details.indexPath); }",
      "  });",
      "  const api = treeView.connect(service, normalizeProps);",
      "  const branch = { node: tree.findNode('docs')!, indexPath: [0] };",
      "  const item = { node: tree.findNode('intro')!, indexPath: [0, 0] };",
      "  api.expandedValue; api.selectedValue; api.checkedValue; api.getCheckedMap(); api.getVisibleNodes(); api.getNodeState(item);",
      "  api.toggleChecked('docs', true); api.setChecked(['api']); api.clearChecked();",
      "  api.expand(['docs']); api.collapse(['docs']); api.select(['intro']); api.deselect(['api']); api.focus('docs'); api.selectParent('intro'); api.expandParent('intro');",
      "  api.setExpandedValue(['docs']); api.setSelectedValue(['intro']); api.startRenaming('intro'); api.submitRenaming('intro', 'Introduction'); api.cancelRenaming();",
      "  const machineEvidence = 'createMachine TreeViewSchema selectionMode single collection.empty typeahead true expandOnClick true defaultExpandedValue defaultSelectedValue translations treeLabel renameInputLabel idle renaming EXPANDED.SET EXPANDED.CLEAR EXPANDED.ALL BRANCH.EXPAND BRANCH.COLLAPSE SELECTED.SET SELECTED.ALL SELECTED.CLEAR NODE.SELECT NODE.DESELECT CHECKED.TOGGLE CHECKED.SET CHECKED.CLEAR NODE.FOCUS NODE.ARROW_DOWN NODE.ARROW_UP NODE.ARROW_LEFT BRANCH_NODE.ARROW_LEFT BRANCH_NODE.ARROW_RIGHT SIBLINGS.EXPAND NODE.HOME NODE.END NODE.CLICK BRANCH_NODE.CLICK BRANCH_TOGGLE.CLICK TREE.TYPEAHEAD NODE.RENAME RENAME.SUBMIT RENAME.CANCEL clearPendingAborts';",
      "  const contextEvidence = 'expandedValue selectedValue focusedValue loadingStatus checkedValue renamingValue typeaheadState pendingAborts bindable defaultFocusedValue defaultCheckedValue onExpandedChange onSelectionChange onFocusChange onCheckedChange';",
      "  const computedEvidence = 'isMultipleSelection isTypingAhead visibleNodes getByTypeahead keysSoFar collection.visit skipFn onEnter';",
      "  const actionEvidence = 'selectNode deselectNode setFocusedNode clearFocusedNode clearSelectedItem toggleBranchNode expandBranch expandBranches collapseBranch collapseBranches setExpanded clearExpanded setSelected clearSelected focusTreeFirstNode focusTreeLastNode focusBranchFirstNode focusTreeNextNode focusTreePrevNode focusBranchNode selectAllNodes focusMatchedNode toggleNodeSelection expandAllBranches expandSiblingBranches extendSelectionToNode extendSelectionToNextNode extendSelectionToPrevNode extendSelectionToFirstNode extendSelectionToLastNode clearPendingAborts toggleChecked setChecked clearChecked setRenamingValue submitRenaming cancelRenaming syncRenameInput focusRenameInput scrollToNode raf setElementValue';",
      "  const guardEvidence = 'isBranchFocused isBranchExpanded isShiftKey isCtrlKey hasSelectedItems isMultipleSelection moveFocus expandOnClick isRenameLabelValid skipFn';",
      "  const asyncEvidence = 'loadChildren loadingStatus loaded pendingAborts AbortController Promise.allSettled onLoadChildrenComplete onLoadChildrenError collection.replace valuePath indexPath NodeWithError';",
      "  const domEvidence = 'getRootId getLabelId getNodeId getTreeId getTreeEl focusNode getRenameInputId getRenameInputEl data-ownedby data-path data-value data-depth data-state data-loading data-renaming data-checked data-indeterminate';",
      "  const apiEvidence = 'collection expandedValue selectedValue checkedValue toggleChecked setChecked clearChecked getCheckedMap expand collapse select deselect getVisibleNodes focus selectParent expandParent setExpandedValue setSelectedValue startRenaming submitRenaming cancelRenaming getRootProps getLabelProps getTreeProps getNodeState getItemProps getItemTextProps getItemIndicatorProps getBranchProps getBranchIndicatorProps getBranchTriggerProps getBranchControlProps getBranchContentProps getBranchTextProps getBranchIndentGuideProps getNodeCheckboxProps getNodeRenameInputProps role tree treeitem group checkbox aria-label aria-labelledby aria-multiselectable aria-selected aria-expanded aria-level aria-busy aria-checked';",
      "  const packageEvidence = '@zag-js/tree-view @zag-js/react @zag-js/anatomy @zag-js/collection @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <div {...api.getRootProps()} data-machine-evidence={machineEvidence} data-context-evidence={contextEvidence}>",
      "      <span {...api.getLabelProps()} data-computed-evidence={computedEvidence}>Repository tree</span>",
      "      <div {...api.getTreeProps()} data-action-evidence={actionEvidence} data-guard-evidence={guardEvidence}>",
      "        <div {...api.getBranchProps(branch)} data-async-evidence={asyncEvidence}>",
      "          <button {...api.getBranchControlProps(branch)} data-dom-evidence={domEvidence}>",
      "            <span {...api.getBranchIndicatorProps(branch)}>open</span>",
      "            <span {...api.getBranchTextProps(branch)}>docs</span>",
      "            <button {...api.getBranchTriggerProps(branch)}>Toggle branch</button>",
      "            <span {...api.getBranchIndentGuideProps(branch)} />",
      "            <span {...api.getNodeCheckboxProps(branch)} />",
      "            <input {...api.getNodeRenameInputProps(branch)} />",
      "          </button>",
      "          <div {...api.getBranchContentProps(branch)}>",
      "            <a {...api.getItemProps(item)} data-api-evidence={apiEvidence} data-package-evidence={packageEvidence}><span {...api.getItemIndicatorProps(item)} /> <span {...api.getItemTextProps(item)}>intro</span></a>",
      "          </div>",
      "        </div>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/tree-view": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/collection": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tree-view-readiness-report.json"), "utf8")) as {
      treeViewSetups: Array<{ filePath: string; framework: string; rootCount: number; treeCount: number; branchCount: number; itemCount: number; controlCount: number; checkboxCount: number; renameCount: number; selectionCount: number; expansionCount: number; loadingCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      asyncSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.treeViewSetups.some((item) => item.filePath === "src/zag-tree-view-machine.tsx" && item.framework === "zag-tree-view" && item.rootCount > 0 && item.treeCount > 0 && item.branchCount > 0 && item.itemCount > 0 && item.controlCount > 0 && item.checkboxCount > 0 && item.renameCount > 0 && item.selectionCount > 0 && item.expansionCount > 0 && item.loadingCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-tree-view"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-selection-mode", "default-collection", "default-typeahead", "default-expand-on-click", "default-expanded-value", "default-selected-value", "translation-defaults", "idle-state", "renaming-state", "expanded-set-event", "expanded-clear-event", "expanded-all-event", "branch-expand-event", "branch-collapse-event", "selected-set-event", "selected-all-event", "selected-clear-event", "node-select-event", "node-deselect-event", "checked-toggle-event", "checked-set-event", "checked-clear-event", "node-focus-event", "keyboard-navigation-events", "branch-node-events", "branch-toggle-click-event", "tree-typeahead-event", "node-rename-event", "rename-submit-event", "rename-cancel-event", "clear-pending-aborts-exit"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["expanded-value", "selected-value", "focused-value", "loading-status", "checked-value", "renaming-value", "typeahead-state", "pending-aborts"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-multiple-selection", "is-typing-ahead", "visible-nodes"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["select-node", "deselect-node", "set-focused-node", "toggle-branch-node", "expand-branch", "expand-branches", "collapse-branch", "collapse-branches", "set-expanded", "clear-expanded", "set-selected", "clear-selected", "focus-tree-first-node", "focus-tree-last-node", "focus-branch-first-node", "focus-tree-next-node", "focus-tree-prev-node", "focus-branch-node", "select-all-nodes", "focus-matched-node", "toggle-node-selection", "expand-all-branches", "expand-sibling-branches", "extend-selection-to-node", "extend-selection-to-next-node", "extend-selection-to-prev-node", "extend-selection-to-first-node", "extend-selection-to-last-node", "clear-pending-aborts", "toggle-checked", "set-checked", "clear-checked", "set-renaming-value", "submit-renaming", "cancel-renaming", "sync-rename-input", "focus-rename-input", "scroll-to-node"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["is-branch-focused", "is-branch-expanded", "is-shift-key", "is-ctrl-key", "has-selected-items", "is-multiple-selection", "move-focus", "expand-on-click", "is-rename-label-valid", "skip-collapsed-branch"]));
    expect(readySignals(report.asyncSignals)).toEqual(expect.arrayContaining(["load-children", "loading-status", "loaded-status", "pending-aborts", "abort-controller", "promise-all-settled", "load-complete-callback", "load-error-callback", "collection-replace"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "label-id", "node-id", "tree-id", "tree-el", "focus-node", "rename-input-id", "rename-input-el", "ownedby-data", "path-data", "value-data", "depth-data", "state-data", "loading-data", "renaming-data", "checked-data", "indeterminate-data"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["collection", "expanded-value", "selected-value", "checked-value", "toggle-checked", "set-checked", "clear-checked", "checked-map", "expand", "collapse", "select", "deselect", "visible-nodes", "focus", "select-parent", "expand-parent", "set-expanded-value", "set-selected-value", "start-renaming", "submit-renaming", "cancel-renaming", "root-props", "label-props", "tree-props", "node-state", "item-props", "item-text-props", "item-indicator-props", "branch-props", "branch-indicator-props", "branch-trigger-props", "branch-control-props", "branch-content-props", "branch-text-props", "branch-indent-guide-props", "node-checkbox-props", "node-rename-input-props"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tree-view", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const treeViewMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tree-view-readiness.md"), "utf8");
    expect(treeViewMarkdown).toContain("Machine Signals");
    expect(treeViewMarkdown).toContain("@zag-js/tree-view");
    const treeViewHtml = await fs.readFile(path.join(result.session.outputPaths.html, "tree-view-readiness.html"), "utf8");
    expect(treeViewHtml).toContain("Machine Signals");
    expect(treeViewHtml).toContain("@zag-js/tree-view");
  });

  it("detects collapsible readiness without toggling real DOM visibility", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-collapsible-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-collapsible-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-collapsible.tsx"), [
      "import * as collapsible from '@zag-js/collapsible';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function DisclosurePanel() {",
      "  const service = useMachine(collapsible.machine, {",
      "    id: 'release-notes',",
      "    open: true,",
      "    defaultOpen: false,",
      "    disabled: false,",
      "    collapsedHeight: '48px',",
      "    collapsedWidth: '320px',",
      "    ids: { root: 'release-notes-root', trigger: 'release-notes-trigger', content: 'release-notes-content' },",
      "    onOpenChange: console.info,",
      "    onExitComplete: console.warn",
      "  });",
      "  const api = collapsible.connect(service, normalizeProps);",
      "  api.disabled; api.visible; api.open; api.measureSize(); api.setOpen(true); api.setOpen(false);",
      "  const evidence = 'open closed closing visible disabled controlled.open controlled.close defaultOpen size.measure animation.end trackEnterAnimation trackExitAnimation trackTabbableElements setInitial clearInitial cleanupNode measureSize computeSize invokeOnOpen invokeOnClose invokeOnExitComplete toggleVisibility data-collapsible data-state data-disabled data-has-collapsed-size hidden --height --width --collapsed-height --collapsed-width overflow minHeight maxHeight inert observe childList aria-controls aria-expanded button type';",
      "  return (",
      "    <section {...api.getRootProps()} data-collapsible-root data-evidence={evidence}>",
      "      <button {...api.getTriggerProps()}>Toggle details</button>",
      "      <span {...api.getIndicatorProps()}>open</span>",
      "      <div {...api.getContentProps()}>Release details</div>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-collapsible.tsx"), [
      "export function NativeCollapsible() {",
      "  const state = 'open closed closing visible disabled controlled-open controlled-close default-open measure-size collapsed-height collapsed-width css-vars hidden overflow enter-animation exit-animation animation-end exit-complete initial-state cleanup tabbables inert observe-children restore-inert disabled-trigger';",
      "  return (",
      "    <section data-collapsible-root data-state='closed' data-disabled='false'>",
      "      <button type='button' aria-controls='faq-panel' aria-expanded='false' data-state='closed' data-disabled='false'>Toggle details</button>",
      "      <span data-part='indicator' aria-hidden='true'>closed</span>",
      "      <div id='faq-panel' data-collapsible data-state='closed' data-disabled='false' data-has-collapsed-size hidden style={{ '--height': '220px', '--width': '600px', '--collapsed-height': '48px', '--collapsed-width': '320px', overflow: 'hidden' }}>",
      "        <a inert=''>Focusable child</a>",
      "      </div>",
      "      <p>{state} aria-test click-test animation-test size-test collapsible-traces upload-artifact</p>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "collapsible.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "import { NativeCollapsible } from '../src/native-collapsible';",
      "",
      "describe('collapsible readiness', () => {",
      "  it('covers click, aria, animation, and size traces', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });",
      "    render(<NativeCollapsible />);",
      "    const button = screen.getByRole('button', { name: /toggle details/i });",
      "    expect(button).toHaveAttribute('aria-controls', 'faq-panel');",
      "    expect(button).toHaveAttribute('aria-expanded', 'false');",
      "    await user.click(button);",
      "    vi.advanceTimersByTime(250);",
      "    expect('click-test aria-test animation-test size-test collapsible-traces upload-artifact').toContain('animation-test');",
      "    vi.useRealTimers();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "collapsible.yml"), [
      "name: collapsible-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- collapsible",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: collapsible-traces",
      "          path: test-results/collapsible"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@radix-ui/react-collapsible": "latest",
        "@zag-js/collapsible": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "collapsible-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      collapsibleSetups: Array<{ filePath: string; framework: string; rootCount: number; triggerCount: number; contentCount: number; indicatorCount: number; stateCount: number; sizeCount: number; animationCount: number; tabbableCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      sizeSignals: Array<{ signal: string; readiness: string }>;
      animationSignals: Array<{ signal: string; readiness: string }>;
      focusSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Collapsible readiness Zag collapsible open closed closing collapsed size animation inert aria tests");
    expect(report.collapsibleSetups.some((item) => item.filePath === "src/zag-collapsible.tsx" && item.framework === "zag-collapsible" && item.rootCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.indicatorCount > 0 && item.stateCount > 0 && item.sizeCount > 0 && item.animationCount > 0 && item.tabbableCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.collapsibleSetups.some((item) => item.filePath === "src/native-collapsible.tsx" && item.framework === "native-disclosure" && item.rootCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.indicatorCount > 0 && item.stateCount > 0 && item.sizeCount > 0 && item.animationCount > 0 && item.tabbableCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-collapsible", "radix-collapsible", "native-disclosure", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "trigger", "content", "indicator"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open", "closed", "closing", "visible", "disabled", "controlled-open", "default-open"]));
    expect(readySignals(report.sizeSignals)).toEqual(expect.arrayContaining(["measure-size", "collapsed-height", "collapsed-width", "css-vars", "hidden", "overflow"]));
    expect(readySignals(report.animationSignals)).toEqual(expect.arrayContaining(["enter-animation", "exit-animation", "animation-end", "exit-complete", "initial-state", "cleanup"]));
    expect(readySignals(report.focusSignals)).toEqual(expect.arrayContaining(["tabbables", "inert", "observe-children", "restore-inert", "disabled-trigger"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-expanded", "aria-controls", "data-state", "data-disabled", "button-type", "hidden"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "aria-test", "animation-test", "size-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/collapsible", "@radix-ui/react-collapsible", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/collapsible"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records collapsible readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "collapsible-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "collapsible-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "collapsible-readiness.html"))).resolves.toBeUndefined();
    const collapsibleMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "collapsible-readiness.md"), "utf8");
    expect(collapsibleMarkdown).toContain("Collapsible Readiness");
    expect(collapsibleMarkdown).toContain("@zag-js/collapsible");
    const collapsibleHtml = await fs.readFile(path.join(result.session.outputPaths.html, "collapsible-readiness.html"), "utf8");
    expect(collapsibleHtml).toContain("collapsible-readiness-card");
    expect(collapsibleHtml).toContain("data-source-pattern=\"Collapsible\"");
    expect(collapsibleHtml).toContain("RepoTutor records collapsible readiness only");
  });

  it("detects Zag collapsible machine readiness without toggling real DOM visibility", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-collapsible-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-collapsible-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-collapsible-machine.tsx"), [
      "import * as collapsible from '@zag-js/collapsible';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagCollapsibleMachineFixture() {",
      "  const service = useMachine(collapsible.machine, {",
      "    id: 'release-notes',",
      "    open: true,",
      "    defaultOpen: false,",
      "    disabled: false,",
      "    collapsedHeight: '48px',",
      "    collapsedWidth: '320px',",
      "    ids: { root: 'release-notes-root', trigger: 'release-notes-trigger', content: 'release-notes-content' },",
      "    onOpenChange(details) { console.info(details.open); },",
      "    onExitComplete() { console.warn('exit complete'); }",
      "  });",
      "  const api = collapsible.connect(service, normalizeProps);",
      "  api.disabled; api.visible; api.open; api.measureSize(); api.setOpen(true); api.setOpen(false);",
      "  const machineEvidence = 'createMachine CollapsibleSchema initialState open closed closing controlled.open controlled.close open close size.measure animation.end exit cleanupNode watch track prop open setInitial computeSize toggleVisibility';",
      "  const contextEvidence = 'size bindable defaultValue height width initial bindable cleanup stylesRef refs';",
      "  const effectEvidence = 'trackEnterAnimation trackExitAnimation trackTabbableElements getComputedStyle animationName animationend addEventListener removeEventListener raf nextTick getTabbables setAttribute inert observeChildren setStyle animationFillMode forwards';",
      "  const actionEvidence = 'setInitial clearInitial cleanupNode measureSize computeSize invokeOnOpen invokeOnClose invokeOnExitComplete toggleVisibility getBoundingClientRect onOpenChange onExitComplete';",
      "  const guardEvidence = 'isOpenControlled prop open controlled open';",
      "  const domEvidence = 'getRootId getContentId getTriggerId getRootEl getContentEl getTriggerEl';",
      "  const apiEvidence = 'disabled visible open measureSize setOpen getRootProps getContentProps getTriggerProps getIndicatorProps data-state data-collapsible data-disabled data-has-collapsed-size hidden --height --width --collapsed-height --collapsed-width overflow minHeight maxHeight minWidth maxWidth aria-controls aria-expanded button type onClick dir prop';",
      "  const packageEvidence = '@zag-js/collapsible @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <section {...api.getRootProps()} data-machine-evidence={machineEvidence} data-context-evidence={contextEvidence}>",
      "      <button {...api.getTriggerProps()} data-guard-evidence={guardEvidence}>Toggle details</button>",
      "      <span {...api.getIndicatorProps()} data-dom-evidence={domEvidence}>open</span>",
      "      <div {...api.getContentProps()} data-effect-evidence={effectEvidence} data-action-evidence={actionEvidence} data-api-evidence={apiEvidence} data-package-evidence={packageEvidence}>Release details</div>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/collapsible": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "collapsible-readiness-report.json"), "utf8")) as {
      collapsibleSetups: Array<{ filePath: string; framework: string; rootCount: number; triggerCount: number; contentCount: number; indicatorCount: number; stateCount: number; sizeCount: number; animationCount: number; tabbableCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.collapsibleSetups.some((item) => item.filePath === "src/zag-collapsible-machine.tsx" && item.framework === "zag-collapsible" && item.rootCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.indicatorCount > 0 && item.stateCount > 0 && item.sizeCount > 0 && item.animationCount > 0 && item.tabbableCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-collapsible"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "initial-open", "initial-closed", "open-state", "closed-state", "closing-state", "controlled-open-event", "controlled-close-event", "open-event", "close-event", "size-measure-event", "animation-end-event", "watch-open", "exit-cleanup"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["size-context", "initial-context", "cleanup-ref", "styles-ref"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-enter-animation", "track-exit-animation", "track-tabbable-elements", "computed-style", "animationend-listener", "raf", "next-tick", "tabbables", "set-inert", "observe-children", "set-style"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-initial", "clear-initial", "cleanup-node", "measure-size", "compute-size", "invoke-on-open", "invoke-on-close", "invoke-on-exit-complete", "toggle-visibility"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["is-open-controlled"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "content-id", "trigger-id", "root-el", "content-el", "trigger-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["disabled", "visible", "open", "measure-size", "set-open", "root-props", "content-props", "trigger-props", "indicator-props", "collapsed-size", "hidden-content", "css-vars", "aria-expanded", "aria-controls", "data-state", "data-disabled", "data-has-collapsed-size", "trigger-click-handler", "button-type", "dir-prop"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/collapsible", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const collapsibleMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "collapsible-readiness.md"), "utf8");
    expect(collapsibleMarkdown).toContain("Machine Signals");
    expect(collapsibleMarkdown).toContain("@zag-js/collapsible");
    const collapsibleHtml = await fs.readFile(path.join(result.session.outputPaths.html, "collapsible-readiness.html"), "utf8");
    expect(collapsibleHtml).toContain("Machine Signals");
    expect(collapsibleHtml).toContain("@zag-js/collapsible");
  });

  it("detects editable readiness without entering real edit mode", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-editable-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-editable-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-editable.tsx"), [
      "import * as editable from '@zag-js/editable';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function InlineTitleEditor() {",
      "  const service = useMachine(editable.machine, {",
      "    id: 'title-editor',",
      "    value: 'Roadmap',",
      "    defaultValue: 'Draft',",
      "    edit: true,",
      "    defaultEdit: false,",
      "    activationMode: 'dblclick',",
      "    submitMode: 'both',",
      "    selectOnFocus: true,",
      "    autoResize: true,",
      "    maxLength: 80,",
      "    name: 'title',",
      "    form: 'roadmap-form',",
      "    invalid: false,",
      "    required: true,",
      "    readOnly: false,",
      "    disabled: false,",
      "    placeholder: { edit: 'Edit title', preview: 'Untitled' },",
      "    translations: { input: 'editable input', edit: 'edit', submit: 'submit', cancel: 'cancel' },",
      "    finalFocusEl: () => document.querySelector('#after-edit'),",
      "    onEditChange: console.info,",
      "    onValueChange: console.info,",
      "    onValueCommit: console.warn,",
      "    onValueRevert: console.error,",
      "    onFocusOutside: console.info,",
      "    onPointerDownOutside: console.warn,",
      "    onInteractOutside: console.error",
      "  });",
      "  const api = editable.connect(service, normalizeProps);",
      "  api.editing; api.empty; api.value; api.valueText; api.setValue('Next'); api.clearValue(); api.edit(); api.cancel(); api.submit();",
      "  const evidence = 'preview edit editing empty value previousValue VALUE.SET CONTROLLED.EDIT CONTROLLED.PREVIEW EDIT CANCEL SUBMIT input.change keydown.enter Escape submitOnEnter submitOnBlur activationMode focus click dblclick submitMode enter blur both none trackInteractOutside onFocusOutside onPointerDownOutside onInteractOutside finalFocusEl restoreFocus selectOnFocus syncInputValue setElementValue maxLength placeholder autoResize data-focus data-disabled data-readonly data-invalid data-placeholder-shown data-autoresize aria-label aria-invalid aria-readonly aria-disabled required name form getRootProps getAreaProps getLabelProps getInputProps getPreviewProps getEditTriggerProps getControlProps getSubmitTriggerProps getCancelTriggerProps';",
      "  return (",
      "    <section {...api.getRootProps()} data-editable-root data-evidence={evidence}>",
      "      <div {...api.getAreaProps()}>",
      "        <label {...api.getLabelProps()}>Title</label>",
      "        <span {...api.getPreviewProps()} />",
      "        <input {...api.getInputProps()} />",
      "      </div>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getEditTriggerProps()}>Edit</button>",
      "        <button {...api.getSubmitTriggerProps()}>Save</button>",
      "        <button {...api.getCancelTriggerProps()}>Cancel</button>",
      "      </div>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-editable.tsx"), [
      "export function NativeEditable() {",
      "  const traces = 'preview edit editing empty value previous-value controlled-edit default-edit disabled read-only set-value clear-value value-change value-commit value-revert max-length placeholder auto-resize activation-focus activation-click activation-dblclick submit-enter submit-blur cancel-escape interact-outside final-focus select-on-focus aria-label aria-invalid aria-readonly aria-disabled data-focus data-disabled data-readonly data-invalid required form-name';",
      "  return (",
      "    <section data-editable-root>",
      "      <div data-part='area' data-focus data-disabled='false' data-placeholder-shown='false'>",
      "        <label htmlFor='title-input' data-invalid='false' data-required='true'>Title</label>",
      "        <span id='title-preview' role='textbox' aria-readonly='false' aria-disabled='false' data-part='preview' tabIndex={0} contentEditable suppressContentEditableWarning>Roadmap</span>",
      "        <input id='title-input' aria-label='editable input' aria-invalid='false' data-readonly='false' data-invalid='false' data-autoresize='true' name='title' form='roadmap-form' required maxLength={80} defaultValue='Roadmap' />",
      "      </div>",
      "      <div data-part='control'>",
      "        <button type='button' aria-label='edit'>Edit</button>",
      "        <button type='button' aria-label='submit'>Save</button>",
      "        <button type='button' aria-label='cancel'>Cancel</button>",
      "      </div>",
      "      <p>{traces} click-test keyboard-test blur-test commit-test cancel-test editable-traces upload-artifact</p>",
      "    </section>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "editable.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeEditable } from '../src/native-editable';",
      "",
      "describe('editable readiness', () => {",
      "  it('covers edit, commit, cancel, blur, and keyboard traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativeEditable />);",
      "    expect(screen.getByLabelText('editable input')).toHaveAttribute('name', 'title');",
      "    await user.click(screen.getByRole('button', { name: /edit/i }));",
      "    await user.keyboard('{Enter}{Escape}');",
      "    await user.tab();",
      "    expect('click-test keyboard-test blur-test commit-test cancel-test editable-traces upload-artifact').toContain('commit-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "editable.yml"), [
      "name: editable-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- editable",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: editable-traces",
      "          path: test-results/editable"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/editable": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "editable-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      editableSetups: Array<{ filePath: string; framework: string; rootCount: number; areaCount: number; labelCount: number; previewCount: number; inputCount: number; triggerCount: number; valueCount: number; interactionCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Editable readiness Zag editable preview edit value commit cancel focus outside keyboard accessibility tests");
    expect(report.editableSetups.some((item) => item.filePath === "src/zag-editable.tsx" && item.framework === "zag-editable" && item.rootCount > 0 && item.areaCount > 0 && item.labelCount > 0 && item.previewCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.valueCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.editableSetups.some((item) => item.filePath === "src/native-editable.tsx" && item.framework === "native-contenteditable" && item.rootCount > 0 && item.areaCount > 0 && item.labelCount > 0 && item.previewCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.valueCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-editable", "native-contenteditable", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "area", "label", "preview", "input", "edit-trigger", "submit-trigger", "cancel-trigger", "control"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["edit", "preview", "editing", "empty", "value", "previous-value", "controlled-edit", "default-edit", "disabled", "read-only"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["set-value", "clear-value", "value-change", "value-commit", "value-revert", "max-length", "placeholder", "auto-resize"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["activation-focus", "activation-click", "activation-dblclick", "submit-enter", "submit-blur", "cancel-escape", "interact-outside", "final-focus", "select-on-focus"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "aria-invalid", "aria-readonly", "aria-disabled", "data-focus", "data-disabled", "data-readonly", "data-invalid", "required", "form-name"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "blur-test", "commit-test", "cancel-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/editable", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/editable"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records editable readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "editable-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "editable-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "editable-readiness.html"))).resolves.toBeUndefined();
    const editableMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "editable-readiness.md"), "utf8");
    expect(editableMarkdown).toContain("Editable Readiness");
    expect(editableMarkdown).toContain("@zag-js/editable");
    const editableHtml = await fs.readFile(path.join(result.session.outputPaths.html, "editable-readiness.html"), "utf8");
    expect(editableHtml).toContain("editable-readiness-card");
    expect(editableHtml).toContain("data-source-pattern=\"Editable\"");
    expect(editableHtml).toContain("RepoTutor records editable readiness only");
  });

  it("detects Zag editable machine readiness without entering real edit mode", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-editable-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-editable-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-editable-machine.tsx"), [
      "import * as editable from '@zag-js/editable';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagEditableMachinePreview() {",
      "  const service = useMachine(editable.machine, {",
      "    id: 'editable-machine',",
      "    edit: false,",
      "    defaultEdit: true,",
      "    value: 'Roadmap',",
      "    defaultValue: 'Draft',",
      "    activationMode: 'focus',",
      "    submitMode: 'both',",
      "    selectOnFocus: true,",
      "    autoResize: true,",
      "    maxLength: 120,",
      "    name: 'title',",
      "    form: 'roadmap-form',",
      "    invalid: false,",
      "    required: true,",
      "    readOnly: false,",
      "    disabled: false,",
      "    placeholder: { edit: 'Edit title', preview: 'Untitled' },",
      "    translations: { input: 'editable input', edit: 'edit', submit: 'submit', cancel: 'cancel' },",
      "    finalFocusEl: () => document.querySelector('#after-edit'),",
      "    onEditChange: console.info,",
      "    onValueChange: console.info,",
      "    onValueCommit: console.warn,",
      "    onValueRevert: console.error,",
      "    onFocusOutside: console.info,",
      "    onPointerDownOutside: console.warn,",
      "    onInteractOutside: console.error",
      "  });",
      "  const api = editable.connect(service, normalizeProps);",
      "  api.editing; api.empty; api.value; api.valueText; api.setValue('Next'); api.clearValue(); api.edit(); api.cancel(); api.submit();",
      "  api.getRootProps(); api.getAreaProps(); api.getLabelProps(); api.getInputProps(); api.getPreviewProps(); api.getEditTriggerProps(); api.getControlProps(); api.getSubmitTriggerProps(); api.getCancelTriggerProps();",
      "  const machineEvidence = 'createMachine EditableSchema props activationMode focus submitMode both defaultValue selectOnFocus translations initialState edit defaultEdit preview entry focusInputIfNeeded states preview edit CONTROLLED.EDIT CONTROLLED.PREVIEW EDIT CANCEL SUBMIT VALUE.SET watch track value syncInputValue toggleEditing';",
      "  const contextEvidence = 'value bindable defaultValue prop value onChange onValueChange previousValue bindable defaultValue empty string';",
      "  const computedEvidence = 'submitOnEnter submitOnBlur isInteractive disabled readOnly submitMode enter blur both none';",
      "  const effectEvidence = 'trackInteractOutside exclude onFocusOutside onPointerDownOutside onInteractOutside defaultPrevented focusable contains getCancelTriggerEl getSubmitTriggerEl interact-outside submitOnBlur';",
      "  const actionEvidence = 'restoreFocus clearValue focusInputIfNeeded focusInput invokeOnCancel invokeOnSubmit invokeOnEdit invokeOnPreview toggleEditing syncInputValue setElementValue setValue setPreviousValue revertValue blurInput raf selectOnFocus finalFocusEl';",
      "  const guardEvidence = 'isEditControlled isSubmitEvent previousEvent SUBMIT';",
      "  const domEvidence = 'getRootId getAreaId getLabelId getPreviewId getInputId getControlId getSubmitTriggerId getCancelTriggerId getEditTriggerId getInputEl getPreviewEl getSubmitTriggerEl getCancelTriggerEl getEditTriggerEl';",
      "  const apiEvidence = 'editing empty value valueText setValue clearValue edit cancel submit getRootProps getAreaProps getLabelProps getInputProps getPreviewProps getEditTriggerProps getControlProps getSubmitTriggerProps getCancelTriggerProps hidden editing autoResize inline-grid aria-label aria-invalid aria-readonly aria-disabled data-autoresize name form button type';",
      "  const packageEvidence = '@zag-js/editable @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/interact-outside @zag-js/types @zag-js/utils react';",
      "  return <section data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, guardEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')} {...api.getRootProps()} />;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/editable": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/interact-outside": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "editable-readiness-report.json"), "utf8")) as {
      editableSetups: Array<{ filePath: string; framework: string; rootCount: number; areaCount: number; labelCount: number; previewCount: number; inputCount: number; triggerCount: number; valueCount: number; interactionCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.editableSetups.some((item) => item.filePath === "src/zag-editable-machine.tsx" && item.framework === "zag-editable" && item.rootCount > 0 && item.areaCount > 0 && item.labelCount > 0 && item.previewCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.valueCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-editable"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "initial-edit", "initial-preview", "edit-state", "preview-state", "controlled-edit-event", "controlled-preview-event", "edit-event", "cancel-event", "submit-event", "value-set-event", "watch-value", "watch-edit", "entry-focus-input"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["value-context", "previous-value-context"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["submit-on-enter", "submit-on-blur", "is-interactive"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-interact-outside", "focus-outside", "pointer-down-outside", "interact-outside", "exclude-triggers", "contains", "submit-on-blur-routing"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["restore-focus", "clear-value", "focus-input-if-needed", "focus-input", "invoke-on-cancel", "invoke-on-submit", "invoke-on-edit", "invoke-on-preview", "toggle-editing", "sync-input-value", "set-element-value", "set-value", "set-previous-value", "revert-value", "blur-input"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["is-edit-controlled", "is-submit-event"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "area-id", "label-id", "preview-id", "input-id", "control-id", "submit-trigger-id", "cancel-trigger-id", "edit-trigger-id", "input-el", "preview-el", "submit-trigger-el", "cancel-trigger-el", "edit-trigger-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["editing", "empty", "value", "value-text", "set-value", "clear-value", "edit", "cancel", "submit", "root-props", "area-props", "label-props", "input-props", "preview-props", "edit-trigger-props", "control-props", "submit-trigger-props", "cancel-trigger-props", "hidden-edit", "auto-resize", "aria-label", "aria-invalid", "aria-readonly", "aria-disabled", "form-name", "button-type"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/editable", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/types", "@zag-js/utils", "react"]));
    const editableMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "editable-readiness.md"), "utf8");
    expect(editableMarkdown).toContain("Machine Signals");
    expect(editableMarkdown).toContain("@zag-js/editable");
    const editableHtml = await fs.readFile(path.join(result.session.outputPaths.html, "editable-readiness.html"), "utf8");
    expect(editableHtml).toContain("Machine Signals");
    expect(editableHtml).toContain("@zag-js/editable");
  });

  it("detects password input readiness without toggling real visibility", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-masked-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-masked-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-masked-field.tsx"), [
      "import * as passwordInput from '@zag-js/password-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function AccountPassword() {",
      "  const service = useMachine(passwordInput.machine, {",
      "    id: 'account-password',",
      "    visible: false,",
      "    defaultVisible: false,",
      "    autoComplete: 'current-password',",
      "    ignorePasswordManagers: true,",
      "    name: 'password',",
      "    required: true,",
      "    invalid: false,",
      "    readOnly: false,",
      "    disabled: false,",
      "    translations: { visibilityTrigger: (visible) => visible ? 'Hide password' : 'Show password' },",
      "    onVisibilityChange: console.info",
      "  });",
      "  const api = passwordInput.connect(service, normalizeProps);",
      "  api.visible; api.disabled; api.invalid; api.focus(); api.setVisible(true); api.toggleVisible();",
      "  const evidence = 'idle visible defaultVisible VISIBILITY.SET TRIGGER.CLICK toggleVisibility setVisibility focusInputEl trackFormEvents form reset submit type password text aria-controls aria-expanded aria-label data-state visible hidden data-disabled data-invalid data-readonly data-1p-ignore data-lpignore data-bwignore data-form-type data-protonpass-ignore autoComplete current-password new-password name required readOnly disabled invalid ignorePasswordManagers getRootProps getLabelProps getInputProps getVisibilityTriggerProps getIndicatorProps getControlProps';",
      "  return (",
      "    <form data-password-input-root onReset={() => api.setVisible(false)} onSubmit={() => api.setVisible(false)}>",
      "      <div {...api.getRootProps()} data-password-input-root data-evidence={evidence}>",
      "        <label {...api.getLabelProps()}>Password</label>",
      "        <div {...api.getControlProps()}>",
      "          <input {...api.getInputProps()} />",
      "          <button {...api.getVisibilityTriggerProps()} />",
      "          <span {...api.getIndicatorProps()} />",
      "        </div>",
      "      </div>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-masked-field.tsx"), [
      "export function NativePasswordInput() {",
      "  const traces = 'idle visible hidden default-visible set-visible toggle-visible visibility-change trigger-click focus-input form-reset form-submit password-manager-ignore aria-controls aria-expanded aria-label aria-invalid data-state data-disabled data-invalid data-readonly current-password new-password autoComplete required name disabled readOnly invalid';",
      "  return (",
      "    <form onReset={() => {}} onSubmit={() => {}}>",
      "      <section data-password-input-root>",
      "        <label htmlFor='password' data-disabled='false' data-invalid='false' data-readonly='false' data-required='true'>Password</label>",
      "        <div data-part='control' data-disabled='false' data-invalid='false' data-readonly='false'>",
      "          <input id='password' name='password' required type='password' autoComplete='current-password' aria-invalid='false' data-state='hidden' data-disabled='false' data-invalid='false' data-readonly='false' data-1p-ignore data-lpignore='true' data-bwignore='true' data-form-type='other' data-protonpass-ignore='true' />",
      "          <button type='button' aria-label='Show password' aria-controls='password' aria-expanded='false' data-state='hidden'>Show password</button>",
      "          <span aria-hidden='true' data-state='hidden'>Hidden</span>",
      "        </div>",
      "        <p>{traces} pointer-test reset-test submit-test visibility-test aria-test password-input-traces upload-artifact</p>",
      "      </section>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "masked-field.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativePasswordInput } from '../src/native-masked-field';",
      "",
      "describe('password input readiness', () => {",
      "  it('covers visibility trigger, reset, submit, and aria traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativePasswordInput />);",
      "    const input = screen.getByLabelText('Password');",
      "    expect(input).toHaveAttribute('type', 'password');",
      "    await user.click(screen.getByRole('button', { name: /show password/i }));",
      "    expect('pointer-test reset-test submit-test visibility-test aria-test password-input-traces upload-artifact').toContain('visibility-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "masked-field.yml"), [
      "name: password-input-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- password-input",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: password-input-traces",
      "          path: test-results/password-input"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/password-input": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "password-input-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      passwordInputSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; inputCount: number; triggerCount: number; indicatorCount: number; controlCount: number; visibilityCount: number; formCount: number; passwordManagerCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      visibilitySignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      passwordManagerSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Password input readiness Zag password-input visibility trigger form reset submit password manager accessibility tests");
    expect(report.passwordInputSetups.some((item) => item.filePath === "src/zag-masked-field.tsx" && item.framework === "zag-password-input" && item.rootCount > 0 && item.labelCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.controlCount > 0 && item.visibilityCount > 0 && item.formCount > 0 && item.passwordManagerCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.passwordInputSetups.some((item) => item.filePath === "src/native-masked-field.tsx" && item.framework === "native-password-input" && item.rootCount > 0 && item.labelCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.controlCount > 0 && item.visibilityCount > 0 && item.formCount > 0 && item.passwordManagerCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-password-input", "native-password-input", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "input", "visibility-trigger", "indicator", "control"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "visible", "hidden", "disabled", "invalid", "read-only", "required"]));
    expect(readySignals(report.visibilitySignals)).toEqual(expect.arrayContaining(["default-visible", "set-visible", "toggle-visible", "visibility-change", "trigger-click", "focus-input", "type-switch"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["form-reset", "form-submit", "name", "auto-complete", "required"]));
    expect(readySignals(report.passwordManagerSignals)).toEqual(expect.arrayContaining(["ignore-password-managers", "one-password", "lastpass", "bitwarden", "dashlane", "proton-pass"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "aria-controls", "aria-expanded", "aria-invalid", "aria-hidden", "data-state", "data-disabled", "data-invalid", "data-readonly"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "reset-test", "submit-test", "visibility-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/password-input", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/password-input"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records password input readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "password-input-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "password-input-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "password-input-readiness.html"))).resolves.toBeUndefined();
    const passwordInputMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "password-input-readiness.md"), "utf8");
    expect(passwordInputMarkdown).toContain("Password Input Readiness");
    expect(passwordInputMarkdown).toContain("@zag-js/password-input");
    const passwordInputHtml = await fs.readFile(path.join(result.session.outputPaths.html, "password-input-readiness.html"), "utf8");
    expect(passwordInputHtml).toContain("password-input-readiness-card");
    expect(passwordInputHtml).toContain("data-source-pattern=\"PasswordInput\"");
    expect(passwordInputHtml).toContain("RepoTutor records password input readiness only");
  });

  it("detects Zag password input machine readiness without toggling real visibility", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-masked-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-masked-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-masked-field.tsx"), [
      "import * as passwordInput from '@zag-js/password-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagPasswordInputMachinePreview() {",
      "  const service = useMachine(passwordInput.machine, {",
      "    id: 'account-password',",
      "    visible: false,",
      "    defaultVisible: false,",
      "    autoComplete: 'current-password',",
      "    ignorePasswordManagers: true,",
      "    name: 'password',",
      "    required: true,",
      "    invalid: false,",
      "    readOnly: false,",
      "    disabled: false,",
      "    translations: { visibilityTrigger: (visible) => visible ? 'Hide password' : 'Show password' },",
      "    onVisibilityChange: console.info",
      "  });",
      "  const api = passwordInput.connect(service, normalizeProps);",
      "  api.visible; api.disabled; api.invalid; api.focus(); api.setVisible(true); api.toggleVisible();",
      "  api.getRootProps(); api.getLabelProps(); api.getInputProps(); api.getVisibilityTriggerProps(); api.getIndicatorProps(); api.getControlProps();",
      "  const machineEvidence = 'createMachine PasswordInputSchema defaultVisible false autoComplete current-password ignorePasswordManagers false translations visibilityTrigger initialState idle states idle VISIBILITY.SET TRIGGER.CLICK effects trackFormEvents';",
      "  const contextEvidence = 'visible bindable value prop visible defaultValue prop defaultVisible onChange onVisibilityChange';",
      "  const effectEvidence = 'trackFormEvents getInputEl inputEl form getWin AbortController form.addEventListener reset submit defaultPrevented VISIBILITY.SET value false controller.abort';",
      "  const actionEvidence = 'setVisibility toggleVisibility focusInputEl context.set visible dom.getInputEl inputEl.focus';",
      "  const domEvidence = 'getRootId getInputId getInputEl p-input input';",
      "  const apiEvidence = 'visible disabled invalid readOnly required focus setVisible toggleVisible getRootProps getLabelProps getInputProps getVisibilityTriggerProps getIndicatorProps getControlProps type visible text password autoCapitalize off spellCheck false ignorePasswordManagers passwordManagerProps data-1p-ignore data-lpignore data-bwignore data-form-type data-protonpass-ignore aria-controls aria-expanded aria-label aria-invalid aria-hidden data-state data-disabled data-invalid data-readonly data-required button type tabIndex isLeftClick onPointerDown preventDefault interactive';",
      "  const packageEvidence = '@zag-js/password-input @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <form data-password-input-root onReset={() => api.setVisible(false)} onSubmit={() => api.setVisible(false)}>",
      "      <div {...api.getRootProps()} data-password-input-root data-evidence={[machineEvidence, contextEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}>",
      "        <label {...api.getLabelProps()}>Password</label>",
      "        <div {...api.getControlProps()}>",
      "          <input {...api.getInputProps()} />",
      "          <button {...api.getVisibilityTriggerProps()} />",
      "          <span {...api.getIndicatorProps()} />",
      "        </div>",
      "      </div>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-masked-field.tsx"), [
      "export function NativePasswordInput() {",
      "  const traces = 'idle visible hidden default-visible set-visible toggle-visible visibility-change trigger-click focus-input form-reset form-submit password-manager-ignore aria-controls aria-expanded aria-label aria-invalid data-state data-disabled data-invalid data-readonly current-password new-password autoComplete required name disabled readOnly invalid';",
      "  return (",
      "    <form onReset={() => {}} onSubmit={() => {}}>",
      "      <section data-password-input-root>",
      "        <label htmlFor='password' data-disabled='false' data-invalid='false' data-readonly='false' data-required='true'>Password</label>",
      "        <div data-part='control' data-disabled='false' data-invalid='false' data-readonly='false'>",
      "          <input id='password' name='password' required type='password' autoComplete='current-password' aria-invalid='false' data-state='hidden' data-disabled='false' data-invalid='false' data-readonly='false' data-1p-ignore data-lpignore='true' data-bwignore='true' data-form-type='other' data-protonpass-ignore='true' />",
      "          <button type='button' aria-label='Show password' aria-controls='password' aria-expanded='false' data-state='hidden'>Show password</button>",
      "          <span aria-hidden='true' data-state='hidden'>Hidden</span>",
      "        </div>",
      "        <p>{traces} pointer-test reset-test submit-test visibility-test aria-test password-input-traces upload-artifact</p>",
      "      </section>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "masked-field.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativePasswordInput } from '../src/native-masked-field';",
      "",
      "describe('password input readiness', () => {",
      "  it('covers visibility trigger, reset, submit, and aria traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativePasswordInput />);",
      "    const input = screen.getByLabelText('Password');",
      "    expect(input).toHaveAttribute('type', 'password');",
      "    await user.click(screen.getByRole('button', { name: /show password/i }));",
      "    expect('pointer-test reset-test submit-test visibility-test aria-test password-input-traces upload-artifact').toContain('visibility-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "masked-field.yml"), [
      "name: password-input-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- password-input",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: password-input-traces",
      "          path: test-results/password-input"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/password-input": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "password-input-readiness-report.json"), "utf8")) as {
      passwordInputSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; inputCount: number; triggerCount: number; indicatorCount: number; controlCount: number; visibilityCount: number; formCount: number; passwordManagerCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.passwordInputSetups.some((item) => item.filePath === "src/zag-masked-field.tsx" && item.framework === "zag-password-input" && item.rootCount > 0 && item.labelCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.indicatorCount > 0 && item.controlCount > 0 && item.visibilityCount > 0 && item.formCount > 0 && item.passwordManagerCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-password-input"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-visible", "default-autocomplete", "ignore-password-managers-default", "translations", "idle-state", "visibility-set-event", "trigger-click-event", "track-form-events-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["visible-context"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-form-events", "form-reset-listener", "form-submit-listener", "abort-controller", "reset-hides", "submit-hides"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-visibility", "toggle-visibility", "focus-input-el"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "input-id", "input-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["visible", "disabled", "invalid", "focus", "set-visible", "toggle-visible", "root-props", "label-props", "input-props", "visibility-trigger-props", "indicator-props", "control-props", "type-switch", "password-manager-props", "aria-controls", "aria-expanded", "aria-label", "aria-invalid", "aria-hidden", "data-state", "data-disabled", "data-invalid", "data-readonly", "button-type", "tab-index", "left-click", "read-only-api", "required-prop", "data-required", "auto-capitalize-off", "spell-check-false", "prevent-default", "interactive-guard"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/password-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const passwordInputMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "password-input-readiness.md"), "utf8");
    expect(passwordInputMarkdown).toContain("Machine Signals");
    expect(passwordInputMarkdown).toContain("@zag-js/password-input");
    const passwordInputHtml = await fs.readFile(path.join(result.session.outputPaths.html, "password-input-readiness.html"), "utf8");
    expect(passwordInputHtml).toContain("Machine Signals");
    expect(passwordInputHtml).toContain("@zag-js/password-input");
  });

  it("detects signature pad readiness without drawing real strokes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-signature-pad-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-signature-pad-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-signature-pad.tsx"), [
      "import * as signaturePad from '@zag-js/signature-pad';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function AgreementSignature() {",
      "  const service = useMachine(signaturePad.machine, {",
      "    id: 'agreement-signature',",
      "    name: 'agreementSignature',",
      "    required: true,",
      "    disabled: false,",
      "    readOnly: false,",
      "    defaultPaths: [],",
      "    drawing: { size: 3, thinning: 0.7, smoothing: 0.4, streamline: 0.6, simulatePressure: false, fill: '#111827' },",
      "    translations: { control: 'signature pad', clearTrigger: 'clear signature' },",
      "    onDraw: console.info,",
      "    onDrawEnd: console.info",
      "  });",
      "  const api = signaturePad.connect(service, normalizeProps);",
      "  api.empty; api.drawing; api.currentPath; api.paths; api.clear(); api.getDataUrl('image/png', 0.92); api.getDataUrl('image/jpeg', 0.8); api.getDataUrl('image/svg+xml');",
      "  const evidence = 'idle drawing empty isInteractive paths currentPoints currentPath POINTER_DOWN POINTER_MOVE POINTER_UP CLEAR addPoint endStroke clearPoints invokeOnDraw invokeOnDrawEnd focusCanvasEl getDataUrl image/png image/jpeg image/svg+xml quality perfect-freehand getStroke getSvgPathFromStroke pressure size thinning smoothing streamline simulatePressure defaultPaths onDraw onDrawEnd hidden input value name required readOnly disabled role application aria-roledescription aria-label aria-disabled data-disabled data-required tabIndex touchAction userSelect clear signature';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Agreement signature</label>",
      "      <div {...api.getControlProps()} data-testid='signature-control'>",
      "        <svg {...api.getSegmentProps()}><path {...api.getSegmentPathProps({ path: 'M0,0 Q1,1 2,2 T3,3 Z' })} /></svg>",
      "        <div {...api.getGuideProps()}>Sign here</div>",
      "        <button {...api.getClearTriggerProps()} />",
      "      </div>",
      "      <input {...api.getHiddenInputProps({ value: api.paths.join(' ') })} />",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-canvas-signature.tsx"), [
      "export function NativeCanvasSignature() {",
      "  const traces = 'signature pad root label control segment segment-path guide clear-trigger hidden-input idle drawing empty disabled read-only required interactive pointer-down pointer-move pointer-up current-points current-path paths pressure svg-path data-url image/png image/jpeg image/svg+xml clear draw-callback draw-end-callback name hidden-input required value readonly aria-label aria-roledescription aria-disabled data-disabled data-required role-application tab-index label-for pointer-test clear-test data-url-test hidden-input-test aria-test artifact-upload';",
      "  return (",
      "    <form onSubmit={() => {}}>",
      "      <section data-part='root' data-disabled='false'>",
      "        <label htmlFor='signature-input' data-required='true'>Agreement signature</label>",
      "        <div role='application' aria-roledescription='signature pad' aria-label='signature pad' aria-disabled='false' tabIndex={0} data-part='control' data-disabled='false' style={{ touchAction: 'none', userSelect: 'none' }}>",
      "          <svg data-part='segment'><path data-part='segment-path' d='M0,0 Q1,1 2,2 T3,3 Z' /></svg>",
      "          <div data-part='guide'>Sign here</div>",
      "          <button type='button' aria-label='clear signature' data-part='clear-trigger'>Clear</button>",
      "        </div>",
      "        <input id='signature-input' type='text' hidden readOnly required name='agreementSignature' value='M0,0 Q1,1 2,2 T3,3 Z' />",
      "        <p>{traces}</p>",
      "      </section>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "signature-pad.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeCanvasSignature } from '../src/native-canvas-signature';",
      "",
      "describe('signature pad readiness', () => {",
      "  it('covers pointer, clear, data url, hidden input, and aria traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativeCanvasSignature />);",
      "    expect(screen.getByRole('application', { name: /signature pad/i })).toHaveAttribute('aria-roledescription', 'signature pad');",
      "    await user.click(screen.getByRole('button', { name: /clear signature/i }));",
      "    expect('pointer-test clear-test data-url-test hidden-input-test aria-test artifact-upload').toContain('data-url-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "signature-pad.yml"), [
      "name: signature-pad-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- signature-pad",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: signature-pad-traces",
      "          path: test-results/signature-pad"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/signature-pad": "latest",
        "@zag-js/react": "latest",
        "perfect-freehand": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "signature-pad-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      signaturePadSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; segmentCount: number; segmentPathCount: number; guideCount: number; clearTriggerCount: number; hiddenInputCount: number; drawingCount: number; outputCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      drawingSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Signature pad readiness Zag signature-pad drawing paths pointer data URL hidden input accessibility tests");
    expect(report.signaturePadSetups.some((item) => item.filePath === "src/zag-signature-pad.tsx" && item.framework === "zag-signature-pad" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.segmentCount > 0 && item.segmentPathCount > 0 && item.guideCount > 0 && item.clearTriggerCount > 0 && item.hiddenInputCount > 0 && item.drawingCount > 0 && item.outputCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.signaturePadSetups.some((item) => item.filePath === "src/native-canvas-signature.tsx" && item.framework === "native-canvas" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.segmentCount > 0 && item.segmentPathCount > 0 && item.guideCount > 0 && item.clearTriggerCount > 0 && item.hiddenInputCount > 0 && item.drawingCount > 0 && item.outputCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-signature-pad", "native-canvas", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "segment", "segment-path", "guide", "clear-trigger", "hidden-input"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "drawing", "empty", "disabled", "read-only", "required", "interactive"]));
    expect(readySignals(report.drawingSignals)).toEqual(expect.arrayContaining(["pointer-down", "pointer-move", "pointer-up", "current-points", "current-path", "paths", "pressure", "perfect-freehand", "stroke-options"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["svg-path", "data-url", "png", "jpeg", "svg", "quality", "clear", "draw-callback", "draw-end-callback"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["name", "hidden-input", "required", "value", "readonly"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "aria-roledescription", "aria-disabled", "data-disabled", "data-required", "role-application", "tab-index", "label-for"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "clear-test", "data-url-test", "hidden-input-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/signature-pad", "perfect-freehand", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/signature-pad"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records signature pad readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "signature-pad-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "signature-pad-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "signature-pad-readiness.html"))).resolves.toBeUndefined();
    const signaturePadMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "signature-pad-readiness.md"), "utf8");
    expect(signaturePadMarkdown).toContain("Signature Pad Readiness");
    expect(signaturePadMarkdown).toContain("@zag-js/signature-pad");
    const signaturePadHtml = await fs.readFile(path.join(result.session.outputPaths.html, "signature-pad-readiness.html"), "utf8");
    expect(signaturePadHtml).toContain("signature-pad-readiness-card");
    expect(signaturePadHtml).toContain("data-source-pattern=\"SignaturePad\"");
    expect(signaturePadHtml).toContain("RepoTutor records signature pad readiness only");
  });

  it("detects Zag signature pad machine readiness without drawing real strokes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-signature-pad-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-signature-pad-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-signature-pad.tsx"), [
      "import * as signaturePad from '@zag-js/signature-pad';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagSignaturePadMachinePreview() {",
      "  const service = useMachine(signaturePad.machine, {",
      "    id: 'agreement-signature',",
      "    name: 'agreementSignature',",
      "    required: true,",
      "    disabled: false,",
      "    readOnly: false,",
      "    defaultPaths: [],",
      "    paths: [],",
      "    drawing: { size: 3, thinning: 0.7, smoothing: 0.4, streamline: 0.6, simulatePressure: false, fill: '#111827' },",
      "    translations: { control: 'signature pad', clearTrigger: 'clear signature' },",
      "    onDraw: console.info,",
      "    onDrawEnd: console.info",
      "  });",
      "  const api = signaturePad.connect(service, normalizeProps);",
      "  api.empty; api.drawing; api.currentPath; api.paths; api.clear(); api.getDataUrl('image/png', 0.92); api.getDataUrl('image/jpeg', 0.8); api.getDataUrl('image/svg+xml');",
      "  api.getRootProps(); api.getLabelProps(); api.getControlProps(); api.getSegmentProps(); api.getSegmentPathProps({ path: 'M0,0 Q1,1 2,2 T3,3 Z' }); api.getGuideProps(); api.getClearTriggerProps(); api.getHiddenInputProps({ value: api.paths.join(' ') });",
      "  const machineEvidence = 'createMachine SignaturePadSchema defaultPaths drawing size simulatePressure false thinning smoothing streamline translations control clearTrigger initialState idle states idle drawing POINTER_DOWN POINTER_MOVE POINTER_UP CLEAR effects trackPointerMove';",
      "  const contextEvidence = 'paths bindable defaultValue prop defaultPaths value prop paths sync true onChange onDraw currentPoints bindable defaultValue [] currentPath bindable defaultValue null';",
      "  const computedEvidence = 'isInteractive disabled readOnly isEmpty paths length';",
      "  const effectEvidence = 'trackPointerMove scope.getDoc onPointerMove getControlEl getRelativePoint send POINTER_MOVE pressure onPointerUp send POINTER_UP';",
      "  const actionEvidence = 'addPoint currentPoints getStroke getSvgPathFromStroke endStroke paths currentPath clearPoints focusCanvasEl queueMicrotask getActiveElement focus preventScroll invokeOnDraw invokeOnDrawEnd getDataUrl';",
      "  const domEvidence = 'getRootId getControlId getLabelId getHiddenInputId getControlEl getSegmentEl getHiddenInputEl getDataUrl query dataUrl';",
      "  const apiEvidence = 'empty drawing currentPath paths clear getDataUrl getLabelProps getRootProps getControlProps getSegmentProps getSegmentPathProps getGuideProps getClearTriggerProps getHiddenInputProps isLeftClick isModifierKey setPointerCapture releasePointerCapture role application aria-roledescription aria-label aria-disabled tabIndex touchAction userSelect button type hidden readOnly name value data-disabled data-required dir prop dir defaultPrevented closest data-part=clear-trigger pointerEvents none type text required';",
      "  const packageEvidence = '@zag-js/signature-pad @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils perfect-freehand react';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}>",
      "      <label {...api.getLabelProps()}>Agreement signature</label>",
      "      <div {...api.getControlProps()} data-testid='signature-control'>",
      "        <svg {...api.getSegmentProps()}><path {...api.getSegmentPathProps({ path: 'M0,0 Q1,1 2,2 T3,3 Z' })} /></svg>",
      "        <div {...api.getGuideProps()}>Sign here</div>",
      "        <button {...api.getClearTriggerProps()} />",
      "      </div>",
      "      <input {...api.getHiddenInputProps({ value: api.paths.join(' ') })} />",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/signature-pad": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "perfect-freehand": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "signature-pad-readiness-report.json"), "utf8")) as {
      signaturePadSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; segmentCount: number; segmentPathCount: number; guideCount: number; clearTriggerCount: number; hiddenInputCount: number; drawingCount: number; outputCount: number; formCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.signaturePadSetups.some((item) => item.filePath === "src/zag-signature-pad.tsx" && item.framework === "zag-signature-pad" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.segmentCount > 0 && item.segmentPathCount > 0 && item.guideCount > 0 && item.clearTriggerCount > 0 && item.hiddenInputCount > 0 && item.drawingCount > 0 && item.outputCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-signature-pad"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-paths", "drawing-defaults", "translations", "idle-state", "drawing-state", "pointer-down-event", "pointer-move-event", "pointer-up-event", "clear-event", "track-pointer-move-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["paths-context", "current-points-context", "current-path-context"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-interactive", "is-empty"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-pointer-move", "get-relative-point", "pointer-move-send", "pointer-up-send"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["add-point", "end-stroke", "clear-points", "focus-canvas-el", "invoke-on-draw", "invoke-on-draw-end"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "control-id", "label-id", "hidden-input-id", "control-el", "segment-el", "hidden-input-el", "data-url"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["empty", "drawing", "current-path", "paths", "clear", "get-data-url", "label-props", "root-props", "control-props", "segment-props", "segment-path-props", "guide-props", "clear-trigger-props", "hidden-input-props", "left-click", "modifier-key", "pointer-capture", "role-application", "aria-roledescription", "aria-label", "aria-disabled", "tab-index", "touch-action", "user-select", "button-type", "hidden", "read-only", "name", "value", "data-disabled", "data-required", "dir-prop", "default-prevented", "clear-trigger-target-guard", "pointer-events-none", "input-type-text", "required-prop"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/signature-pad", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "perfect-freehand", "react"]));
    const signaturePadMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "signature-pad-readiness.md"), "utf8");
    expect(signaturePadMarkdown).toContain("Machine Signals");
    expect(signaturePadMarkdown).toContain("@zag-js/signature-pad");
    const signaturePadHtml = await fs.readFile(path.join(result.session.outputPaths.html, "signature-pad-readiness.html"), "utf8");
    expect(signaturePadHtml).toContain("Machine Signals");
    expect(signaturePadHtml).toContain("@zag-js/signature-pad");
  });

  it("detects angle slider readiness without dragging real pointers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-angle-slider-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-angle-slider-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-angle-slider.tsx"), [
      "import * as angleSlider from '@zag-js/angle-slider';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function HueAngleSlider() {",
      "  const service = useMachine(angleSlider.machine, {",
      "    id: 'hue-angle',",
      "    name: 'hueAngle',",
      "    step: 15,",
      "    defaultValue: 45,",
      "    value: 90,",
      "    dir: 'rtl',",
      "    disabled: false,",
      "    readOnly: false,",
      "    invalid: false,",
      "    'aria-label': 'Hue angle',",
      "    'aria-labelledby': 'hue-angle-label',",
      "    onValueChange: console.info,",
      "    onValueChangeEnd: console.info",
      "  });",
      "  const api = angleSlider.connect(service, normalizeProps);",
      "  api.value; api.valueAsDegree; api.dragging; api.setValue(180);",
      "  const markers = [0, 90, 180, 270];",
      "  const evidence = 'idle focused dragging VALUE.SET CONTROL.POINTER_DOWN DOC.POINTER_MOVE DOC.POINTER_UP THUMB.FOCUS THUMB.BLUR THUMB.ARROW_INC THUMB.ARROW_DEC THUMB.HOME THUMB.END setPointerValue incrementValue decrementValue setValueToMin setValueToMax setValue invokeOnChangeEnd syncInputElement focusThumb setThumbDragOffset clearThumbDragOffset trackPointerMove getPointerValue getAngle getDisplayAngle clampAngle constrainAngle snapAngleToStep mirrorAngle thumbDragOffset value valueAsDegree defaultValue step min max 0 359 dir rtl marker under-value over-value at-value aria-valuemin aria-valuemax aria-valuenow role slider aria-label aria-labelledby data-disabled data-invalid data-readonly tabIndex hidden input name value touchAction userSelect marker group value text pointer-test keyboard-test form-test aria-test marker-test artifact-upload';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <label {...api.getLabelProps()} id='hue-angle-label'>Hue angle</label>",
      "      <input {...api.getHiddenInputProps()} />",
      "      <div {...api.getControlProps()} data-testid='angle-control'>",
      "        <div {...api.getThumbProps()} />",
      "        <output {...api.getValueTextProps()}>{api.valueAsDegree}</output>",
      "        <div {...api.getMarkerGroupProps()}>{markers.map((value) => <span key={value} {...api.getMarkerProps({ value })}>{value}</span>)}</div>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-angle-dial.tsx"), [
      "export function NativeAngleDial() {",
      "  const traces = 'angle slider radial dial root label control thumb value-text marker-group marker hidden-input idle focused dragging disabled read-only invalid interactive value value-as-degree default-value step min max rtl ltr pointer-down pointer-move pointer-up thumb-focus thumb-blur arrow-inc arrow-dec home end pointer-value angle display-angle clamp-angle constrain-angle snap-angle-to-step mirror-angle thumb-drag-offset role-slider aria-label aria-labelledby aria-valuemin aria-valuemax aria-valuenow data-disabled data-invalid data-readonly tab-index hidden-input name form-value touch-action user-select pointer-test keyboard-test form-test aria-test marker-test artifact-upload';",
      "  return (",
      "    <form>",
      "      <section data-part='root' data-disabled='false' data-invalid='false' data-readonly='false' style={{ '--value': 90, '--angle': '90deg' }}>",
      "        <label id='dial-label' htmlFor='dial-value'>Hue angle</label>",
      "        <input id='dial-value' type='hidden' name='hueAngle' value='90' />",
      "        <div data-part='control' role='presentation' style={{ touchAction: 'none', userSelect: 'none' }}>",
      "          <div data-part='thumb' role='slider' aria-label='Hue angle' aria-labelledby='dial-label' aria-valuemin={0} aria-valuemax={360} aria-valuenow={90} tabIndex={0} data-invalid='false' />",
      "          <output data-part='value-text'>90deg</output>",
      "          <div data-part='marker-group'>",
      "            <span data-part='marker' data-value='0' data-state='under-value'>0</span>",
      "            <span data-part='marker' data-value='90' data-state='at-value'>90</span>",
      "            <span data-part='marker' data-value='180' data-state='over-value'>180</span>",
      "          </div>",
      "        </div>",
      "        <p>{traces}</p>",
      "      </section>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "angle-slider.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeAngleDial } from '../src/native-angle-dial';",
      "",
      "describe('angle slider readiness', () => {",
      "  it('covers keyboard, form, marker, and aria traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativeAngleDial />);",
      "    const slider = screen.getByRole('slider', { name: /hue angle/i });",
      "    expect(slider).toHaveAttribute('aria-valuenow', '90');",
      "    await user.keyboard('{ArrowRight}{Home}{End}');",
      "    expect('pointer-test keyboard-test form-test aria-test marker-test artifact-upload').toContain('keyboard-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "angle-slider.yml"), [
      "name: angle-slider-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- angle-slider",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: angle-slider-traces",
      "          path: test-results/angle-slider"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/angle-slider": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "angle-slider-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      angleSliderSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; thumbCount: number; valueTextCount: number; markerGroupCount: number; markerCount: number; hiddenInputCount: number; stateCount: number; pointerCount: number; keyboardCount: number; angleMathCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      angleMathSignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Angle slider readiness Zag angle-slider radial dial pointer keyboard degree form accessibility tests");
    expect(report.angleSliderSetups.some((item) => item.filePath === "src/zag-angle-slider.tsx" && item.framework === "zag-angle-slider" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.thumbCount > 0 && item.valueTextCount > 0 && item.markerGroupCount > 0 && item.markerCount > 0 && item.hiddenInputCount > 0 && item.stateCount > 0 && item.pointerCount > 0 && item.keyboardCount > 0 && item.angleMathCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.angleSliderSetups.some((item) => item.filePath === "src/native-angle-dial.tsx" && item.framework === "native-angle-dial" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.thumbCount > 0 && item.valueTextCount > 0 && item.markerGroupCount > 0 && item.markerCount > 0 && item.hiddenInputCount > 0 && item.stateCount > 0 && item.pointerCount > 0 && item.keyboardCount > 0 && item.angleMathCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-angle-slider", "native-angle-dial", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "thumb", "value-text", "marker-group", "marker", "hidden-input"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "focused", "dragging", "disabled", "read-only", "invalid", "interactive"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "value-as-degree", "default-value", "step", "min-max", "set-value", "on-value-change", "on-value-change-end"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer-down", "pointer-move", "pointer-up", "thumb-focus", "thumb-blur", "arrow-inc", "arrow-dec", "home", "end", "track-pointer"]));
    expect(readySignals(report.angleMathSignals)).toEqual(expect.arrayContaining(["pointer-value", "angle", "display-angle", "clamp-angle", "constrain-angle", "snap-angle-to-step", "rtl-mirror", "thumb-drag-offset"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["hidden-input", "name", "form-value"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-slider", "aria-label", "aria-labelledby", "aria-valuemin", "aria-valuemax", "aria-valuenow", "data-disabled", "data-invalid", "data-readonly", "tab-index"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "form-test", "aria-test", "marker-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/angle-slider", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/angle-slider"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records angle slider readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "angle-slider-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "angle-slider-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "angle-slider-readiness.html"))).resolves.toBeUndefined();
    const angleSliderMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "angle-slider-readiness.md"), "utf8");
    expect(angleSliderMarkdown).toContain("Angle Slider Readiness");
    expect(angleSliderMarkdown).toContain("@zag-js/angle-slider");
    const angleSliderHtml = await fs.readFile(path.join(result.session.outputPaths.html, "angle-slider-readiness.html"), "utf8");
    expect(angleSliderHtml).toContain("angle-slider-readiness-card");
    expect(angleSliderHtml).toContain("data-source-pattern=\"AngleSlider\"");
    expect(angleSliderHtml).toContain("RepoTutor records angle slider readiness only");
  });

  it("detects Zag angle slider machine readiness without dragging real pointers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-angle-slider-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-angle-slider-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-angle-slider-machine.tsx"), [
      "import * as angleSlider from '@zag-js/angle-slider';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagAngleSliderMachinePreview() {",
      "  const service = useMachine(angleSlider.machine, {",
      "    id: 'rotation-angle',",
      "    name: 'rotationAngle',",
      "    step: 5,",
      "    defaultValue: 0,",
      "    value: 45,",
      "    dir: 'rtl',",
      "    disabled: false,",
      "    readOnly: false,",
      "    invalid: false,",
      "    'aria-label': 'Rotation angle',",
      "    'aria-labelledby': 'rotation-angle-label',",
      "    onValueChange: console.info,",
      "    onValueChangeEnd: console.info",
      "  });",
      "  const api = angleSlider.connect(service, normalizeProps);",
      "  api.value; api.valueAsDegree; api.dragging; api.setValue(90);",
      "  api.getRootProps(); api.getLabelProps(); api.getHiddenInputProps(); api.getControlProps(); api.getThumbProps(); api.getValueTextProps(); api.getMarkerGroupProps(); api.getMarkerProps({ value: 90 });",
      "  const machineEvidence = 'createMachine AngleSliderSchema step 1 defaultValue 0 initialState idle states idle focused dragging VALUE.SET CONTROL.POINTER_DOWN DOC.POINTER_MOVE DOC.POINTER_UP THUMB.FOCUS THUMB.BLUR THUMB.ARROW_DEC THUMB.ARROW_INC THUMB.HOME THUMB.END effects trackPointerMove';",
      "  const contextEvidence = 'value bindable defaultValue prop defaultValue value prop value onChange onValueChange valueAsDegree thumbDragOffset refs null';",
      "  const computedEvidence = 'interactive disabled readOnly valueAsDegree context value deg';",
      "  const effectEvidence = 'trackPointerMove scope.getDoc onPointerMove send DOC.POINTER_MOVE point onPointerUp send DOC.POINTER_UP';",
      "  const actionEvidence = 'syncInputElement getHiddenInputEl setElementValue invokeOnChangeEnd setPointerValue getControlEl getPointerValue constrainAngle setValueToMin MIN_VALUE setValueToMax MAX_VALUE setValue clampAngle decrementValue snapAngleToStep incrementValue focusThumb raf getThumbEl preventScroll setThumbDragOffset clearThumbDragOffset';",
      "  const domEvidence = 'getRootId getThumbId getHiddenInputId getControlId getValueTextId getLabelId getHiddenInputEl getControlEl getThumbEl';",
      "  const apiEvidence = 'value valueAsDegree dragging setValue getRootProps getLabelProps getHiddenInputProps getControlProps getThumbProps getValueTextProps getMarkerGroupProps getMarkerProps data-state data-value data-disabled data-invalid data-readonly dir prop dir type hidden onPointerDown stopPropagation onFocus onBlur onKeyDown preventDefault role presentation role slider aria-label aria-labelledby aria-valuemin aria-valuemax aria-valuenow tabIndex touchAction userSelect rotate';",
      "  const packageEvidence = '@zag-js/angle-slider @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/rect-utils @zag-js/types @zag-js/utils react';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}>",
      "      <label {...api.getLabelProps()} id='rotation-angle-label'>Rotation angle</label>",
      "      <input {...api.getHiddenInputProps()} />",
      "      <div {...api.getControlProps()} data-testid='angle-control'>",
      "        <div {...api.getThumbProps()} />",
      "        <output {...api.getValueTextProps()}>{api.valueAsDegree}</output>",
      "        <div {...api.getMarkerGroupProps()}><span {...api.getMarkerProps({ value: 90 })}>90</span></div>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/angle-slider": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/rect-utils": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "angle-slider-readiness-report.json"), "utf8")) as {
      angleSliderSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; thumbCount: number; valueTextCount: number; markerGroupCount: number; markerCount: number; hiddenInputCount: number; stateCount: number; pointerCount: number; keyboardCount: number; angleMathCount: number; formCount: number; accessibilityCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.angleSliderSetups.some((item) => item.filePath === "src/zag-angle-slider-machine.tsx" && item.framework === "zag-angle-slider" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.thumbCount > 0 && item.valueTextCount > 0 && item.markerGroupCount > 0 && item.markerCount > 0 && item.hiddenInputCount > 0 && item.stateCount > 0 && item.pointerCount > 0 && item.keyboardCount > 0 && item.angleMathCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-angle-slider"]));
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "step-default", "default-value", "idle-state", "focused-state", "dragging-state", "value-set-event", "control-pointer-down-event", "doc-pointer-move-event", "doc-pointer-up-event", "thumb-focus-event", "thumb-blur-event", "arrow-key-events", "home-end-events", "track-pointer-move-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["value-context", "thumb-drag-offset-ref"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["interactive", "value-as-degree"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-pointer-move", "pointer-move-send", "pointer-up-send"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["sync-input-element", "invoke-on-change-end", "set-pointer-value", "set-value-to-min", "set-value-to-max", "set-value", "decrement-value", "increment-value", "focus-thumb", "set-thumb-drag-offset", "clear-thumb-drag-offset"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "thumb-id", "hidden-input-id", "control-id", "value-text-id", "label-id", "hidden-input-el", "control-el", "thumb-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["value", "value-as-degree", "dragging", "set-value", "root-props", "label-props", "hidden-input-props", "control-props", "thumb-props", "value-text-props", "marker-group-props", "marker-props", "data-state", "data-value", "pointer-down", "keyboard-map", "role-presentation", "role-slider", "aria-label", "aria-labelledby", "aria-valuemin", "aria-valuemax", "aria-valuenow", "tab-index", "touch-action", "user-select", "rotate-style", "data-disabled", "data-invalid", "data-readonly", "dir-prop", "hidden-input-type", "stop-propagation", "thumb-focus-handler", "thumb-blur-handler", "prevent-default"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/angle-slider", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react"]));
    const angleSliderMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "angle-slider-readiness.md"), "utf8");
    expect(angleSliderMarkdown).toContain("Machine Signals");
    expect(angleSliderMarkdown).toContain("@zag-js/angle-slider");
    const angleSliderHtml = await fs.readFile(path.join(result.session.outputPaths.html, "angle-slider-readiness.html"), "utf8");
    expect(angleSliderHtml).toContain("Machine Signals");
    expect(angleSliderHtml).toContain("@zag-js/angle-slider");
  });

  it("detects cascade select readiness without opening real poppers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-cascade-select-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-cascade-select-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-cascade-select.tsx"), [
      "import * as cascadeSelect from '@zag-js/cascade-select';",
      "import { collection } from '@zag-js/cascade-select';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const continentCollection = collection({ rootNode: { value: 'ROOT', children: [{ value: 'asia', label: 'Asia', children: [{ value: 'korea', label: 'Korea', children: [{ value: 'seoul', label: 'Seoul' }] }] }, { value: 'europe', label: 'Europe', disabled: true }] } });",
      "",
      "export function RegionCascadeSelect() {",
      "  const service = useMachine(cascadeSelect.machine, {",
      "    id: 'region-cascade',",
      "    name: 'region',",
      "    form: 'checkout',",
      "    collection: continentCollection,",
      "    defaultOpen: true,",
      "    defaultValue: [['asia', 'korea']],",
      "    defaultHighlightedValue: ['asia'],",
      "    value: [['asia', 'korea', 'seoul']],",
      "    highlightedValue: ['asia', 'korea'],",
      "    multiple: true,",
      "    required: true,",
      "    disabled: false,",
      "    readOnly: false,",
      "    invalid: false,",
      "    closeOnSelect: false,",
      "    loopFocus: true,",
      "    highlightTrigger: 'hover',",
      "    allowParentSelection: true,",
      "    positioning: { placement: 'bottom-start', gutter: 8 },",
      "    scrollToIndexFn: console.info,",
      "    formatValue: (items) => items.map((path) => path.map((item) => item.label).join(' / ')).join(', '),",
      "    onValueChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onOpenChange: console.info,",
      "    onFocusOutside: console.warn,",
      "    onPointerDownOutside: console.warn,",
      "    onInteractOutside: console.warn",
      "  });",
      "  const api = cascadeSelect.connect(service, normalizeProps);",
      "  const rootItem = continentCollection.rootNode.children[0];",
      "  const childItem = rootItem.children[0];",
      "  api.open; api.focused; api.multiple; api.disabled; api.value; api.highlightedValue; api.highlightedItems; api.selectedItems; api.hasSelectedItems; api.empty; api.valueAsString;",
      "  api.setOpen(true); api.reposition({ placement: 'bottom-end' }); api.setHighlightValue(['asia']); api.clearHighlightValue(); api.setValue([['asia', 'korea']]); api.selectValue(['asia', 'korea', 'seoul']); api.clearValue(['asia']); api.getItemState({ item: childItem, indexPath: [0, 0], value: ['asia', 'korea'] });",
      "  const evidence = 'idle focused open closed VALUE.SET VALUE.CLEAR CLEAR_TRIGGER.CLICK HIGHLIGHTED_VALUE.SET HIGHLIGHTED_VALUE.CLEAR ITEM.SELECT ITEM.CLEAR CONTROLLED.OPEN CONTROLLED.CLOSE TRIGGER.CLICK TRIGGER.FOCUS TRIGGER.BLUR TRIGGER.ENTER TRIGGER.ARROW_UP TRIGGER.ARROW_DOWN TRIGGER.ARROW_LEFT TRIGGER.ARROW_RIGHT CONTENT.HOME CONTENT.END CONTENT.ARROW_DOWN CONTENT.ARROW_UP CONTENT.ARROW_RIGHT CONTENT.ARROW_LEFT CONTENT.ENTER ITEM.CLICK ITEM.POINTER_ENTER ITEM.POINTER_LEAVE POINTER_MOVE GRACE_AREA.CLEAR POSITIONING.SET setValue clearValue setHighlightedValue clearHighlightedValue selectItem clearItem selectHighlightedItem highlightFirstItem highlightLastItem highlightNextItem highlightPreviousItem highlightFirstChild highlightParent setInitialFocus focusTriggerEl invokeOnOpen invokeOnClose toggleVisibility highlightFirstSelectedItem createGraceArea clearGraceArea trackFormControlState trackDismissableElement trackFocusVisible computePlacement scrollToHighlightedItems getPlacement scrollIntoView observeAttributes dispatchInputValueEvent setElementValue getInteractionModality setInteractionModality valueAsString collection TreeCollection rootNode branch node leaf node indexPath value path highlightedIndexPath selectedItems highlightedItems allowParentSelection closeOnSelect multiple defaultOpen defaultValue defaultHighlightedValue highlightedValue loopFocus highlightTrigger positioning placement currentPlacement fieldsetDisabled graceArea isPointerInGraceArea role combobox listbox treeitem group aria-controls aria-expanded aria-haspopup aria-activedescendant aria-multiselectable aria-required aria-readonly aria-disabled aria-owns aria-level data-selected data-highlighted data-depth data-type hidden input name form required readOnly defaultValue reset input-event click-test keyboard-test hover-test form-test aria-test cascade-select-traces upload-artifact';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Region</label>",
      "      <div {...api.getControlProps()}>",
      "        <button {...api.getTriggerProps()}>{api.valueAsString || 'Select region'}</button>",
      "        <span {...api.getIndicatorProps()}>⌄</span>",
      "        <button {...api.getClearTriggerProps()}>Clear value</button>",
      "        <span {...api.getValueTextProps()}>{api.valueAsString}</span>",
      "      </div>",
      "      <div {...api.getPositionerProps()}><div {...api.getContentProps()}>{[rootItem, childItem].map((item, index) => <div key={item.value} {...api.getListProps({ item, indexPath: [index], value: [item.value] })}><div {...api.getItemProps({ item, indexPath: [index], value: [item.value] })}><span {...api.getItemTextProps({ item, indexPath: [index], value: [item.value] })}>{item.label}</span><span {...api.getItemIndicatorProps({ item, indexPath: [index], value: [item.value] })}>selected</span></div></div>)}</div></div>",
      "      <input {...api.getHiddenInputProps()} />",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "native-cascader.tsx"), [
      "export function NativeCascader() {",
      "  const traces = 'cascade select cascader root label control trigger indicator value-text clear-trigger positioner content list item item-text item-indicator hidden-input idle focused open closed disabled read-only invalid required multiple empty selected highlighted tree-collection root-node branch-node leaf-node index-path value-path depth disabled-node parent-selection value default-value selected-items has-selected-items clear-value select-value close-on-select value-as-string trigger-click trigger-focus arrow-up arrow-down arrow-left arrow-right home end enter pointer-enter pointer-leave grace-area positioning placement popper dismissable focus-visible scroll-into-view current-placement hidden-input name form required read-only default-value reset input-event combobox listbox treeitem group aria-controls aria-expanded aria-haspopup aria-activedescendant aria-multiselectable aria-disabled aria-level aria-owns data-selected click-test keyboard-test hover-test form-test aria-test artifact-upload';",
      "  return (",
      "    <form id='checkout'>",
      "      <section data-part='root' data-state='open' data-invalid='false'>",
      "        <label id='region-label' htmlFor='region-input'>Region</label>",
      "        <div data-part='control' data-state='open'>",
      "          <button type='button' role='combobox' aria-controls='region-content' aria-expanded='true' aria-haspopup='listbox' aria-labelledby='region-label' data-part='trigger'>Asia / Korea</button>",
      "          <span data-part='indicator' aria-hidden='true'>⌄</span>",
      "          <button type='button' aria-label='Clear value' data-part='clear-trigger'>Clear</button>",
      "          <span data-part='value-text'>Asia / Korea</span>",
      "        </div>",
      "        <div data-part='positioner' data-placement='bottom-start'>",
      "          <div id='region-content' data-part='content' role='listbox' aria-activedescendant='asia' aria-multiselectable='true' aria-required='true' aria-readonly='false' tabIndex={0}>",
      "            <div data-part='list' role='group' aria-level={1} data-depth='1'>",
      "              <div id='asia' data-part='item' role='treeitem' aria-haspopup='menu' aria-expanded='true' aria-controls='asia-list' aria-owns='asia-list' aria-disabled='false' data-value='asia' data-highlighted='true' data-selected='true' data-depth='1' data-state='checked' data-type='branch' data-index-path='0'>",
      "                <span data-part='item-text' data-value='asia' data-highlighted='true' data-state='checked'>Asia</span>",
      "                <span data-part='item-indicator' data-value='asia' data-type='branch' data-state='checked'>selected</span>",
      "              </div>",
      "            </div>",
      "          </div>",
      "        </div>",
      "        <input id='region-input' type='hidden' name='region' form='checkout' required readOnly defaultValue='asia,korea' aria-hidden='true' aria-labelledby='region-label' />",
      "        <p>{traces}</p>",
      "      </section>",
      "    </form>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "cascade-select.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "import { NativeCascader } from '../src/native-cascader';",
      "",
      "describe('cascade select readiness', () => {",
      "  it('covers combobox, tree items, keyboard, hover, form, and aria traces', async () => {",
      "    const user = userEvent.setup();",
      "    render(<NativeCascader />);",
      "    expect(screen.getByRole('combobox', { name: /region/i })).toHaveAttribute('aria-expanded', 'true');",
      "    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');",
      "    await user.click(screen.getByRole('button', { name: /clear/i }));",
      "    await user.keyboard('{ArrowRight}{ArrowLeft}{Home}{End}{Enter}');",
      "    expect('click-test keyboard-test hover-test form-test aria-test cascade-select-traces upload-artifact').toContain('cascade-select-traces');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "cascade-select.yml"), [
      "name: cascade-select-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- cascade-select",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: cascade-select-traces",
      "          path: test-results/cascade-select"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/cascade-select": "latest",
        "@zag-js/collection": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "cascade-select-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      cascadeSelectSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; triggerCount: number; clearTriggerCount: number; positionerCount: number; contentCount: number; listCount: number; itemCount: number; valueTextCount: number; hiddenInputCount: number; collectionCount: number; stateCount: number; navigationCount: number; selectionCount: number; positioningCount: number; formCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      collectionSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      formSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Cascade select readiness Zag cascade-select tree collection value path popper combobox listbox accessibility tests");
    expect(report.cascadeSelectSetups.some((item) => item.filePath === "src/zag-cascade-select.tsx" && item.framework === "zag-cascade-select" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.clearTriggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.valueTextCount > 0 && item.hiddenInputCount > 0 && item.collectionCount > 0 && item.stateCount > 0 && item.navigationCount > 0 && item.selectionCount > 0 && item.positioningCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.cascadeSelectSetups.some((item) => item.filePath === "src/native-cascader.tsx" && item.framework === "native-cascader" && item.rootCount > 0 && item.labelCount > 0 && item.controlCount > 0 && item.triggerCount > 0 && item.clearTriggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.valueTextCount > 0 && item.hiddenInputCount > 0 && item.collectionCount > 0 && item.stateCount > 0 && item.navigationCount > 0 && item.selectionCount > 0 && item.positioningCount > 0 && item.formCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-cascade-select", "native-cascader", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "trigger", "indicator", "clear-trigger", "positioner", "content", "list", "item", "item-text", "item-indicator", "value-text", "hidden-input"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "focused", "open", "closed", "disabled", "read-only", "invalid", "required", "multiple", "empty", "selected", "highlighted"]));
    expect(readySignals(report.collectionSignals)).toEqual(expect.arrayContaining(["tree-collection", "root-node", "branch-node", "leaf-node", "index-path", "value-path", "depth", "disabled-node", "parent-selection"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["value", "default-value", "selected-items", "has-selected-items", "clear-value", "select-value", "multiple", "close-on-select", "value-as-string"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["trigger-click", "trigger-focus", "arrow-up", "arrow-down", "arrow-left", "arrow-right", "home", "end", "enter", "pointer-enter", "pointer-leave", "grace-area"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["positioning", "placement", "popper", "dismissable", "focus-visible", "scroll-into-view", "current-placement"]));
    expect(readySignals(report.formSignals)).toEqual(expect.arrayContaining(["hidden-input", "name", "form", "required", "read-only", "default-value", "reset", "input-event"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["combobox", "listbox", "treeitem", "group", "aria-controls", "aria-expanded", "aria-haspopup", "aria-activedescendant", "aria-multiselectable", "aria-disabled", "aria-level", "aria-owns"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "hover-test", "form-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/cascade-select", "@zag-js/collection", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/cascade-select"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records cascade select readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "cascade-select-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "cascade-select-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "cascade-select-readiness.html"))).resolves.toBeUndefined();
    const cascadeSelectMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "cascade-select-readiness.md"), "utf8");
    expect(cascadeSelectMarkdown).toContain("Cascade Select Readiness");
    expect(cascadeSelectMarkdown).toContain("@zag-js/cascade-select");
    const cascadeSelectHtml = await fs.readFile(path.join(result.session.outputPaths.html, "cascade-select-readiness.html"), "utf8");
    expect(cascadeSelectHtml).toContain("cascade-select-readiness-card");
    expect(cascadeSelectHtml).toContain("data-source-pattern=\"CascadeSelect\"");
    expect(cascadeSelectHtml).toContain("RepoTutor records cascade select readiness only");
  });
});
