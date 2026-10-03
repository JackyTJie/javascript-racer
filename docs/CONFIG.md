# config.js reference

Every setting the game reads, what it does, and what you will see change. The
same information is commented in `config.js` itself; this page is the version you
can read without scrolling past a wall of code.

Two rules cover most mistakes:

* **A value outside its range is clamped, not rejected.** The game keeps running
  and tells you in the red box that it clamped it.
* **A key that does not exist is reported.** The shipped `config.js` contains
  every key, so "missing" always means a typo or a bad merge.

---

## 1. `team` — who made this

| Key | Type | Range | Effect |
|---|---|---|---|
| `title` | string | — | Large text on the title card, and the browser tab title |
| `authors` | list of strings | — | One name per line under the title. Everyone adds their own line, so expect a conflict here |
| `intensity` | number | 0.25–3 | One multiplier over scenery density, rival count **and** top speed. 1 = as shipped |

`intensity` is the shared dial. Everyone wants it moved, so it is the setting
most worth agreeing on out loud before you touch it.

---

## 2. `difficulty` — a preset that multiplies everything else

| Value | Top speed | Rival count | Rival speed |
|---|---|---|---|
| `'easy'` | ×0.75 | ×0.5 | ×0.85 |
| `'normal'` | ×1.0 | ×1.0 | ×1.0 |
| `'hard'` | ×1.25 | ×2.0 | ×1.10 |
| `'custom'` | ×1.0 | ×1.0 | ×1.0 |

A preset never replaces a number you wrote, it only multiplies it. On `normal`
and `custom` the values in this file are used exactly as written.

---

## 3. `viewport` — how big the game is drawn

| Key | Type | Range | Effect |
|---|---|---|---|
| `maxRenderWidth` | number | 480–3840 | Cap on the pixels actually drawn. Lower is faster on a weak machine; the picture is scaled up to fit the screen |
| `maxPixelRatio` | number | 1–3 | Sharpness on a high-DPI screen. 1 is fastest, 2 is crisp, 3 is very crisp and slow |
| `letterbox` | true/false | — | `true` keeps the classic 4:3 shape with black bars; `false` fills the screen |

The old low/medium/high/fine choices map to `maxRenderWidth` 960 / 1280 / 1920 /
2560.

Filling a wide screen does **not** stretch the road. The projection uses the
window's width for horizontal field of view and `camera.fieldOfView` for the
vertical, and sprites scale with the same factor as the road, so the proportions
hold at any aspect ratio.

---

## 4. `colors` — any CSS colour

`'#10AA10'`, `'red'`, `'rgba(0,0,0,0.5)'` all work.

| Key | Effect |
|---|---|
| `sky` | The empty sky. Also the colour the canvas is cleared to each frame |
| `fog` | What the far distance fades into. Equal to `sky` gives a clean horizon; something dark gives a tunnel. Only visible when `fog.density` is above 0 |
| `road.light` / `road.dark` | The two alternating road stripes: `road`, `grass`, `rumble` and `lane` each |
| `start` | The white bands at the start line |
| `finish` | The black bands at the far end of the lap |

`lane` may be `null`, which turns lane markers off for that stripe. Setting both
`lane` values to `null`, or `track.lanes` to 1, gives a clean unmarked road - and
the game will point out that `lanes` is doing nothing if you turn off the markers
but leave the lane count above 1.

---

## 5. `background` — the parallax layers

| Key | Type | Effect |
|---|---|---|
| `image` | string | Which sheet the layers are cut from. `'background'` means `images/background.png`; anything containing a `/` is used as a real path |
| `layers` | list | Drawn in order, first line furthest away. An empty list gives a flat sky |

Each layer:

