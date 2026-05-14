## Goal
Attribute the 86ms "[unattributed]" forced reflow surfaced by Lighthouse and confirm whether a third-party script (e.g. `~flock.js`, `gpteng.co/lovable.js`, GTM, fonts) is responsible — without changing any product code yet.

## Approach

Use the in-sandbox browser tools to run a real Chrome CPU + performance profile against the published site, then cross-reference long tasks and reflow stacks with the network waterfall to name the offending script.

## Steps

1. **Baseline navigation**
   - `browser--navigate_to_url` to `https://focusflowaibycoachkay.lovable.app` (the published URL Lighthouse audited).
   - Set desktop viewport (1350x940) to match the Lighthouse desktop run.

2. **CPU profile during load + first interaction**
   - `browser--start_profiling`
   - Navigate / reload the page so the profile captures the full load + hydration window (where the 86ms reflow occurred).
   - Trigger a small scroll/hover via `browser--act` to surface any post-load reflows (chat widget mount, font swap).
   - `browser--stop_profiling` and inspect top self-time functions. Look specifically for:
     - `layout` / `recalculateStyle` / `updateLayoutTree` frames
     - Calls originating from `flock.js`, `lovable.js`, `gpteng`, GTM, Helmet, or our own components.

3. **Network attribution**
   - `browser--list_network_requests` (resource_types=all) to enumerate every script that loaded before/around the reflow window.
   - Confirm presence + size of the suspects already visible in Lighthouse: `~flock.js` (8 KiB, short cache), `cdn.gpteng.co/lovable.js` (Lovable badge), Google Fonts CSS, vendor-charts chunk.

4. **Console + replay correlation**
   - `browser--read_console_logs` to catch any third-party warnings firing near the reflow.
   - Cross-reference with the existing session-replay timestamps (chat widget mounts ~5s after load — possible reflow source).

5. **Diagnosis report**
   - Combine profiler frames + network owners to attribute the reflow to a specific script (first-party React component, Lovable badge, Flock analytics, font swap, etc.).
   - Classify as: (a) third-party (out of our control), (b) first-party fixable (e.g. a component reading `offsetWidth` in an effect), or (c) layout thrash from font/late-mounted widget.

6. **Recommendation only — no code changes**
   - If third-party: document and recommend leaving as-is (matches earlier guidance).
   - If first-party: identify the file/component and propose a minimal, UX-preserving fix in a follow-up build-mode task (e.g. wrap measurement in `requestAnimationFrame`, batch reads before writes, defer late-mount widget).

## Deliverable

A short written report in chat containing:
- Top 5 profiler frames with self-time
- Suspected script/component owning the reflow
- Whether action is recommended, and if so, the exact next step

No files will be edited in this plan.
