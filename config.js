// ============================================================================
//  config.js - THE ONLY FILE YOU NEED TO EDIT
// ============================================================================
//  Save this file, then reload the browser tab. There is no build step, no
//  compiler and no restart. What you write here is what the game does.
//
//  How to read this file:
//    * Every setting sits on its own line, so changing one value is one line in
//      `git diff` and two people editing different settings rarely collide.
//    * Every line ends with a comma. Do not delete the commas - they are what
//      makes adding and reordering lines conflict-free.
//    * Each comment tells you the unit, the sensible range, and what you will
//      actually see change on screen.
//    * If you type a setting name that does not exist, or a value outside its
//      range, the game keeps running and shows a red box in the corner telling
//      you which setting is wrong. A red box is never a crash.
//
//  If the page is completely blank, you probably have a syntax error - the most
//  common cause by far is a leftover merge conflict marker (<<<<<<<, ======= or
//  >>>>>>>) somewhere in this file. The page will tell you the line number.
// ============================================================================

window.RACER_CONFIG = {

  // --------------------------------------------------------------------------
  // 1. TEAM - who made this
  // --------------------------------------------------------------------------
  // Everyone edits this section, so expect conflicts here. That is the point:
  // resolve them, keep everybody's line, and your names appear on the title
  // card before the race starts.
  team: {
    // Shown in large letters on the title card and in the browser tab.
    title:                 'JavaScript Racer',

    // Add your own name on its own line. Keep every name - do not delete
    // anyone else's when you resolve the conflict!
    authors: [
      'Add your name here',
    ],

    // One shared multiplier for the whole game's "busy-ness". It scales the
    // scenery density, the number of rivals and your top speed all at once.
    // 0.5 = a calm Sunday drive, 1 = the shipped game, 2 = chaos. 0.25-3
    // Because everyone cares about this number, everyone changes it, and that
    // is exactly the kind of conflict worth talking through.
    intensity:             1.0,
  },


  // --------------------------------------------------------------------------
  // 2. DIFFICULTY - a preset that multiplies the rest of this file
  // --------------------------------------------------------------------------
  // 'easy' | 'normal' | 'hard' | 'custom'
  //   easy   = 0.75x top speed, half the rivals, rivals 15% slower
  //   normal = use exactly the numbers written in this file
  //   hard   = 1.25x top speed, double the rivals, rivals 10% faster
  //   custom = never scale anything, use exactly the numbers written here
  //
  // A preset never replaces your numbers, it only multiplies them, so the
  // value you typed on line 200 is still the value you get on 'normal'.
  difficulty:             'normal',


  // --------------------------------------------------------------------------
  // 3. VIEWPORT - how big the game is drawn
  // --------------------------------------------------------------------------
  viewport: {
    // The widest the game will ever render at, in pixels. Lower = smoother on
    // an old laptop, higher = crisper on a big screen. 480-3840
    // The old "low/medium/high/fine" choices were 960 / 1280 / 1920 / 2560.
    maxRenderWidth:       1920,

    // Sharpness on a high-DPI screen. 1 = fastest, 2 = crisp, 3 = very crisp
    // and slowest. 1-3
    maxPixelRatio:        2,

    // true  = keep the classic 4:3 shape with black bars down the sides
    // false = fill the whole screen
    letterbox:            false,
  },


  // --------------------------------------------------------------------------
  // 4. COLORS - any CSS color: '#10AA10', 'red', 'rgba(0,0,0,0.5)'
  // --------------------------------------------------------------------------
  colors: {
    // The empty sky behind everything. Also used to clear the screen each frame.
    sky:                  '#72D7EE',

    // What the far-away road fades into. Setting this equal to `sky` gives a
    // clean horizon. Setting it to something dark gives a tunnel/moody look -
    // but only if `fog.density` below is more than 0.
    fog:                  '#005108',

    // The road stripes alternate between these two every `track.rumbleLength`
    // segments. This is what makes the road look like it is moving.
    road: {
      light: {
        road:             '#6B6B6B',
        grass:            '#10AA10',
        rumble:           '#555555',
        lane:             '#CCCCCC',   // null = draw no lane markers here
      },
      dark: {
        road:             '#696969',
        grass:            '#009A00',
        rumble:           '#BBBBBB',
        lane:             null,
      },
    },

    // The white bands at the start line.
    start: {
      road:               'white',
      grass:              'white',
      rumble:             'white',
    },

    // The black bands at the far end of the lap.
    finish: {
      road:               'black',
      grass:              'black',
      rumble:             'black',
    },
  },


  // --------------------------------------------------------------------------
  // 5. BACKGROUND - the parallax layers behind the road
  // --------------------------------------------------------------------------
  background: {
    // Which sprite sheet the layers are cut from. 'background' means
    // images/background.png. Any value containing a '/' is treated as a real
    // path, so 'images/my_background.png' also works.
    image:                'background',

    // Drawn in this order, first line = furthest away. Delete a line to remove
    // a layer; an empty list [] gives you a flat sky and nothing else.
    //   slice: a name from images/background.js - SKY, HILLS or TREES
    //   speed: how fast the layer slides sideways when you go round a curve.
    //          0 = painted on, 0.01 = racing past. 0-0.01
    // Optional extras on any layer:
    //   image: use a different picture for this one layer, e.g.
    //          { slice: 'SKY', speed: 0.001, image: 'images/night_sky.png' }
    //   wrap:  the sheet's tiles are drawn twice side by side so they can slide
    //          forever. A plain photo is not doubled, so set wrap: false and it
    //          will be stretched across the screen instead.
    layers: [
      { slice: 'SKY',     speed: 0.001 },
      { slice: 'HILLS',   speed: 0.002 },
      { slice: 'TREES',   speed: 0.003 },
    ],
  },


  // --------------------------------------------------------------------------
  // 6. PLAYER - your car
  // --------------------------------------------------------------------------
  player: {
    // The car artwork is drawn red. These three settings rotate and adjust that
    // red, they cannot turn it into an exact hex colour - think "recolour the
    // paint", not "pick a pantone".
    //   hue:        0 = original red, 120 = green, 240 = blue, 30 = orange,
    //               200 = sky blue, 300 = purple. 0-360
    //   saturate:   0 = grey, 1 = original, 2 = neon. 0-2
    //   brightness: 0.5 = dark, 1 = original, 1.5 = bright. 0.3-2
    hue:                   0,
    saturate:              1.0,
    brightness:            1.0,

    // How far off the road you may drift before the game stops you. 1-6
    maxOffRoad:            3,
  },


  // --------------------------------------------------------------------------
  // 7. TRACK - the shape of the road
  // --------------------------------------------------------------------------
  track: {
    // 'blank'    = one long straight road and nothing else - the workshop start
    // 'sections' = build the track from the `sections` list below. The list as
    //              shipped reproduces the original track exactly, so this is
    //              also how you get the original track back.
    preset:                'sections',

    // Each section is one line, so two people editing different parts of the
    // track get a small, readable conflict rather than a mess. Delete a line to
    // drop that part of the track, or add your own line anywhere in the list.
    //
    //   type:   'straight'     flat and straight, the do-nothing section
    //           'hill'         climbs or drops
    //           'curve'        bends left or right
    //           'rollingHills' a run of gentle ups and downs
    //           'sCurves'      a fast left-right-left sequence
    //           'bumps'        a short bumpy patch
    //           'downhillToEnd' a long run down to the finish line
    //   length: roughly how big the section is; it becomes 3x this many road
    //           segments. 25 = short, 50 = medium, 100 = long, 200 = very long.
    //           You can leave it out and get 50. 10-400
    //   curve:  how hard it bends. 2 = easy, 4 = medium, 6 = hard,
    //           negative = the other way. You can leave it out and get 0.
    //           -6 to 6
    //   hill:   how high it climbs. 20 = low, 40 = medium, 60 = high,
    //           negative = downhill. You can leave it out and get 0. -60 to 60
    //   scale:  ('sCurves' and 'bumps' only) stretches the section.
    //           0.5 = half as long, 2 = twice as long. 0.25-4
    sections: [
      { type: 'straight',     length: 25  },
      { type: 'rollingHills', length: 25,  hill: 20 },
      { type: 'sCurves',      scale: 1 },
      { type: 'curve',        length: 50,  curve: 4,   hill: 20 },
      { type: 'bumps',        scale: 1 },
      { type: 'rollingHills', length: 25,  hill: 20 },
      { type: 'curve',        length: 200, curve: 4,   hill: 40 },
      { type: 'straight',     length: 50  },
      { type: 'hill',         length: 50,  hill: 60 },
      { type: 'sCurves',      scale: 1 },
      { type: 'curve',        length: 100, curve: -4,  hill: 0 },
      { type: 'hill',         length: 100, hill: 60 },
      { type: 'curve',        length: 100, curve: 4,   hill: -20 },
      { type: 'bumps',        scale: 1 },
      { type: 'hill',         length: 100, hill: -40 },
      { type: 'straight',     length: 50  },
      { type: 'sCurves',      scale: 1 },
      { type: 'downhillToEnd',length: 200 },
    ],

    // Half the actual road width, in world units. Bigger = a wider road.
    // 500-4000
    roadWidth:             2000,

    // Length of one road segment, in world units. Smaller = a smoother road
    // but more segments to draw, and it also changes your top speed. 50-500
    segmentLength:         200,

    // How many segments each red/white rumble stripe covers. 1-20
    rumbleLength:          3,

    // Painted lanes. 1 = no lane markers at all. 1-6
    lanes:                 3,
  },


  // --------------------------------------------------------------------------
  // 8. SCENERY - everything beside the road
  // --------------------------------------------------------------------------
  scenery: {
    // The master switch for roadside objects. 0 = a completely empty roadside.
    // 1 = the normal amount, 2 = twice as busy. 0-5
    density:              1.0,

    // Per-category multipliers on top of `density`. 0 removes that category
    // entirely. 0-5
    palms:                1.0,   // palm trees near the start
    columns:              1.0,   // columns and the trees beside them
    plants:               1.0,   // random trees, bushes, cacti and boulders
    billboards:           1.0,   // advertising boards (and the plants around them)
  },


  // --------------------------------------------------------------------------
  // 9. RIVALS - the other cars on the road
  // --------------------------------------------------------------------------
  rivals: {
    // How many cars share the track with you. 0 = an empty road. 0-1000
    count:                200,

    // How far ahead a rival looks before deciding to swerve around something.
    // Small = twitchy drivers, large = smoother but slower. 5-60
    lookahead:            20,

    // Which vehicles may appear. Any of these names, from images/sprites.js:
    // CAR01  CAR02  CAR03  CAR04  SEMI  TRUCK
    sprites:              ['CAR01', 'CAR02', 'CAR03', 'CAR04', 'SEMI', 'TRUCK'],

    // Their speeds, as a fraction of your own top speed. The SEMI and TRUCK are
    // capped separately because a lorry that overtakes you is just rude.
    // 0.05-1.0
    speedMin:             0.25,
    speedMax:             0.75,
    speedMaxHeavy:        0.50,

    // true  = hitting a rival slows you both down
    // false = you drive straight through them
    collisions:           true,
  },


  // --------------------------------------------------------------------------
  // 10. PHYSICS - how the car feels
  // --------------------------------------------------------------------------
  //  Every speed here is a fraction of your top speed, so 0.2 always means
  //  "one fifth of whatever my top speed is".
  physics: {
    // Your top speed. Above 1.0 the car can jump past a rival in a single frame
    // and collisions start to be missed. 0.1-2.0
    maxSpeedScale:        1.0,

    accel:                0.2,    // how hard the throttle pushes. 0.05-1.0
    braking:              1.0,    // how hard the brake bites. 0.1-2.0
    decel:                0.2,    // how quickly you coast to a stop. 0.01-1.0
    offRoadDecel:         0.5,    // extra slow-down on the grass. 0.05-1.0
    offRoadLimit:         0.25,   // below this speed the grass stops slowing you. 0-1.0
    centrifugal:          0.3,    // how hard curves push you outwards. 0-2.0
    steerRate:            2.0,    // how fast the car moves sideways. 0.5-6.0
    spriteCrashSpeed:     0.2,    // your speed after hitting a roadside object. 0-1.0
  },


  // --------------------------------------------------------------------------
  // 11. CAMERA
  // --------------------------------------------------------------------------
  camera: {
    // Vertical field of view, in degrees. 40 = zoomed right in,
    // 160 = fisheye. 40-160
    fieldOfView:          100,

    // How far above the road you float. 500 = low and dramatic,
    // 5000 = a helicopter. 200-6000
    height:               1000,

    // How many road segments are drawn ahead of you. Lower = much faster on a
    // slow machine. 50-600
    drawDistance:         300,
  },


  // --------------------------------------------------------------------------
  // 12. SPRITES - the size of every object in the world
  // --------------------------------------------------------------------------
  sprites: {
    // Scales the cars, trees and billboards - and their collision boxes with
    // them, so the game stays fair. 0.25-3
    scale:                1.0,
  },


  // --------------------------------------------------------------------------
  // 13. FOG - how quickly the distance disappears
  // --------------------------------------------------------------------------
  fog: {
    // 0 = perfectly clear, you can see the whole draw distance.
    // 5 = the original hazy horizon. 30 = you cannot see the next corner. 0-30
    density:              5,
  },


  // --------------------------------------------------------------------------
  // 14. HUD - the numbers on the screen
  // --------------------------------------------------------------------------
  hud: {
    enabled:              true,
    scale:                1.0,     // 0.5 = tiny, 2 = huge. 0.4-3

    showSpeed:            true,
    showLapTime:          true,
    showLastLap:          true,
    showFastestLap:       true,

    // The speed readout is `round(speed / speedDivisor) * speedMultiplier`.
    // Change the label and the numbers together, or your speedometer lies.
    speedUnit:            'mph',
    speedMultiplier:      5.0,
    speedDivisor:         500.0,
  },


  // --------------------------------------------------------------------------
  // 15. AUDIO
  // --------------------------------------------------------------------------
  audio: {
    enabled:              true,
    volume:               0.05,    // 0-1. This music is loud; 0.05 is polite.
    loop:                 true,

    // Tried in order; the first one the browser can play wins.
    src: [
      'music/racer.ogg',
      'music/racer.mp3',
    ],
  },


  // --------------------------------------------------------------------------
  // 16. DEBUG - for when something looks wrong
  // --------------------------------------------------------------------------
  debug: {
    // List broken, missing or clamped settings in a red box in the corner.
    // Leave this on unless the box is in your way.
    showConfigProblems:   true,

    // A small frames-per-second counter in the bottom left.
    showFps:              false,
  },

};