| Field | Type | Range | Effect |
|---|---|---|---|
| `slice` | string | `SKY`, `HILLS`, `TREES` | Which piece of the sheet to use |
| `speed` | number | 0–0.01 | How fast it slides sideways through a curve. 0 pins it |
| `image` | string | — | Optional: a different picture for this one layer |
| `rect` | `{x,y,w,h}` | — | Optional: where inside that picture the layer lives |
| `wrap` | true/false | — | The sheet's tiles sit side by side so they can slide forever. A plain photo is not doubled, so use `wrap: false` and it is stretched across the screen instead |

---

## 6. `player` — your car

| Key | Type | Range | Effect |
|---|---|---|---|
| `hue` | number | 0–360 | Rotates the car's red paint. 0 red, 30 orange, 120 green, 200 sky blue, 240 blue, 300 purple |
| `saturate` | number | 0–2 | 0 grey, 1 original, 2 neon |
| `brightness` | number | 0.3–2 | 0.5 dark, 1 original, 1.5 bright |
| `maxOffRoad` | number | 1–6 | How far off the road you may drift. Above 1 you are onto the grass |

The car artwork is drawn red and there is no other colour in the sprite sheet, so
this rotates the paint rather than choosing it: `hue: 240` is a blue car, but not
an exact hex of your choosing. On Safari, which has no `ctx.filter`, the result is
a colour wash over the car instead of a clean rotation.

---

## 7. `track` — the shape of the road

| Key | Type | Range | Effect |
|---|---|---|---|
| `preset` | string | `'blank'`, `'sections'` | `'blank'` is one long straight road. `'sections'` builds the track from the list below |
| `sections` | list | — | The track, one line per section |
| `roadWidth` | number | 500–4000 | Half the road's width. Bigger is a wider road |
| `segmentLength` | number | 50–500 | Length of one segment. Small is smoother and slower to draw, and also lowers your top speed |
| `rumbleLength` | number | 1–20 | Segments per red/white stripe. Higher is a lazier strobe |
| `lanes` | number | 1–6 | Painted lanes. 1 draws no lane markers at all |

A section:

| Field | Type | Range | Notes |
|---|---|---|---|
| `type` | string | see below | |
| `length` | number | 10–400 | Becomes **3× this many segments**. 25 short, 50 medium, 100 long, 200 very long. Default 50 |
| `curve` | number | −6…6 | How hard it bends. 2 easy, 4 medium, 6 hard, negative bends the other way. Default 0 |
| `hill` | number | −60…60 | How high it climbs. 20 low, 40 medium, 60 high, negative is downhill. Default 0 |
| `scale` | number | 0.25–4 | `sCurves` and `bumps` only: stretches the whole section |

Types: `straight`, `hill`, `curve`, `rollingHills`, `sCurves`, `bumps`,
`downhillToEnd`.

The shipped `sections` list reproduces the original track exactly, so
`preset: 'sections'` is how you get a real race track back from the blank
baseline.

> A track shorter than `camera.drawDistance` renders wrong: the renderer wraps
> around the segment list and the road comes out garbled. The game tells you the
> numbers if you go under.

---

## 8. `scenery` — everything beside the road

| Key | Type | Range | Effect |
|---|---|---|---|
| `density` | number | 0–5 | Master switch. 0 empties the roadside entirely, 1 is the normal amount, 2 is twice as busy |
| `palms` | number | 0–5 | Palm trees near the start |
| `columns` | number | 0–5 | Columns, and the trees beside them |
| `plants` | number | 0–5 | Random trees, bushes, cacti and boulders |
| `billboards` | number | 0–5 | Advertising boards, and the clusters of plants around them |

The four per-category values multiply on top of `density`, so `density: 2` with
`palms: 0` gives a busy roadside with no palms at all.

---

## 9. `rivals` — the other cars

