# GC Racing Game — GitWksp26Fa Group Project

## Activity Overview

**Activity Name**: GC Racing Game, built by configuration
**Objective**: Learn Git branch management, merge conflict resolution and team
collaboration by turning one deliberately boring game into a playable one
**Duration**: 1.5 hours for the core exercises, about 3 hours for all ten
**Group Size**: 3–4 people per group

You are not being asked to write a game. You are being asked to *change* one —
and to do it as a team, on branches, in a way that survives being merged.

The starting point is a car on a straight empty road. Nothing to look at, nobody
else on it. Everything about it — the road, the scenery, the traffic, the colours,
the weather, how the car handles — lives in a single file, and each of you will
own a different part of that file. Then you will merge each other's work, and
some of those merges will conflict, on purpose. Resolving them well is the skill
this project is actually about.

The finish line: every branch merged, every conflict resolved with everyone's
work still in it, every group member's name on the title card, and a tag `v1.0`
on the result.


## Activity Preparation

### 1. Environment setup

```bash
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"
```

Use the university address you use for the course git server — commits carry
whoever's name and address are configured here, and a wrong one is a nuisance to
unpick later.

### 2. Get the project

```bash
git clone <repository-url> racer
cd racer
```

Then open `index.html` in your browser — double-click it. Click the title card,
and drive with the arrow keys or W A S D. There is nothing to install and nothing
to build.

> If you want to make debugging easier, you can try
> `python3 -m http.server 8000` and open `http://localhost:8000/` instead: over
> HTTP the browser names the exact line when `config.js` fails to parse, which on
> a `file://` page it refuses to do.

### 3. Read the two documents that come with it

* [`docs/WORKSHOP.md`](docs/WORKSHOP.md) — the roles, the ten exercises and the
  git cheat sheet. This is the one to keep open.
* [`docs/CONFIG.md`](docs/CONFIG.md) — every setting, with its unit, its range
  and what it changes on screen.


## The rules of the project

**One rule matters more than the rest: you only ever edit `config.js`.** That is
the whole project. The game reads nothing else from you, and nothing else needs
to change.

A second rule, about how you work rather than what you change:

> **Your value always wins on `normal`.** The `difficulty` setting multiplies the
> numbers in the file, it never replaces them, so a number you typed and checked
> is a number you get.

If you break a setting, the game keeps running and puts a red box in the corner
telling you which line is wrong. If you break the whole file — a missing comma, a
leftover merge conflict marker — the page says so instead of going blank. You
cannot brick this permanently; that is deliberate, because a group of people
editing one file needs mistakes to be legible.

Check the red box whenever something looks wrong. It is almost always right, and
it names the line to go and look at.


## Roles

Four roles, four branches, four parts of `config.js`. Agree on who is who before
you start, because two of the exercises depend on two people wanting the same
line.

| Role | Owns | What they are building |
|---|---|---|
| **Driver** | `player`, `physics` | The car: its colour, its top speed, how it drifts through corners |
| **Track Engineer** | `track` | The road: straights, curves, hills, S-bends, width, lanes |
| **Scenery Artist** | `background`, `scenery`, `colors` | The world: sky, parallax layers, roadside trees, the whole palette |
| **Traffic Controller** | `rivals`, `fog`, `difficulty` | The other cars, the weather, how hard it is |

### The three arguments you are going to have

They are not accidents. Each is a different shape of conflict, from easy to real.

1. **`team.authors`** — everybody appends their own name to the same list.
   Trivial to resolve, and it teaches you what the markers mean. It also pays
   off: the names print on the title card, so the group can see its work.
2. **`team.intensity`** — one multiplier over scenery density, rival count *and*
   top speed. The Scenery Artist wants it higher to fill the world, the Traffic
   Controller wants it lower so the track is survivable, the Driver wants it
   higher because speed is fun. You cannot all be right. Decide together, then
   write down one number.
3. **`track.sections`** — two people adding sections to the same list. Small,
   adjacent conflicts: the most common shape you will meet in real work.

There is no trick to resolving any of them. Read both sides, decide what the game
should do, delete the markers, keep the result working. What you are practising
is the conversation, not the keystrokes.


