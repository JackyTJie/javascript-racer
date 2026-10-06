# GC Racing Game — GitWksp26Fa Group Project

You are not being asked to write a game. You are being asked to *change* one — as a
team, on branches, in a way that survives being merged.

The starting point is a car on a straight empty road. Everything about it — the road,
the scenery, the traffic, the colours, the weather, how the car handles — lives in a
single file, and each of you will own a different part of that file. Then you merge
each other's work, and some of those merges will conflict, on purpose.


## Start here

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"   # your course git address
git clone <repository-url> racer
cd racer
```

Open `index.html` — double-click it. There is nothing to install and nothing to
build. Click the title card, then drive with the arrow keys or W A S D.

> Debugging is easier over HTTP: run `python3 -m http.server 8000` and open
> `http://localhost:8000/` instead. Over HTTP the browser names the exact line when
> `config.js` fails to parse; on a `file://` page it will not.


## Read these two

* [`docs/WORKSHOP.md`](docs/WORKSHOP.md) — the roles, the ten exercises and the git
  cheat sheet. This is the one to keep open.
* [`docs/CONFIG.md`](docs/CONFIG.md) — every setting, with its unit, its range and
  what it changes on screen.


## The one rule

**You only ever edit `config.js`.** That is the whole project. The game reads nothing
else from you, and nothing else needs to change.

Break a setting and the game keeps running, with a red box in the corner naming the
line that is wrong. Break the whole file — a missing comma, a leftover conflict
marker — and the page says so instead of going blank. You cannot brick this
permanently; that is deliberate, because a group of people editing one file needs its
mistakes to be legible. Check the red box whenever something looks wrong: it is
almost always right.


## Repository contents

```
index.html     the only page: a canvas, a HUD and the title card
config.js      >>> everything you are here to change <<<
game.js        the game itself, driven by config.js
common.js      the shared engine
style.css      the frame around the canvas
images/  music/
docs/          WORKSHOP.md (the exercises) and CONFIG.md (the settings)
tools/         pack_sprites.py - rebuilds images/sprites.png after changing
               the individual images in images/sprites/
legacy/        the original upstream game, kept for comparison
```

`pack_sprites.py` exists because the game loads `images/sprites.png` and not the
individual files under `images/sprites/`, so replacing those files alone changes
nothing. Run `python3 tools/pack_sprites.py --apply` if you have swapped artwork. It
needs Python 3 and Pillow.


## References

* [Git Installation](https://focs.gc.sjtu.edu.cn/git/tests/wksp-support/media/branch/master/Git-installation.pdf)
* [SSH Setup](https://focs.gc.sjtu.edu.cn/git/tests/wksp-support/wiki/SSH-Setup)
* [Worksheet](https://focs.gc.sjtu.edu.cn/git/tests/wksp-support/wiki/Worksheet)
* [Git commands reference table](https://focs.gc.sjtu.edu.cn/git/tests/wksp-support/wiki/Reference-Table)


## Copyright and licence

Original game and engine by [Jake Gordon](https://github.com/jakesgordon/javascript-racer),
MIT licensed; music and placeholder sprite graphics remain under their own terms
as described in the upstream repository.
