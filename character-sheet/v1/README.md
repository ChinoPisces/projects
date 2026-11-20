# Character Sheet Engine v1

A character-driven, skinable Webflow presentation template. **This is an unpublished development baseline**; it is not approved for production or visually regression-tested.

## Architecture

- `engine.js`: character-agnostic renderer (gaze, optional 360-degree turntable, materials, poses and galleries).
- `engine.css`: responsive layout, clipping, theme tokens and accessible input states.
- `characters/ash.json`: Ash's profile and asset manifest.
- `characters/mona.json`: Mona's distinct gaze frames; turntable disabled until actual Mona turntable assets are available.
- `characters/blank.json`: replace the empty gaze URLs with new assets before activation.
- `tests/validate.cjs`: automated syntax, image-map and architecture checks.

## Webflow draft pages

- `/character-sheet-template`: Ash reference
- `/character-engine-mona-test`: Mona test
- `/character-engine-blank-starter`: blank template

Each draft contains the character's manifest in a `<script type="application/json" id="characterManifest">` block within an HTML embed, plus a `<div id="characterApp">` mount. CSS and JavaScript are shared external resources pinned to a Git commit for predictable releases. The theme lives in the manifest's `skin` object. To create a new character, duplicate the blank draft, supply 16 named gaze images, optional turntable frames, profile content, and theme tokens.

## Release process

1. Make engine changes in GitHub, run `node --check character-sheet/v1/engine.js` and `node character-sheet/v1/tests/validate.cjs`.
2. Pin test pages to the new tested commit SHA. Never use `@main` on production pages.
3. Test at desktop, tablet and mobile sizes using a real browser. Validate 16-direction gaze, pointer/touch/keyboard input, yaw wrap, image loading, text, horizontal overflow and frame clipping.
4. Compare screenshots and measurements of the clipping region (portrait and grid must end at the same frame edge).
5. Only after visual QA, deploy the approved engine to live character pages; retain a rollback SHA.

**Known gaps:** automated checks do not replace browser visual tests; live browser/snapshot access was unavailable during this build. Webflow copies character manifests into their own embed, so canonical GitHub JSON must be synced when edited. The blank starter intentionally fails runtime image URL checks until populated. A distinct Mona 360-degree sequence has not been provided. Production pages `/ash` and `/mona` remain unchanged.