## Detailed Activity Process

### Phase 1: Project launch (15 minutes)

```bash
git clone <repository-url>
cd racer
git log --oneline
```

Open `index.html`.

Confirm the game runs and that it is boring: a straight road, nothing beside it,
nobody else on it. If it looks broken you will spend the rest of the session
assuming *you* broke it, so settle that first.

### Phase 2: Individual work by role (30 minutes)

Each of you takes a branch named after your role, and works only inside the part
of `config.js` you own.

```bash
git switch -c feature/scenery      # or feature/track, feature/traffic, feature/drive-feel
```

```bash
git status                     # what have I touched?
git diff                       # what exactly did I change?
git add config.js
git commit -m "feat(scenery): thicken the roadside and add hills"
```

Commit messages follow `type(scope): what changed` — `feat`, `fix`, `docs`,
`style`, `refactor`, `test`, `chore`, with the part of `config.js` you touched as
the scope. Six months from now `git log --oneline` is the only documentation that
will still be true.

### Phase 3: Merge conflict experience (25 minutes)

```bash
git switch master
git merge feature/scenery
```

If nobody has touched `master` since you branched, that is a **fast-forward**: no
merge commit, the branch label just moves. Make a small change on `master` first
and merge again to see the other kind — two lines of history and a merge commit
that has to be built:

```bash
git log --graph --oneline --all --decorate
```

Sooner or later, two people edit the same line and git stops:

```
<<<<<<< HEAD
    intensity:             1.0,
=======
    intensity:             2.0,
>>>>>>> feature/traffic
```

### Phase 4: Conflict resolution (20 minutes)

1. `git status` to see which files are unmerged.
2. Open the file, find the markers.
3. Decide what the game should do — not who wins.
4. Delete `<<<<<<<`, `=======` and `>>>>>>>`, and leave exactly what you decided.
5. `git add config.js`, then `git commit`.
6. Reload the page. Does it still run?

Compare each other's work before merging it, too — that is what the review
question is for, and it is not "is this good code" but "does this do what the
message says, and does the game still run".

### Phase 5: Final integration and presentation (15 minutes)

```bash
git switch master
git merge feature/track
git merge feature/traffic
git tag v1.0 -m "group build"
git log --graph --oneline --all --decorate
git show v1.0 --stat
```

Show the group's game, then look at the graph you just made. Every branch, every
merge, every conflict you resolved is in that picture.


## Activity Checklist

### Preparation

- [ ] Git username and email configured
- [ ] Repository cloned, game runs, baseline confirmed boring
- [ ] Roles assigned, one branch per person
- [ ] `docs/WORKSHOP.md` open

### Execution

- [ ] All branches created
- [ ] Each role's part of `config.js` changed and committed
- [ ] Branches merged into `master`
- [ ] Merge conflict met and resolved
- [ ] Game still runs after every merge

### Conclusion

- [ ] Every group member's name on the title card
- [ ] `v1.0` tagged
- [ ] Work shown to the group
- [ ] Branches pushed, pull requests reviewed


## Teaching Points

### Git skills

1. **Branch management** — create, switch, list, delete
2. **Merge strategies** — fast-forward versus three-way, and when each happens
3. **Conflict resolution** — reading the markers, deciding, committing the result
4. **Undo** — `restore`, `reset --soft/--mixed/--hard`, `stash`
5. **History as a tool** — `log --graph`, `blame`, `bisect`

### Collaboration skills

1. **Communication** — agreeing on the shared number *before* you both change it
2. **Problem solving** — a conflict is a design decision someone has to make
3. **Quality assurance** — the config has units and ranges; out of range is a
   defect, not a style opinion, and the game will say so


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
nothing. Run `python3 tools/pack_sprites.py --apply` if you have swapped artwork.
It needs Python 3 and Pillow.


## Copyright and licence

Original game and engine by [Jake Gordon](https://github.com/jakesgordon/javascript-racer),
MIT licensed; music and placeholder sprite graphics remain under their own terms
as described in the upstream repository.
