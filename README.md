Javascript Pseudo 3D Racer
==========================

An Outrun-style pseudo-3d racing game in HTML5 and Javascript, by
[Jake Gordon](https://jakesgordon.com/writing/javascript-racer/), rearranged so
that the whole game is controlled by a single configuration file.

**One page, one config file.** Open `index.html`, click once, and you are
driving fullscreen. Everything about how the game looks, drives and feels lives
in `config.js`.


Running it
----------

Open `index.html` in a browser. That is the whole story - there is no build step,
no package manager and no server required.

A local server is still worth using, for one reason: on a `file://` page the
browser hides the details of a broken `config.js`, and over `http://` it tells
you the exact line number.

    python3 -m http.server 8000
    # then open http://localhost:8000/

Drive with the arrow keys or W A S D. `M`-click the speaker in the corner to mute.


Where the game lives
--------------------

    index.html     the only page: a canvas, a HUD and the title card
    config.js      >>> everything you would ever want to change <<<
    game.js        the game itself, driven by config.js
    common.js      the shared engine: maths, projection, rendering primitives
    style.css      the frame around the canvas
    images/  music/  the artwork and the soundtrack
    legacy/        the original v4 game, kept for comparison
    docs/          the workshop handout and the full list of settings


Two ways to run the original
----------------------------

The repository used to hold four standalone demos - `v1.straight.html`,
`v2.curves.html`, `v3.hills.html` and `v4.final.html`. The first three are gone
and the fourth moved to `legacy/`. Both are one command away:

    git show original-racer:v1.straight.html > /tmp/v1.html   # any of the four
    open legacy/v4.final.html                                 # the original game

`original-racer` is a tag on the commit before any of this was rearranged, so
deleting those files lost nothing. That is rather the point.


Settings, briefly
-----------------

`config.js` is commented line by line: every setting says what it does, its unit
and its sensible range. The full reference, with the effect of each value on
screen, is in [docs/CONFIG.md](docs/CONFIG.md).

If you break a setting the game keeps running and shows a red box in the corner
telling you which line is wrong. If you break the whole file - a missing comma, a
leftover merge conflict marker - the page says so instead of going blank.

Things worth knowing before you change them:

  * **Car colour is a rotation, not a paint code.** The car artwork is drawn red,
    and `player.hue` rotates that red: 0 is the original, 120 green, 240 blue.
    There is no blue car in the sprite sheet to switch to.
  * **`difficulty` multiplies, it never replaces.** On `normal` (and `custom`)
    the numbers in the file are used exactly as written; `easy` and `hard` scale
    them. Your value always wins on `normal`.
  * **`fps` is deliberately not a setting.** It is the simulation timestep, and
    top speed is derived from it, so changing it changes collision behaviour.
  * **Track sections are 3 segments per unit of `length`**, so
    `{ type: 'curve', length: 50 }` adds 150 segments. A track shorter than
    `camera.drawDistance` renders wrong, and the game will tell you.


The workshop
------------

This repository is the starting point for a git workshop: teams of three or four
use branches, merges, conflicts and the undo commands to turn the deliberately
boring baseline - a straight road, an empty roadside, nobody else on it - into a
game of their own, editing only `config.js`.

The handout, the roles and the exercise list are in
[docs/WORKSHOP.md](docs/WORKSHOP.md).


A note on performance
---------------------

Performance is machine and browser dependent, as it always was. Two settings do
the heavy lifting: `viewport.maxRenderWidth` caps how many pixels are drawn (the
old low/medium/high/fine choices were 960 / 1280 / 1920 / 2560) and
`camera.drawDistance` caps how much of the road is drawn. `debug.showFps` puts a
frame counter in the corner.

Mobile browsers remain a poor fit for this game and there are no touch controls.


Credits and licence
-------------------

Original game and engine by [Jake Gordon](https://github.com/jakesgordon/javascript-racer),
[MIT](http://en.wikipedia.org/wiki/MIT_License) licensed. The section of this
README that used to list what an unfinished racing game still needs is preserved
in the git history - several of those ideas are now a one-line change in
`config.js`.

>> NOTE: the music tracks included in this project are royalty free resources paid for and licensed
from [Lucky Lion Studios](http://luckylionstudios.com/). They are licensed ONLY for use in this
project and should not be reproduced.

>> NOTE: the sprite graphics are placeholder graphics [borrowed](http://pixel.garoux.net/game/44) from the old
genesis version of outrun and used here as teaching examples.
