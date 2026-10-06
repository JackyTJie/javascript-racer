# Git workshop: build a game one commit at a time

**Group size** 3–4 per group, each person taking one role.
**Prerequisites** `git` installed, a browser, and the shell basics from the
lecture: `cd`, `ls`, `mkdir`, `cp`, `mv`, `rm`.

---

## The idea

You start with a game that works and is boring: a straight road, an empty
roadside, nobody else on it. Everything you can change about it lives in one
file, `config.js` - the track, the scenery, the traffic, the colours, the car, the
weather.

Each person owns one part of that file and one branch. You build your part, then
merge everyone's work together. Because you are all editing the same file, some
of those merges conflict - **on purpose**. Resolving them is the skill this
workshop is about.

The finish line: every branch merged into `master`, every conflict resolved with
everyone's work still in it, the authors' names on the title card, and a tag
`v1.0` on the result.

---

## Setup

    git clone <repository-url> racer
    cd racer

Open `index.html` — double-click it, there is nothing to install. Click the title
card to start. Arrow keys or W A S D to drive.

> If you want to make debugging easier, you can try
> `python3 -m http.server 8000` and open `http://localhost:8000/` instead.

Check your name and email before you commit anything:

    git config --global user.name  "Your Name"
    git config --global user.email "you@example.com"

---

## Roles

Four roles, four branches, four parts of `config.js`.

| Role | Owns | What they are building |
|---|---|---|
| **Driver** | `player`, `physics` | The car: its colour, its top speed, how it drifts through corners |
| **Track Engineer** | `track` | The road: straight, curves, hills, S-bends, width, lanes |
| **Scenery Artist** | `background`, `scenery`, `colors` | The world: sky, parallax layers, roadside trees, the whole palette |
| **Traffic Controller** | `rivals`, `fog`, `difficulty` | The other cars, the weather, how hard it is |

Work out who is who before you start, because two of the exercises depend on two
people wanting the same line.

### The three arguments you are going to have

Not accidents. Each one is a different shape of conflict, from easy to real.

1. **`team.authors`** — everybody appends their own name to the same list. Trivial
   to resolve, and it teaches you what the markers mean. It also pays off: the
   names are printed on the title card.
2. **`team.intensity`** — one multiplier over scenery density, rival count *and*
   top speed. The Scenery Artist wants it higher to fill the world, the Traffic
   Controller wants it lower so the track is survivable, the Driver wants it
   higher because speed is fun. You cannot all be right. Decide together, then
   write down one number.
3. **`track.sections`** — two people adding sections to the same list. The
   conflicts are small and adjacent, which is the most common real-world shape.

There is no trick to resolving any of them: read both sides, decide what the game
should do, delete the markers, keep the result working. What you are practising is
the conversation, not the keystrokes.

---

## The exercises

### 1. Warm-up — your name on the title card

Put your name in `config.js`, and see where it ends up.

```sh
git status                       # what have I touched?
git diff                         # what exactly did I change?
git add config.js
git commit -m "feat(team): add <your name> to the authors"
git log --oneline
```

Edit `team.authors` and `team.title`. Reload the page: your name is on the title
card. Then look at what git thinks you did:

```sh
git diff HEAD~1                  # your last commit, as a diff
git show                         # same thing, with the commit message
```

**Everyone does this on `master`, one after another**, pulling between turns.
The second person to commit will have to deal with the first person's line
already being there. That is exercise 4 arriving early - do not skip it.

### 2. How the car drives

```sh
git switch -c feature/drive-feel
```

As the **Driver**, change `physics.accel` and `physics.centrifugal`, reloading
between each. `centrifugal: 0` is worth trying once - corners stop pushing you
sideways entirely and the game becomes a different thing.

```sh
git add config.js
git commit -m "feat(physics): sharper acceleration, more drift in corners"
```

Learn to move between branches with your work intact:

```sh
git switch master
git switch feature/drive-feel
git branch --list
```

### 3. Repaint the car

Still on a branch. Change `player.hue`, `saturate` and `brightness` and watch the
car change colour. Try 240, then 120, then 30.

Now undo something on purpose. Make a change, look at it, decide you hate it:

```sh
git diff                         # see it
git restore config.js            # throw it away
```

And stage something by accident:

```sh
git add config.js
git restore --staged config.js   # put it back in the working directory
```

Then commit the colour you actually want.

### 4. Landscape it

```sh
git switch -c feature/scenery
```

As the **Scenery Artist**:

* `background.layers` — uncomment the three lines. That single change turns an
  empty sky into hills and trees.
* `scenery.density` — 0 is empty, 1 is as it ships, 3 is a forest.
* `colors.sky`, `colors.fog`, `colors.road.*` — set `fog` equal to `sky` for a
  clean horizon; make them differ for a moody tunnel.

Now merge it, and watch the two kinds of merge happen:

```sh
git switch master
git merge feature/scenery
```

If nobody has touched `master` since you branched, that is a **fast-forward**: no
merge commit, the branch label just moves. To see the other kind, make a small
change on `master` first, then merge - now git has two lines of history and has
to build a merge commit:

```sh
git log --graph --oneline --all
```

### 5. Build a track

```sh
git switch -c feature/track
```

As the **Track Engineer**, the whole road is yours:

```js
preset: 'sections',
```

and then edit the `sections` list. Start by deleting most of it and keeping one
straight, then add sections back one line at a time, reloading as you go:

```js
{ type: 'curve',        length: 50,  curve: 4,  hill: 0  },
{ type: 'sCurves',      scale: 1                         },
{ type: 'hill',         length: 50,  hill: 60            },
```

Change `track.lanes`, `track.roadWidth` and `track.rumbleLength` too. Wide roads
with a lot of lanes feel completely different from a narrow one.