| Key | Type | Range | Effect |
|---|---|---|---|
| `count` | number | 0–1000 | How many share the track. 0 is an empty road |
| `lookahead` | number | 5–60 | How far ahead they look before swerving. Small is twitchy, large is smooth |
| `sprites` | list | `CAR01`–`CAR04`, `SEMI`, `TRUCK` | Which vehicles may appear |
| `speedMin` | number | 0.05–1 | Slowest, as a fraction of your top speed |
| `speedMax` | number | 0.05–1 | Fastest ordinary car |
| `speedMaxHeavy` | number | 0.05–1 | Fastest `SEMI` and `TRUCK` |
| `collisions` | true/false | — | `false` lets you drive straight through them |

Rivals are placed at random positions, so a large `count` on a short track
bunches them up and costs frame rate. Around one rival per four segments is the
point where it starts to hurt, and the game says so.

---

## 10. `physics` — how the car feels

Every speed here is a fraction of **your** top speed, so the numbers keep their
meaning when you change `segmentLength` or the difficulty preset.

| Key | Range | Effect |
|---|---|---|
| `maxSpeedScale` | 0.1–2.0 | Your top speed. Above 1.0 the car can cover a whole segment in one frame and collisions start to be missed |
| `accel` | 0.05–1.0 | How hard the throttle pushes |
| `braking` | 0.1–2.0 | How hard the brake bites |
| `decel` | 0.01–1.0 | How quickly you coast to a stop |
| `offRoadDecel` | 0.05–1.0 | Extra slow-down on the grass |
| `offRoadLimit` | 0–1.0 | Below this speed the grass stops slowing you |
| `centrifugal` | 0–2.0 | How hard corners push you outwards. 0 and corners do nothing at all |
| `steerRate` | 0.5–6.0 | How fast the car moves sideways. High values feel twitchy |
| `spriteCrashSpeed` | 0–1.0 | The speed you drop to after hitting a tree |

---

## 11. `camera`

| Key | Range | Effect |
|---|---|---|
| `fieldOfView` | 40–160 | Vertical view angle in degrees. 40 zooms in, 160 is fisheye |
| `height` | 200–6000 | How far above the road you float. 500 is low and dramatic, 5000 is a helicopter |
| `drawDistance` | 50–600 | Segments drawn ahead. Much the cheapest performance lever there is |

---

## 12. `sprites`

| Key | Range | Effect |
|---|---|---|
| `scale` | 0.25–3 | Scales cars, trees and billboards - and their collision boxes with them, so the game stays fair |

---

## 13. `fog`

| Key | Range | Effect |
|---|---|---|
| `density` | 0–30 | 0 is perfectly clear, 5 is the original hazy horizon, 30 hides the next corner |

Fog is drawn in `colors.fog`. If that differs from `colors.sky` you get a visible
band along the horizon - sometimes exactly what you want, and the game mentions it
in the red box in case it is not.

---

## 14. `hud`

| Key | Type | Range | Effect |
|---|---|---|---|
| `enabled` | true/false | — | Show or hide the whole readout |
| `scale` | number | 0.4–3 | Text size |
| `showSpeed` / `showLapTime` / `showLastLap` / `showFastestLap` | true/false | — | Each readout individually |
| `speedUnit` | string | — | The label next to the number |
| `speedMultiplier`, `speedDivisor` | number | — | The number shown is `round(speed / speedDivisor) * speedMultiplier`. Change the label and the numbers together or the speedometer lies |

`showLastLap` hides the last-lap readout until you actually complete a lap.

---

## 15. `audio`

| Key | Type | Range | Effect |
|---|---|---|---|
| `enabled` | true/false | — | Turns the music off and hides the mute button |
| `volume` | number | 0–1 | 0.05 is the polite default. The soundtrack is loud |
| `loop` | true/false | — | |
| `src` | list | — | Tried in order; the first the browser can play wins |

The browser will not start audio until you interact with the page, which is one
more reason the game waits for a click before it begins.

---

## 16. `debug`

| Key | Type | Effect |
|---|---|---|
| `showConfigProblems` | true/false | The red box listing broken settings. Leave it on |
| `showFps` | true/false | Frame counter in the bottom-left corner |
