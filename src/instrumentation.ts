/**
 * Next.js instrumentation hook — runs once before the server starts.
 *
 * Problem: Node.js v22 introduced a --localstorage-file flag that exposes a
 * `localStorage` global in the Node process. When that flag is passed without
 * a valid backing file path, `localStorage` is defined but `getItem` / `setItem`
 * are not functions. Next.js's dev overlay (preferences.js) checks
 * `typeof localStorage !== 'undefined'` — which now passes on the server —
 * then calls `localStorage.getItem()`, crashing every SSR render.
 *
 * Fix: if we detect a broken localStorage on the server, remove it entirely
 * so code that guards with `typeof localStorage !== 'undefined'` stays safe.
 */
export async function register() {
  if (typeof globalThis.localStorage !== "undefined") {
    try {
      if (typeof globalThis.localStorage.getItem !== "function") {
        // @ts-expect-error -- deleting non-standard global injected by Node v22 --localstorage-file
        delete globalThis.localStorage;
      }
    } catch {
      // If we can't even inspect it, nuke it
      try {
        // @ts-expect-error -- deleting non-standard global injected by Node v22 --localstorage-file
        delete globalThis.localStorage;
      } catch {
        // Last resort: replace with undefined-returning stub
        Object.defineProperty(globalThis, "localStorage", {
          get: () => undefined,
          configurable: true,
        });
      }
    }
  }
}