Merge into `master`. If someone else also added a section to that list, you have
the adjacent-line conflict - resolve it by keeping **both** of your sections
unless you have a reason not to.

> Delete too much and the track becomes shorter than `camera.drawDistance`. The
> game will tell you the two numbers and what to do about it. That message is
> worth reading once; it is the same arithmetic you need for the exercise.

### 6. Traffic and weather

```sh
git switch -c feature/traffic
```

As the **Traffic Controller**: `rivals.count`, then `rivals.speedMin` and
`speedMax`, then `fog.density`. Try 5 for a hazy horizon.

And now the argument: change `team.intensity`. So does everyone else, for their
own reasons. Merge, hit the conflict on that single line, and settle it as a
group.

```sh
git switch master
git merge feature/traffic
```

### 7. The undo lab

Deliberately break things, then fix them with git rather than with your editor.
Run each of these once so that you have done it before you need it.

Break `config.js` on purpose - delete a comma, or paste a conflict marker in by
hand - and reload. The page tells you what is wrong and where.

```sh
git diff                         # what did I break?
git restore config.js            # fixed
```

Change three things, then realise you are on the wrong branch:

```sh
git stash                        # park everything
git switch feature/drive-feel
git stash pop                    # ...and pick it back up here
```

Commit something you regret:

```sh
git reset --soft HEAD~1          # undo the commit, keep the changes staged
git reset --mixed HEAD~1         # undo it, keep the changes unstaged
git log --oneline
```

`git reset --hard HEAD~1` throws the changes away as well. Know it exists, and be
careful with it.

### 8. Collaborate

Everyone pushes their branch - not just the merged result:

```sh
git push -u origin feature/scenery
git remote -v
git log origin/master..master    # what am I about to upload?
```

Open a pull request for each branch, review somebody else's, and merge it. The
review question is not "is this good code" but "does this do what the commit
message says, and does the game still run".

### 9. Release

```sh
git tag v1.0 -m "workshop build"
git log --graph --oneline --all --decorate
git show v1.0 --stat
```

Look at the graph you just made. Every branch, every merge, every conflict you
resolved is in that picture.

### 10. Who did this?

Somebody set `fog.density` to 999 and the horizon is gone. Do not read the file -
ask git.

```sh
git blame config.js
```

Every line, who last touched it, and in which commit. Then the harder question:
the game broke somewhere in the last twenty commits and you do not know which one.

```sh
git bisect start
git bisect bad                   # this commit is broken
git bisect good v1.0             # this one worked
# git checks out a commit in the middle; test it, then say:
git bisect good                  # or: git bisect bad
git bisect reset
```

`git bisect` is a binary search over your history. Ten commits, three or four
tests, and you are looking at the one that broke it. It is the single most
undervalued command in git.

---

## Cheat sheet

| Task | Command |
|---|---|
| What have I changed? | `git status`, `git diff` |
| Stage and commit | `git add config.js`, `git commit -m "feat(track): add an S-bend"` |
| Branch | `git switch -c feature/track`, `git switch master`, `git branch --list` |
| Merge | `git switch master` then `git merge feature/track` |
| Conflict: see it | `git status`, then open the file and look for `<<<<<<<` |
| Conflict: finish it | edit the file, `git add config.js`, `git commit` |
| Throw away my edits | `git restore config.js` |
| Unstage | `git restore --staged config.js` |
| Park work temporarily | `git stash` / `git stash pop` |
| Undo a commit | `git reset --soft HEAD~1` |
| Who wrote this line? | `git blame config.js` |
| Which commit broke it? | `git bisect start` / `good` / `bad` / `reset` |
| See the shape of history | `git log --graph --oneline --all --decorate` |

Commit messages follow `type(scope): what changed`, where the types are `feat`,
`fix`, `docs`, `style`, `refactor`, `test` and `chore`, and the scope is the part
of `config.js` you touched - `feat(scenery): thicken the roadside`. Six months
from now, `git log --oneline` is the only documentation that will still be true.

---

## Notes for the facilitator

**Before the session**

* Tag the starting point and confirm it: `git tag`, `git log --oneline`. Everyone
  clones the same commit.
* Check the baseline runs. It should be a plain straight road with nothing on it -
  boring, but obviously a working road. If it looks broken, teams will assume
  *they* broke it.
* Decide where the remote lives (a self-hosted git server, or a scratch
  organisation) and make sure everyone can push. Exercise 8 is the one that fails
  for environmental reasons.

**Things worth demonstrating live rather than explaining**

* Leave a conflict marker in `config.js` and reload. The page names the line. Ten
  seconds, and it removes the fear of the blank screen for the rest of the day.
* `git log --graph --oneline --all --decorate` after the first merge. The picture
  does more than the sentences.
* `git blame config.js` on a line somebody has just changed.

**Where groups get stuck**

* Editing `config.js` in one editor tab and reloading a *different* tab. Ask them
  to hard-reload.
* Resolving a conflict by keeping one side and deleting the other's work. Watch
  for this specifically: the check is "are all four names still on the title card
  at the end?"
* Committing with the wrong `user.name`, usually inherited from a shared machine.
  Exercise 1 is early enough to catch it.
* Forgetting that `git commit` after a conflict needs the file to be `git add`ed
  first. It is the one step everyone misses once.

**If the group is fast**

* `player.hue` on an old browser is a good argument for why feature detection
  matters: Safari has no `ctx.filter`, and the code falls back to washing a colour
  over the car instead.
* Have two teams merge each other's branches and race the results.
* Read `game.js`'s `validateWorld()` together - the checks are all arithmetic
  facts about the track (segments versus draw distance, top speed versus segment
  length) rather than opinions, which is a good conversation about what belongs in
  a linter.
