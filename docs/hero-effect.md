# Homepage Hero Effect — Rising Bubbles

A note on the interactive homepage hero effect: what it does, how it works, and how I actually learned/built it — useful reference for the supporting documentation (originality and AI-tool-transparency sections in particular).

## What it does

Moving the mouse across the homepage hero spawns small glowing bubbles at the cursor position. Each bubble drifts upward, wobbles gently side to side, and fades out — meant to evoke actually disturbing water rather than a static glow effect. It's purely decorative/atmospheric: it sits in `public/js/hero-effect.js` and only runs inside the hero section (`#hero`), not site-wide.

It also respects motion sensitivity two ways:

- It checks the OS-level `prefers-reduced-motion` setting on page load and defaults to **off** if that's set.
- There's a visible on/off checkbox in the hero itself, which overrides that default in either direction, so it's never the only way to control it.

## How it works, technically

- A single `<canvas>` element is layered over the hero photo, sitting between a dark tint layer (for text contrast) and the glass info card.
- On `mousemove` (only while the effect is enabled), a new bubble object is pushed into an array — each one stores its position, a randomised radius (3–9px), an upward speed (`vy`), a random "wobble phase" so bubbles don't move in sync, and an alpha (opacity) that starts high and decreases every frame.
- A `requestAnimationFrame` loop runs continuously: it clears the canvas, updates every bubble's position (moves up, wobbles via a sine wave using its own phase), fades its alpha, then redraws it — and removes any bubble once it's fully faded or floated off the top of the canvas.
- Each bubble is drawn as three layered shapes, not one flat circle: a very faint translucent fill (the bubble's "body"), a pale stroke around the rim (light catching the surface), and a small bright glint offset toward the top-left (the classic highlight that reads as "shiny sphere" rather than a flat dot). That layering is what makes it look like a bubble instead of a glowing marker.
- A capped particle count (50 max) keeps performance steady even with fast mouse movement.

## How I learned/built this

This was built as part of relearning Express/EJS/SQLite for this project (the stack I'd flagged as rusty compared to my day-to-day .NET/Blazor work) — the canvas/JS animation piece specifically isn't part of that backend refresher, but came up because I wanted a signature interactive moment on the homepage.

I built it, researched and learned the underlying technique first (canvas as a drawing surface, `requestAnimationFrame` as an animation loop, a particle array as the data model, alpha-fade for the disappearing effect). The first version was a simpler "glowing dot" bioluminescent trail; I then had the idea for it to be re-styled specifically as rising water bubbles to fit the aquarium theme better, which changed the particle model (added radius, upward velocity, wobble phase) and the draw logic (three-layer shape instead of one flat circle) — same underlying mechanism, different art direction.

Worth noting: this isn't a totally new technique for me. I'd already implemented a similar mouse-driven canvas/particle interaction on my own portfolio site ([dafneribeiro.co.uk](https://dafneribeiro.co.uk)), so the core idea (canvas + animation loop + particles reacting to cursor position) was already familiar — this project's version is a fresh implementation adapted to a different visual concept (bubbles vs. whatever I used previously) and a different codebase (vanilla JS + EJS/Express here, vs. Blazor/C# there).
