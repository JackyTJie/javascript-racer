//=============================================================================
// game.js - the game itself
//=============================================================================
// Everything in this file was extracted verbatim from the inline <script> block
// of v4.final.html so that it can be read, diffed and reviewed as a normal file.
// Behaviour is unchanged: this is a pure extraction.
//
// The values you are meant to change live in config.js, NOT here.
//=============================================================================


//=============================================================================
// CONFIG - read config.js and turn it into the variables the game uses
//=============================================================================

// Difficulty presets. A preset only ever MULTIPLIES the numbers you wrote in
// config.js, so 'normal' always means "exactly my numbers".
var DIFFICULTY = {
  easy:   { speed: 0.75, rivals: 0.5, rivalSpeed: 0.85 },
  normal: { speed: 1.00, rivals: 1.0, rivalSpeed: 1.00 },
  hard:   { speed: 1.25, rivals: 2.0, rivalSpeed: 1.10 },
  custom: { speed: 1.00, rivals: 1.0, rivalSpeed: 1.00 }
};

// Reads config.js. Every accessor remembers when it had to fall back to a
// default or clamp a value: because the shipped config.js contains every single
// key, a missing key is always a typo or a bad merge, never a valid choice.
var Config = (function() {

  var raw     = window.RACER_CONFIG || {};
  var missing = [];
  var clamped = [];

  function get(path) {
    var parts = path.split('.');
    var node  = raw;
    for (var i = 0 ; i < parts.length ; i++) {
      if ((node === null) || (typeof node !== 'object') || !(parts[i] in node))
        return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  function absent(path, value) {
    if (value === undefined)
      missing.push(path + ' is missing - using the default');
    else
      missing.push(path + ' is not the right kind of value - using the default');
  }

  return {

    raw:     raw,
    missing: missing,
    clamped: clamped,

    has:  function(path) { return get(path) !== undefined; },
    path: function(path) { return get(path); },

    num: function(path, def, min, max) {
      var v = get(path);
      if ((typeof v !== 'number') || isNaN(v)) { absent(path, v); return def; }
      if ((min !== undefined) && (v < min)) { clamped.push(path + ' = ' + v + ' is below the minimum of ' + min); return min; }
      if ((max !== undefined) && (v > max)) { clamped.push(path + ' = ' + v + ' is above the maximum of ' + max); return max; }
      return v;
    },

    int: function(path, def, min, max) {
      return Math.round(this.num(path, def, min, max));
    },

    bool: function(path, def) {
      var v = get(path);
      if (typeof v !== 'boolean') { absent(path, v); return def; }
      return v;
    },

    str: function(path, def) {
      var v = get(path);
      if (typeof v !== 'string') { absent(path, v); return def; }
      return v;
    },

    list: function(path, def) {
      var v = get(path);
      if (!(v instanceof Array)) { absent(path, v); return def; }
      return v;
    },

    obj: function(path, def) {
      var v = get(path);
      if ((v === null) || (typeof v !== 'object') || (v instanceof Array)) { absent(path, v); return def; }
      return v;
    },

    // A {road, grass, rumble, ...} block of colors, filling in anything missing.
    colors: function(path, def) {
      var v = get(path), out = {}, key;
      if ((v === null) || (typeof v !== 'object') || (v instanceof Array)) { absent(path, v); v = {}; }
      for (key in def)
        out[key] = (typeof v[key] === 'string') ? v[key] : def[key];
      return out;
    },

    // A color that is allowed to be switched off with null.
    lane: function(path, def) {
      var v = get(path);
      if (v === null) return null;
      if (typeof v === 'string') return v;
      absent(path, v);
      return def;
    },

    problems: function() { return missing.concat(clamped); }

  };

})();

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// A red box in the corner listing every setting we had to guess at. This is the
// difference between "my config did nothing" and "config.js line 42 is wrong".
function showProblems() {
  var wanted = Config.bool('debug.showConfigProblems', true);
  var problems = Config.problems();
  if (!wanted || (problems.length === 0))
    return;

  var box = document.createElement('div');
  box.id = 'problems';
  var html = '<b>' + problems.length + ' problem' + (problems.length === 1 ? '' : 's') + ' in config.js</b><ul>';
  for (var i = 0 ; i < problems.length ; i++)
    html += '<li>' + escapeHtml(problems[i]) + '</li>';
  box.innerHTML = html + '</ul>';
  document.body.appendChild(box);
}

// A fatal problem we cannot drive through, like config.js not parsing at all.
function showFatal(title, detail) {
  var box = document.createElement('div');
  box.id = 'problems';
  box.className = 'fatal';
  box.innerHTML = '<b>' + escapeHtml(title) + '</b><p>' + escapeHtml(detail) + '</p>';
  document.body.appendChild(box);
}

// Did config.js actually run? If it has a syntax error the browser never
// executes it, so there is nothing to read and nothing worth starting.
var configLoaded = (window.RACER_CONFIG !== undefined);

function explainConfigFailure() {
  var boot   = window.__bootError;
  var detail = '';
  if (boot && boot.message && (boot.message !== 'Script error.'))
    detail = boot.line ? 'config.js line ' + boot.line + ': ' + boot.message + '. '
                       : boot.message + '. ';
  else
    detail = 'The browser will not say why for a file:// page. ';
  showFatal('config.js could not be loaded', detail +
    'Open config.js in an editor and look for a syntax error. The usual cause, by a long way, is a leftover merge ' +
    'conflict marker - a line starting with <<<<<<<, ======= or >>>>>>> - or a missing comma at the end of a line.');
}

var cfg  = Config.raw;
var DIFF = DIFFICULTY.normal;   // replaced in applyConfig

//=============================================================================
// GAME STATE
//=============================================================================

    var fps            = 60;                      // fixed: this is the simulation timestep, and top speed is derived from it
    var step           = 1/fps;                   // how long is each frame (in seconds)
    var width          = 1024;                    // logical canvas width  (replaced by the real viewport at boot)
    var height         = 768;                     // logical canvas height (replaced by the real viewport at boot)
    var segments       = [];                      // array of road segments
    var cars           = [];                      // array of cars on the road
    var stats          = Dom.get('fps') ? Game.stats('fps') : null; // mr.doobs FPS counter, when the page has a slot for it
    var canvas         = Dom.get('canvas');       // our canvas...
    var ctx            = canvas.getContext('2d'); // ...and its drawing context
    var background     = null;                    // our background image (loaded below)
    var sprites        = null;                    // our spritesheet (loaded below)
    var resolution     = null;                    // scaling factor to provide resolution independence (computed)
    var trackLength    = null;                    // z length of entire track (computed)
    var cameraDepth    = null;                    // z distance camera is from screen (computed)
    var playerX        = 0;                       // player x offset from center of road (-1 to 1 to stay independent of roadWidth)
    var playerZ        = null;                    // player relative z distance from camera (computed)
    var position       = 0;                       // current camera Z position (add playerZ to get player's absolute Z position)
    var speed          = 0;                       // current speed
    var currentLapTime = 0;                       // current lap time
    var lastLapTime    = null;                    // last lap time

    // everything from here down is filled in from config.js by applyConfig()
    var intensity         = 1;                    // team.intensity, read once
    var centrifugal       = 0.3;                  // centrifugal force multiplier when going around curves
    var offRoadDecel      = -1;                   // off road deceleration
    var offRoadLimit      = 1;                    // limit when off road deceleration no longer applies
    var maxSpeed          = 1;                    // top speed
    var accel             = 1;                    // acceleration rate
    var breaking          = -1;                   // deceleration rate when braking
    var decel             = -1;                   // 'natural' deceleration rate
    var steerRate         = 2;                    // how fast the car moves sideways
    var spriteCrashSpeed  = 0.2;                  // speed after hitting a roadside object
    var roadWidth         = 2000;                 // actually half the roads width, easier math if the road spans from -roadWidth to +roadWidth
    var segmentLength     = 200;                  // length of a single segment
    var rumbleLength      = 3;                    // number of segments per red/white rumble strip
    var lanes             = 3;                    // number of lanes
    var fieldOfView       = 100;                  // angle (degrees) for field of view
    var cameraHeight      = 1000;                 // z height of camera
    var drawDistance      = 300;                  // number of segments to draw
    var fogDensity        = 5;                    // exponential fog density
    var maxOffRoad        = 3;                    // how far off the road we let the player drift
    var rivalCount        = 200;                  // total number of cars on the road
    var rivalLookahead    = 20;                   // how far ahead the AI looks
    var rivalSprites      = [];                   // which vehicles the AI may drive
    var rivalSpeedMin     = 0.25;                 // rival speeds, as a fraction of our top speed
    var rivalSpeedMax     = 0.75;
    var rivalSpeedMaxHeavy= 0.50;
    var rivalCollisions   = true;                 // false = drive straight through them
    var scenery           = { density: 1, palms: 1, columns: 1, plants: 1, billboards: 1 };
    var backgroundLayers  = [];                   // [{image, imageName, rect, speed, wrap, offset}]
    var trackPreset       = 'sections';
    var trackSections     = [];
    var hudConfig         = { enabled: true, scale: 1, showSpeed: true, showLapTime: true, showLastLap: true, showFastestLap: true, speedUnit: 'mph', speedMultiplier: 5, speedDivisor: 500 };
    var audioConfig       = { enabled: true, volume: 0.05, loop: true, src: [] };

    var keyLeft        = false;
    var keyRight       = false;
    var keyFaster      = false;
    var keySlower      = false;

    var hud = {
      speed:            { value: null, dom: Dom.get('speed_value')            },
      current_lap_time: { value: null, dom: Dom.get('current_lap_time_value') },
      last_lap_time:    { value: null, dom: Dom.get('last_lap_time_value')    },
      fast_lap_time:    { value: null, dom: Dom.get('fast_lap_time_value')    }
    }

    //=========================================================================
    // UPDATE THE GAME WORLD
    //=========================================================================

    function update(dt) {

      var n, car, carW, sprite, spriteW;
      var playerSegment = findSegment(position+playerZ);
      var playerW       = SPRITES.PLAYER_STRAIGHT.w * SPRITES.SCALE;
      var speedPercent  = speed/maxSpeed;
      var dx            = dt * steerRate * speedPercent; // at top speed, should be able to cross from left to right (-1 to 1) in 1 second
      var startPosition = position;

      updateCars(dt, playerSegment, playerW);

      position = Util.increase(position, dt * speed, trackLength);

      if (keyLeft)
        playerX = playerX - dx;
      else if (keyRight)
        playerX = playerX + dx;

      playerX = playerX - (dx * speedPercent * playerSegment.curve * centrifugal);

      if (keyFaster)
        speed = Util.accelerate(speed, accel, dt);
      else if (keySlower)
        speed = Util.accelerate(speed, breaking, dt);
      else
        speed = Util.accelerate(speed, decel, dt);


      if ((playerX < -1) || (playerX > 1)) {

        if (speed > offRoadLimit)
          speed = Util.accelerate(speed, offRoadDecel, dt);

        for(n = 0 ; n < playerSegment.sprites.length ; n++) {
          sprite  = playerSegment.sprites[n];
          spriteW = sprite.source.w * SPRITES.SCALE;
          if (Util.overlap(playerX, playerW, sprite.offset + spriteW/2 * (sprite.offset > 0 ? 1 : -1), spriteW)) {
            speed = spriteCrashSpeed;
            position = Util.increase(playerSegment.p1.world.z, -playerZ, trackLength); // stop in front of sprite (at front of segment)
            break;
          }
        }
      }

      for(n = 0 ; (n < playerSegment.cars.length) && rivalCollisions ; n++) {
        car  = playerSegment.cars[n];
        carW = car.sprite.w * SPRITES.SCALE;
        if (speed > car.speed) {
          if (Util.overlap(playerX, playerW, car.offset, carW, 0.8)) {
            speed    = car.speed * (car.speed/speed);
            position = Util.increase(car.z, -playerZ, trackLength);
            break;
          }
        }
      }

      playerX = Util.limit(playerX, -maxOffRoad, maxOffRoad); // dont ever let it go too far out of bounds
      speed   = Util.limit(speed, 0, maxSpeed); // or exceed maxSpeed

      for(n = 0 ; n < backgroundLayers.length ; n++)
        backgroundLayers[n].offset = Util.increase(backgroundLayers[n].offset, backgroundLayers[n].speed * playerSegment.curve * (position-startPosition)/segmentLength, 1);

      if (position > playerZ) {
        if (currentLapTime && (startPosition < playerZ)) {
          lastLapTime    = currentLapTime;
          currentLapTime = 0;
          if (lastLapTime <= Util.toFloat(Dom.storage.fast_lap_time)) {
            Dom.storage.fast_lap_time = lastLapTime;
            updateHud('fast_lap_time', formatTime(lastLapTime));
            Dom.addClassName('fast_lap_time', 'fastest');
            Dom.addClassName('last_lap_time', 'fastest');
          }
          else {
            Dom.removeClassName('fast_lap_time', 'fastest');
            Dom.removeClassName('last_lap_time', 'fastest');
          }
          updateHud('last_lap_time', formatTime(lastLapTime));
          if (hudConfig.showLastLap) {
            var lastLap = Dom.get('last_lap_time');
            if (lastLap) lastLap.style.display = '';
          }
        }
        else {
          currentLapTime += dt;
        }
      }

      updateHud('speed',            hudConfig.speedMultiplier * Math.round(speed/hudConfig.speedDivisor));
      updateHud('current_lap_time', formatTime(currentLapTime));
    }

    //-------------------------------------------------------------------------

    function updateCars(dt, playerSegment, playerW) {
      var n, car, oldSegment, newSegment;
      for(n = 0 ; n < cars.length ; n++) {
        car         = cars[n];
        oldSegment  = findSegment(car.z);
        car.offset  = car.offset + updateCarOffset(car, oldSegment, playerSegment, playerW);
        car.z       = Util.increase(car.z, dt * car.speed, trackLength);
        car.percent = Util.percentRemaining(car.z, segmentLength); // useful for interpolation during rendering phase
        newSegment  = findSegment(car.z);
        if (oldSegment != newSegment) {
          index = oldSegment.cars.indexOf(car);
          oldSegment.cars.splice(index, 1);
          newSegment.cars.push(car);
        }
      }
    }

    function updateCarOffset(car, carSegment, playerSegment, playerW) {

      var i, j, dir, segment, otherCar, otherCarW, lookahead = rivalLookahead, carW = car.sprite.w * SPRITES.SCALE;

      // optimization, dont bother steering around other cars when 'out of sight' of the player
      if ((carSegment.index - playerSegment.index) > drawDistance)
        return 0;

      for(i = 1 ; i < lookahead ; i++) {
        segment = segments[(carSegment.index+i)%segments.length];

        if ((segment === playerSegment) && (car.speed > speed) && (Util.overlap(playerX, playerW, car.offset, carW, 1.2))) {
          if (playerX > 0.5)
            dir = -1;
          else if (playerX < -0.5)
            dir = 1;
          else
            dir = (car.offset > playerX) ? 1 : -1;
          return dir * 1/i * (car.speed-speed)/maxSpeed; // the closer the cars (smaller i) and the greated the speed ratio, the larger the offset
        }

        for(j = 0 ; j < segment.cars.length ; j++) {
          otherCar  = segment.cars[j];
          otherCarW = otherCar.sprite.w * SPRITES.SCALE;
          if ((car.speed > otherCar.speed) && Util.overlap(car.offset, carW, otherCar.offset, otherCarW, 1.2)) {
            if (otherCar.offset > 0.5)
              dir = -1;
            else if (otherCar.offset < -0.5)
              dir = 1;
            else
              dir = (car.offset > otherCar.offset) ? 1 : -1;
            return dir * 1/i * (car.speed-otherCar.speed)/maxSpeed;
          }
        }
      }

      // if no cars ahead, but I have somehow ended up off road, then steer back on
      if (car.offset < -0.9)
        return 0.1;
      else if (car.offset > 0.9)
        return -0.1;
      else
        return 0;
    }

    //-------------------------------------------------------------------------

    function updateHud(key, value) { // accessing DOM can be slow, so only do it if value has changed
      if (!hudConfig.enabled || !hud[key])
        return;
      if (hud[key].value !== value) {
        hud[key].value = value;
        Dom.set(hud[key].dom, value);
      }
    }

    function formatTime(dt) {
      var minutes = Math.floor(dt/60);
      var seconds = Math.floor(dt - (minutes * 60));
      var tenths  = Math.floor(10 * (dt - Math.floor(dt)));
      if (minutes > 0)
        return minutes + "." + (seconds < 10 ? "0" : "") + seconds + "." + tenths;
      else
        return seconds + "." + tenths;
    }

    //=========================================================================
    // RENDER THE GAME WORLD
    //=========================================================================

    function render() {

      var baseSegment   = findSegment(position);
      var basePercent   = Util.percentRemaining(position, segmentLength);
      var playerSegment = findSegment(position+playerZ);
      var playerPercent = Util.percentRemaining(position+playerZ, segmentLength);
      var playerY       = Util.interpolate(playerSegment.p1.world.y, playerSegment.p2.world.y, playerPercent);
      var maxy          = height;

      var x  = 0;
      var dx = - (baseSegment.curve * basePercent);

      ctx.clearRect(0, 0, width, height);

      for(b = 0 ; b < backgroundLayers.length ; b++) {
        var layer = backgroundLayers[b];
        Render.background(ctx, layer.image, width, height, layer.rect, layer.offset, resolution * layer.speed * playerY, layer.wrap);
      }

      var n, i, b, segment, car, sprite, spriteScale, spriteX, spriteY;

      for(n = 0 ; n < drawDistance ; n++) {

        segment        = segments[(baseSegment.index + n) % segments.length];
        segment.looped = segment.index < baseSegment.index;
        segment.fog    = Util.exponentialFog(n/drawDistance, fogDensity);
        segment.clip   = maxy;

        Util.project(segment.p1, (playerX * roadWidth) - x,      playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);
        Util.project(segment.p2, (playerX * roadWidth) - x - dx, playerY + cameraHeight, position - (segment.looped ? trackLength : 0), cameraDepth, width, height, roadWidth);

        x  = x + dx;
        dx = dx + segment.curve;

        if ((segment.p1.camera.z <= cameraDepth)         || // behind us
            (segment.p2.screen.y >= segment.p1.screen.y) || // back face cull
            (segment.p2.screen.y >= maxy))                  // clip by (already rendered) hill
          continue;

        Render.segment(ctx, width, lanes,
                       segment.p1.screen.x,
                       segment.p1.screen.y,
                       segment.p1.screen.w,
                       segment.p2.screen.x,
                       segment.p2.screen.y,
                       segment.p2.screen.w,
                       segment.fog,
                       segment.color);

        maxy = segment.p1.screen.y;
      }

      for(n = (drawDistance-1) ; n > 0 ; n--) {
        segment = segments[(baseSegment.index + n) % segments.length];

        for(i = 0 ; i < segment.cars.length ; i++) {
          car         = segment.cars[i];
          sprite      = car.sprite;
          spriteScale = Util.interpolate(segment.p1.screen.scale, segment.p2.screen.scale, car.percent);
          spriteX     = Util.interpolate(segment.p1.screen.x,     segment.p2.screen.x,     car.percent) + (spriteScale * car.offset * roadWidth * width/2);
          spriteY     = Util.interpolate(segment.p1.screen.y,     segment.p2.screen.y,     car.percent);
          Render.sprite(ctx, width, height, resolution, roadWidth, sprites, car.sprite, spriteScale, spriteX, spriteY, -0.5, -1, segment.clip);
        }

        for(i = 0 ; i < segment.sprites.length ; i++) {
          sprite      = segment.sprites[i];
          spriteScale = segment.p1.screen.scale;
          spriteX     = segment.p1.screen.x + (spriteScale * sprite.offset * roadWidth * width/2);
          spriteY     = segment.p1.screen.y;
          Render.sprite(ctx, width, height, resolution, roadWidth, sprites, sprite.source, spriteScale, spriteX, spriteY, (sprite.offset < 0 ? -1 : 0), -1, segment.clip);
        }

        if (segment == playerSegment) {
          Render.player(ctx, width, height, resolution, roadWidth, sprites, speed/maxSpeed,
                        cameraDepth/playerZ,
                        width/2,
                        (height/2) - (cameraDepth/playerZ * Util.interpolate(playerSegment.p1.camera.y, playerSegment.p2.camera.y, playerPercent) * height/2),
                        speed * (keyLeft ? -1 : keyRight ? 1 : 0),
                        playerSegment.p2.world.y - playerSegment.p1.world.y);
        }
      }
    }

    function findSegment(z) {
      return segments[Math.floor(z/segmentLength) % segments.length]; 
    }

    //=========================================================================
    // BUILD ROAD GEOMETRY
    //=========================================================================

    function lastY() { return (segments.length == 0) ? 0 : segments[segments.length-1].p2.world.y; }

    function addSegment(curve, y) {
      var n = segments.length;
      segments.push({
          index: n,
             p1: { world: { y: lastY(), z:  n   *segmentLength }, camera: {}, screen: {} },
             p2: { world: { y: y,       z: (n+1)*segmentLength }, camera: {}, screen: {} },
          curve: curve,
        sprites: [],
           cars: [],
          color: Math.floor(n/rumbleLength)%2 ? COLORS.DARK : COLORS.LIGHT
      });
    }

    function addSprite(n, sprite, offset) {
      n = Math.floor(n);
      if ((n >= 0) && (n < segments.length))
        segments[n].sprites.push({ source: sprite, offset: offset });
    }

    function addRoad(enter, hold, leave, curve, y) {
      var startY   = lastY();
      var endY     = startY + (Util.toInt(y, 0) * segmentLength);
      var n, total = enter + hold + leave;
      for(n = 0 ; n < enter ; n++)
        addSegment(Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total));
      for(n = 0 ; n < hold  ; n++)
        addSegment(curve, Util.easeInOut(startY, endY, (enter+n)/total));
      for(n = 0 ; n < leave ; n++)
        addSegment(Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total));
    }

    var ROAD = {
      LENGTH: { NONE: 0, SHORT:  25, MEDIUM:   50, LONG:  100 },
      HILL:   { NONE: 0, LOW:    20, MEDIUM:   40, HIGH:   60 },
      CURVE:  { NONE: 0, EASY:    2, MEDIUM:    4, HARD:    6 }
    };

    // The numbers below come from config.js, so a 0 really means 0 - these
    // builders deliberately have no "sensible default" of their own.

    function addStraight(num) {
      addRoad(num, num, num, 0, 0);
    }

    function addHill(num, height) {
      addRoad(num, num, num, 0, height);
    }

    function addCurve(num, curve, height) {
      addRoad(num, num, num, curve, height);
    }
        
    function addLowRollingHills(num, height) {
      addRoad(num, num, num,  0,                height/2);
      addRoad(num, num, num,  0,               -height);
      addRoad(num, num, num,  ROAD.CURVE.EASY,  height);
      addRoad(num, num, num,  0,                0);
      addRoad(num, num, num, -ROAD.CURVE.EASY,  height/2);
      addRoad(num, num, num,  0,                0);
    }

    function addSCurves(scale) {
      var num = ROAD.LENGTH.MEDIUM * scale;
      addRoad(num, num, num,  -ROAD.CURVE.EASY,    0);
      addRoad(num, num, num,   ROAD.CURVE.MEDIUM,  ROAD.HILL.MEDIUM);
      addRoad(num, num, num,   ROAD.CURVE.EASY,   -ROAD.HILL.LOW);
      addRoad(num, num, num,  -ROAD.CURVE.EASY,    ROAD.HILL.MEDIUM);
      addRoad(num, num, num,  -ROAD.CURVE.MEDIUM, -ROAD.HILL.MEDIUM);
    }

    function addBumps(scale) {
      var num = 10 * scale;
      addRoad(num, num, num, 0,  5);
      addRoad(num, num, num, 0, -2);
      addRoad(num, num, num, 0, -5);
      addRoad(num, num, num, 0,  8);
      addRoad(num, num, num, 0,  5);
      addRoad(num, num, num, 0, -7);
      addRoad(num, num, num, 0,  5);
      addRoad(num, num, num, 0, -2);
    }

    function addDownhillToEnd(num) {
      addRoad(num, num, num, -ROAD.CURVE.EASY, -lastY()/segmentLength);
    }

    // Turn one line of config.js's track.sections into road.
    function addSection(s) {
      switch (s.type) {
        case 'straight':      addStraight(s.length);                break;
        case 'hill':          addHill(s.length, s.hill);            break;
        case 'curve':         addCurve(s.length, s.curve, s.hill);  break;
        case 'rollingHills':  addLowRollingHills(s.length, s.hill); break;
        case 'sCurves':       addSCurves(s.scale);                  break;
        case 'bumps':         addBumps(s.scale);                    break;
        case 'downhillToEnd': addDownhillToEnd(s.length);           break;
      }
    }

    function resetRoad() {
      segments = [];

      var s;
      if (trackPreset === 'blank')
        addStraight(200);
      else
        for(s = 0 ; s < trackSections.length ; s++)
          addSection(trackSections[s]);

      if (segments.length === 0)  // a track with nothing in it would be a black screen
        addStraight(200);

      resetSprites();
      resetCars();

      var start = findSegment(playerZ).index;
      if (segments[start+2]) segments[start+2].color = COLORS.START;
      if (segments[start+3]) segments[start+3].color = COLORS.START;
      for(var n = 0 ; (n < rumbleLength) && (n < segments.length) ; n++)
        segments[segments.length-1-n].color = COLORS.FINISH;

      trackLength = segments.length * segmentLength;
    }

    // Roadside objects. `scenery.density` and the four per-category numbers in
    // config.js decide how many of each we place.
    //
    // IMPORTANT: density is applied by DIVIDING the distance between objects,
    // never by multiplying the loop step. `n += 3 * 0` would never advance and
    // the browser would freeze; `n += 3 / 0.4` grows like 3 did before.
    function resetSprites() {
      var n, i;

      if (scenery.density <= 0)
        return;

      var palms      = scenery.density * scenery.palms;
      var columns    = scenery.density * scenery.columns;
      var plants     = scenery.density * scenery.plants;
      var billboards = scenery.density * scenery.billboards;

      var ROW = [SPRITES.BILLBOARD07, SPRITES.BILLBOARD06, SPRITES.BILLBOARD08, SPRITES.BILLBOARD09, SPRITES.BILLBOARD01,
                 SPRITES.BILLBOARD02, SPRITES.BILLBOARD03, SPRITES.BILLBOARD04, SPRITES.BILLBOARD05];

      if (billboards > 0) {
        var billboardStep = 20 / billboards;
        for(n = 20, i = 0 ; n < 200 ; n += billboardStep, i++)
          addSprite(n, ROW[i % ROW.length], -1);

        addSprite(240,                  SPRITES.BILLBOARD07, -1.2);
        addSprite(240,                  SPRITES.BILLBOARD06,  1.2);
        addSprite(segments.length - 25, SPRITES.BILLBOARD07, -1.2);
        addSprite(segments.length - 25, SPRITES.BILLBOARD06,  1.2);
      }

      if (palms > 0) {
        for(n = 10 ; n < 200 ; n += Math.max(0.25, (4 + Math.floor(n/100)) / palms)) {
          addSprite(n, SPRITES.PALM_TREE, 0.5 + Math.random()*0.5);
          addSprite(n, SPRITES.PALM_TREE,   1 + Math.random()*2);
        }
      }

      if (columns > 0) {
        for(n = 250 ; n < 1000 ; n += Math.max(0.25, 5 / columns)) {
          addSprite(n,     SPRITES.COLUMN, 1.1);
          addSprite(n + Util.randomInt(0,5), SPRITES.TREE1, -1 - (Math.random() * 2));
          addSprite(n + Util.randomInt(0,5), SPRITES.TREE2, -1 - (Math.random() * 2));
        }
      }

      if (plants > 0) {
        for(n = 200 ; n < segments.length ; n += Math.max(0.25, 3 / plants)) {
          addSprite(n, Util.randomChoice(SPRITES.PLANTS), Util.randomChoice([1,-1]) * (2 + Math.random() * 5));
        }
      }

      var side, sprite, offset, clusterStep, clusterPlants;
      if (billboards > 0) {
        clusterStep   = Math.max(1, 100 / billboards);
        clusterPlants = Math.max(1, Math.round(20 * plants));
        for(n = 1000 ; n < (segments.length-50) ; n += clusterStep) {
          side = Util.randomChoice([1, -1]);
          addSprite(n + Util.randomInt(0, 50), Util.randomChoice(SPRITES.BILLBOARDS), -side);
          for(i = 0 ; i < clusterPlants ; i++) {
            sprite = Util.randomChoice(SPRITES.PLANTS);
            offset = side * (1.5 + Math.random());
            addSprite(n + Util.randomInt(0, 50), sprite, offset);
          }

        }
      }

    }

    function resetCars() {
      cars = [];
      var n, car, segment, offset, z, sprite, speed;
      for (var n = 0 ; n < rivalCount ; n++) {
        offset = Math.random() * Util.randomChoice([-0.8, 0.8]);
        z      = Math.floor(Math.random() * segments.length) * segmentLength;
        sprite = Util.randomChoice(rivalSprites);
        var top = ((sprite === SPRITES.SEMI) || (sprite === SPRITES.TRUCK)) ? rivalSpeedMaxHeavy : rivalSpeedMax;
        speed  = maxSpeed * (rivalSpeedMin + (Math.random() * Math.max(0, top - rivalSpeedMin)));
        car = { offset: offset, z: z, sprite: sprite, speed: speed };
        segment = findSegment(car.z);
        segment.cars.push(car);
        cars.push(car);
      }
    }

    //=========================================================================
    // APPLY CONFIG
    //=========================================================================

    var SECTION_TYPES = ['straight', 'hill', 'curve', 'rollingHills', 'sCurves', 'bumps', 'downhillToEnd'];
    var CAR_NAMES     = ['CAR01', 'CAR02', 'CAR03', 'CAR04', 'SEMI', 'TRUCK'];
    var LAYER_SLICES  = { SKY: BACKGROUND.SKY, HILLS: BACKGROUND.HILLS, TREES: BACKGROUND.TREES };

    function trackSectionsFromConfig() {
      var raw = Config.list('track.sections', []);
      var out = [];
      for (var i = 0 ; i < raw.length ; i++) {
        var s = raw[i];
        if ((s === null) || (typeof s !== 'object')) {
          Config.missing.push('track.sections[' + i + '] is not a section like { type: "curve", length: 50 }');
          continue;
        }
        if (SECTION_TYPES.indexOf(s.type) < 0) {
          Config.missing.push('track.sections[' + i + '] has an unknown type "' + s.type + '" - use one of ' + SECTION_TYPES.join(', '));
          continue;
        }
        out.push({
          type:   s.type,
          length: Util.limit(Util.toFloat(s.length, 50),    10,   400),
          curve:  Util.limit(Util.toFloat(s.curve,   0),    -6,     6),
          hill:   Util.limit(Util.toFloat(s.hill,    0),   -60,    60),
          scale:  Util.limit(Util.toFloat(s.scale,   1),   0.25,   4)
        });
      }
      return out;
    }

    function rivalSpritesFromConfig() {
      var names = Config.list('rivals.sprites', CAR_NAMES);
      var out   = [];
      for (var i = 0 ; i < names.length ; i++) {
        if (SPRITES[names[i]])
          out.push(SPRITES[names[i]]);
        else
          Config.missing.push('rivals.sprites has an unknown name "' + names[i] + '" - use any of ' + CAR_NAMES.join(', '));
      }
      return (out.length > 0) ? out : SPRITES.CARS;
    }

    function backgroundLayersFromConfig() {
      var raw      = Config.list('background.layers', []);
      var fallback = Config.str('background.image', 'background');
      var out      = [];
      for (var i = 0 ; i < raw.length ; i++) {
        var l = raw[i];
        if ((l === null) || (typeof l !== 'object')) {
          Config.missing.push('background.layers[' + i + '] is not a layer like { slice: "SKY", speed: 0.001 }');
          continue;
        }
        var rect = ((l.rect !== null) && (typeof l.rect === 'object')) ? l.rect : LAYER_SLICES[l.slice];
        if (!rect) {
          Config.missing.push('background.layers[' + i + '] has an unknown slice "' + l.slice + '" - use SKY, HILLS or TREES, or give it a rect {x,y,w,h}');
          continue;
        }
        out.push({
          imageName: (typeof l.image === 'string') ? l.image : fallback,
          image:     null,
          rect:      rect,
          speed:     Util.limit(Util.toFloat(l.speed, 0), 0, 0.01),
          wrap:      (l.wrap === false) ? false : true,
          offset:    0
        });
      }
      return out;
    }

    function applyConfig() {

      DIFF      = DIFFICULTY[Config.str('difficulty', 'normal')] || DIFFICULTY.normal;
      intensity = Config.num('team.intensity', 1, 0.25, 3);

      // --- the track itself -------------------------------------------------
      segmentLength = Config.num('track.segmentLength', 200,  50,  500);
      rumbleLength  = Config.int('track.rumbleLength',    3,   1,   20);
      lanes         = Config.int('track.lanes',           3,   1,    6);
      roadWidth     = Config.num('track.roadWidth',    2000, 500, 4000);
      trackPreset   = Config.str('track.preset', 'sections');
      trackSections = trackSectionsFromConfig();

      // --- camera -----------------------------------------------------------
      fieldOfView   = Config.num('camera.fieldOfView',   100, 40, 160);
      cameraHeight  = Config.num('camera.height',       1000, 200, 6000);
      drawDistance  = Config.int('camera.drawDistance',  300, 50,  600);
      cameraDepth   = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
      playerZ       = (cameraHeight * cameraDepth);

      // --- world ------------------------------------------------------------
      fogDensity    = Config.num('fog.density', 5, 0, 30);
      SPRITES.SCALE = 0.3 * (1/SPRITES.PLAYER_STRAIGHT.w) * Config.num('sprites.scale', 1, 0.25, 3);

      // --- player and physics -----------------------------------------------
      // Every speed is a fraction of top speed, so the numbers keep their
      // meaning when you change segmentLength or the difficulty preset.
      maxSpeed         = (segmentLength/step) * Config.num('physics.maxSpeedScale', 1, 0.1, 2) * DIFF.speed * intensity;
      accel            =  maxSpeed * Config.num('physics.accel',        0.2,  0.05, 1);
      breaking         = -maxSpeed * Config.num('physics.braking',      1.0,  0.1,  2);
      decel            = -maxSpeed * Config.num('physics.decel',        0.2,  0.01, 1);
      offRoadDecel     = -maxSpeed * Config.num('physics.offRoadDecel', 0.5,  0.05, 1);
      offRoadLimit     =  maxSpeed * Config.num('physics.offRoadLimit', 0.25, 0,    1);
      centrifugal      = Config.num('physics.centrifugal',      0.3, 0,   2);
      steerRate        = Config.num('physics.steerRate',        2.0, 0.5, 6);
      spriteCrashSpeed = maxSpeed * Config.num('physics.spriteCrashSpeed', 0.2, 0, 1);
      maxOffRoad       = Config.num('player.maxOffRoad',        3,   1,   6);

      // --- scenery ----------------------------------------------------------
      scenery = {
        density:    Config.num('scenery.density',     1, 0, 5) * intensity,
        palms:      Config.num('scenery.palms',       1, 0, 5),
        columns:    Config.num('scenery.columns',     1, 0, 5),
        plants:     Config.num('scenery.plants',      1, 0, 5),
        billboards: Config.num('scenery.billboards',  1, 0, 5)
      };

      // --- rivals -----------------------------------------------------------
      rivalCount         = Math.round(Config.int('rivals.count', 200, 0, 1000) * DIFF.rivals * intensity);
      rivalLookahead     = Config.int('rivals.lookahead', 20, 5, 60);
      rivalSprites       = rivalSpritesFromConfig();
      rivalSpeedMin      = Config.num('rivals.speedMin',      0.25, 0.05, 1);
      rivalSpeedMax      = Config.num('rivals.speedMax',      0.75, 0.05, 1) * DIFF.rivalSpeed;
      rivalSpeedMaxHeavy = Config.num('rivals.speedMaxHeavy', 0.50, 0.05, 1) * DIFF.rivalSpeed;
      rivalCollisions    = Config.bool('rivals.collisions', true);

      // --- colors -----------------------------------------------------------
      COLORS.SKY        = Config.str('colors.sky', '#72D7EE');
      COLORS.FOG        = Config.str('colors.fog', COLORS.SKY);
      COLORS.LIGHT      = Config.colors('colors.road.light', { road: '#6B6B6B', grass: '#10AA10', rumble: '#555555' });
      COLORS.LIGHT.lane = Config.lane('colors.road.light.lane', '#CCCCCC');
      COLORS.DARK       = Config.colors('colors.road.dark',  { road: '#696969', grass: '#009A00', rumble: '#BBBBBB' });
      COLORS.DARK.lane  = Config.lane('colors.road.dark.lane', null);
      COLORS.START      = Config.colors('colors.start',  { road: 'white', grass: 'white', rumble: 'white' });
      COLORS.FINISH     = Config.colors('colors.finish', { road: 'black', grass: 'black', rumble: 'black' });
      canvas.style.backgroundColor = COLORS.SKY;

      // --- background, hud, audio -------------------------------------------
      background       = null;                    // resolved once the images have loaded
      backgroundLayers = backgroundLayersFromConfig();

      hudConfig = {
        enabled:        Config.bool('hud.enabled', true),
        scale:          Config.num('hud.scale', 1, 0.4, 3),
        showSpeed:      Config.bool('hud.showSpeed', true),
        showLapTime:    Config.bool('hud.showLapTime', true),
        showLastLap:    Config.bool('hud.showLastLap', true),
        showFastestLap: Config.bool('hud.showFastestLap', true),
        speedUnit:      Config.str('hud.speedUnit', 'mph'),
        speedMultiplier:Config.num('hud.speedMultiplier', 5, 0, 1000),
        speedDivisor:   Config.num('hud.speedDivisor', 500, 1, 100000)
      };

      audioConfig = {
        enabled: Config.bool('audio.enabled', true),
        volume:  Config.num('audio.volume', 0.05, 0, 1),
        loop:    Config.bool('audio.loop', true),
        src:     Config.list('audio.src', [])
      };
    }

    // Checks that can only be made once the road has actually been built. These
    // do not stop the game - they explain, in the red box, why it looks wrong.
    function validateWorld() {

      var problems = Config.missing;

      // A track shorter than the draw distance makes the render loop wrap the
      // segment array more than once, and the road comes out garbled.
      if (segments.length < (drawDistance + 20))
        problems.push('the track is only ' + segments.length + ' segments long but camera.drawDistance is ' + drawDistance +
                      ' - the road will look wrong. Add length to track.sections (each unit of length is 3 segments, so ' +
                      '{ type: "straight", length: 50 } adds 150) or lower camera.drawDistance');

      // The original guarantees you cannot cover a whole segment in one frame,
      // which is what makes collisions detectable.
      if ((maxSpeed / segmentLength) > (1/step))
        problems.push('top speed is more than one road segment per frame, so the car can pass through a rival without hitting it - ' +
                      'lower physics.maxSpeedScale, raise track.segmentLength, or set difficulty to something calmer');

      if ((lanes > 1) && (COLORS.LIGHT.lane === null) && (COLORS.DARK.lane === null))
        problems.push('track.lanes is ' + lanes + ' but both lane colours are null, so no lane markers are drawn - ' +
                      'give colors.road.light.lane a colour, or set track.lanes to 1');

      if ((rivalCount > 0) && ((rivalCount / segments.length) > 0.25))
        problems.push(rivalCount + ' rivals on a ' + segments.length + ' segment track is very crowded - they are placed at ' +
                      'random positions, so they bunch up and the frame rate suffers. Lower rivals.count');

      if ((fogDensity > 0) && (COLORS.FOG !== COLORS.SKY))
        problems.push('note: colors.fog and colors.sky are different colours, which paints a visible band along the horizon. ' +
                      'Set them equal for a seamless sky, or ignore this if the band is the look you wanted');
    }

    function applyHudConfig() {
      var root = Dom.get('hud');
      if (root) {
        root.style.display  = hudConfig.enabled ? 'block' : 'none';
        root.style.fontSize = (0.8 * hudConfig.scale) + 'em';
      }
      var visible = {
        speed:            hudConfig.showSpeed,
        current_lap_time: hudConfig.showLapTime,
        last_lap_time:    false,                    // stays hidden until the first lap is done
        fast_lap_time:    hudConfig.showFastestLap
      };
      for (var key in visible) {
        var item = hud[key];
        // '' rather than 'block': the stylesheet lays the readouts out inline,
        // and an inline display:block would stretch each one across the screen
        if (item && item.dom && item.dom.parentNode)
          item.dom.parentNode.style.display = visible[key] ? '' : 'none';
      }
      var unit = Dom.get('speed_unit');
      if (unit)
        unit.innerHTML = escapeHtml(hudConfig.speedUnit);
    }

    //=========================================================================
    // FULLSCREEN
    //=========================================================================

    // Browsers only allow fullscreen, and sound, from inside a click. We ask for
    // it as the very first thing in the click handler, before anything slow.
    var Fullscreen = {

      request: function(element) {
        var fn = element.requestFullscreen || element.webkitRequestFullscreen || element.msRequestFullscreen;
        if (!fn)
          return;                                   // e.g. an iPhone: the page already fills the screen
        try {
          var result = fn.call(element);
          if (result && result.catch)
            result.catch(function() {});            // refused, blocked, or the user said no - all fine
        } catch (e) {}
      },

      onChange: function(callback) {
        document.addEventListener('fullscreenchange',      callback, false);
        document.addEventListener('webkitfullscreenchange', callback, false);
      },

      isActive: function() {
        return !!(document.fullscreenElement || document.webkitFullscreenElement);
      }

    };

    //=========================================================================
    // THE GAME LOOP
    //=========================================================================

    function startGame() {
      Game.run({
        canvas: canvas, render: render, update: update, stats: stats, step: step,
        images: imageNamesFromConfig(),
        audio:  audioConfig,
        error:  function(failed) {
          showFatal('Missing image', 'Could not load: ' + failed.join(', ') + '. Check the image names in config.js.');
        },
        keys: [
          { keys: [KEY.LEFT,  KEY.A], mode: 'down', action: function() { keyLeft   = true;  } },
          { keys: [KEY.RIGHT, KEY.D], mode: 'down', action: function() { keyRight  = true;  } },
          { keys: [KEY.UP,    KEY.W], mode: 'down', action: function() { keyFaster = true;  } },
          { keys: [KEY.DOWN,  KEY.S], mode: 'down', action: function() { keySlower = true;  } },
          { keys: [KEY.LEFT,  KEY.A], mode: 'up',   action: function() { keyLeft   = false; } },
          { keys: [KEY.RIGHT, KEY.D], mode: 'up',   action: function() { keyRight  = false; } },
          { keys: [KEY.UP,    KEY.W], mode: 'up',   action: function() { keyFaster = false; } },
          { keys: [KEY.DOWN,  KEY.S], mode: 'up',   action: function() { keySlower = false; } }
        ],
        ready: function(images) {

          var names  = imageNamesFromConfig();
          var byName = {};
          for (var n = 0 ; n < names.length ; n++)
            byName[names[n]] = images[n];

          background = byName[Config.str('background.image', 'background')];
          sprites    = byName['sprites'];

          for (var l = 0 ; l < backgroundLayers.length ; l++)
            backgroundLayers[l].image = byName[backgroundLayers[l].imageName] || background;

          tintSprites();

          reset();
          applyHudConfig();

          validateWorld();
          showProblems();

          Dom.storage.fast_lap_time = Dom.storage.fast_lap_time || 180;
          updateHud('fast_lap_time', formatTime(Util.toFloat(Dom.storage.fast_lap_time)));
        }
      });
    }

    //=========================================================================
    // SIZING - fill the screen, and stay sharp on a high-DPI display
    //=========================================================================

    function resize() {

      var cssWidth  = window.innerWidth;
      var cssHeight = window.innerHeight;

      if (Config.bool('viewport.letterbox', false)) {   // keep the classic 4:3 shape
        cssWidth  = Math.min(cssWidth, cssHeight * 4/3);
        cssHeight = cssWidth * 3/4;
      }

      var maxWidth   = Config.num('viewport.maxRenderWidth', 1920, 480, 3840);
      var pixelRatio = Math.min(window.devicePixelRatio || 1, Config.num('viewport.maxPixelRatio', 2, 1, 3));
      var shrink     = Math.min(1, maxWidth / (cssWidth * pixelRatio));

      width  = Math.round(cssWidth  * pixelRatio * shrink);
      height = Math.round(cssHeight * pixelRatio * shrink);

      canvas.style.width  = cssWidth  + 'px';
      canvas.style.height = cssHeight + 'px';

      reset();
    }

    //=========================================================================
    // CAR COLOR - recolour the car artwork once, at boot
    //=========================================================================

    // The car is drawn in red. We build a recoloured copy of each of its sprites
    // in an offscreen canvas at startup and let the renderer use that instead.
    // We never read pixels back, because on a file:// page that throws.
    function tintSprites() {

      var hue        = Config.num('player.hue',        0, 0,   360);
      var saturate   = Config.num('player.saturate',   1, 0,   2);
      var brightness = Config.num('player.brightness', 1, 0.3, 2);

      if ((hue === 0) && (saturate === 1) && (brightness === 1))
        return;                             // nothing to do, use the sheet exactly as it is

      var filter    = 'hue-rotate(' + hue + 'deg) saturate(' + saturate + ') brightness(' + brightness + ')';
      var wash      = 'hsl(' + hue + ', 90%, 50%)';
      var canFilter = ('filter' in ctx);    // Safari does not support ctx.filter yet

      var artwork = [SPRITES.PLAYER_LEFT,  SPRITES.PLAYER_STRAIGHT,  SPRITES.PLAYER_RIGHT,
                     SPRITES.PLAYER_UPHILL_LEFT, SPRITES.PLAYER_UPHILL_STRAIGHT, SPRITES.PLAYER_UPHILL_RIGHT];

      for (var n = 0 ; n < artwork.length ; n++) {

        var sprite = artwork[n];
        var copy   = document.createElement('canvas');
        copy.width  = sprite.w;
        copy.height = sprite.h;

        var g = copy.getContext('2d');
        if (canFilter) {
          g.filter = filter;
          g.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
        }
        else {                              // approximate: wash a colour over the car only
          g.drawImage(sprites, sprite.x, sprite.y, sprite.w, sprite.h, 0, 0, sprite.w, sprite.h);
          g.globalCompositeOperation = 'source-atop';
          g.globalAlpha = 0.55;
          g.fillStyle   = wash;
          g.fillRect(0, 0, sprite.w, sprite.h);
        }

        sprite.tint = copy;
      }
    }

    //=========================================================================
    // WHICH IMAGES TO LOAD
    //=========================================================================

    function imageNamesFromConfig() {
      var names = [Config.str('background.image', 'background'), 'sprites'];
      for (var n = 0 ; n < backgroundLayers.length ; n++)
        if (names.indexOf(backgroundLayers[n].imageName) < 0)
          names.push(backgroundLayers[n].imageName);
      return names;
    }

    //=========================================================================
    // RESET - called once at boot, and again on every window resize
    //=========================================================================

    function reset() {
      cameraDepth   = 1 / Math.tan((fieldOfView/2) * Math.PI/180);
      playerZ       = (cameraHeight * cameraDepth);
      resolution    = height/480;   // scales the background parallax and the car's bounce
      canvas.width  = width;
      canvas.height = height;

      if (segments.length == 0)
        resetRoad();  // only build the road once: rebuilding would move every tree and rival
    }

    //=========================================================================


    //=========================================================================
    // BOOT - read the config, show the title card, wait for one click
    //=========================================================================

    // Nothing below this point is worth doing if config.js never ran: every
    // value would be a default, and we would rather explain than pretend.
    if (configLoaded) {
      applyConfig();
      fillTitleCard();
      preloadImages();
      startFps();
      wireStart();
    }
    else {
      explainConfigFailure();
    }

    function fillTitleCard() {

      var title = Config.str('team.title', 'JavaScript Racer');
      document.title = title;
      if (Dom.get('title'))
        Dom.get('title').innerHTML = escapeHtml(title);

      var authors = Dom.get('authors');
      var who     = Config.list('team.authors', []);
      if (authors && (who.length > 0))
        authors.innerHTML = who.map(escapeHtml).join('\n');
    }

    function preloadImages() {
      // warm the browser cache while the player is reading the title card,
      // so that the click feels instant. Failures are reported by startGame.
      Game.loadImages(imageNamesFromConfig(), function() {}, function() {});
    }

    function wireStart() {

      var overlay = Dom.get('overlay');
      var started = false;

      var start = function() {
        if (started)
          return;
        started = true;

        Fullscreen.request(document.documentElement);   // has to happen inside the click
        if (overlay)
          overlay.style.display = 'none';

        window.addEventListener('resize',            onResize, false);
        window.addEventListener('orientationchange', onResize, false);
        Fullscreen.onChange(onResize);

        resize();      // sizes the canvas and builds the road
        startGame();   // loads the images, then runs
      };

      if (!overlay) {  // a page without a title card just starts
        start();
        return;
      }

      Dom.on(overlay, 'click', start);
      Dom.on(document, 'keydown', function(ev) {
        if (!started && ((ev.keyCode === 13) || (ev.keyCode === 32)))
          start();
      });
    }

    var resizePending = false;

    function onResize() {
      if (resizePending)
        return;
      resizePending = true;
      requestAnimationFrame(function() {   // dragging a window fires this hundreds of times
        resizePending = false;
        resize();
      });
    }

    function startFps() {

      if (!Config.bool('debug.showFps', false))
        return;

      var box = document.createElement('div');
      box.id = 'fps';
      document.body.appendChild(box);

      var frames = 0;
      var last   = Util.timestamp();

      var tick = function() {
        frames++;
        var now = Util.timestamp();
        if ((now - last) >= 500) {
          box.innerHTML = Math.round(1000 * frames / (now - last)) + ' fps';
          frames = 0;
          last   = now;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
