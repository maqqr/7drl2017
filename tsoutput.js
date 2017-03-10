var TileSet = (function () {
    function TileSet(imageId) {
        this.tileSet = document.getElementById(imageId);
        this.tileMap = {};
        this.tileWidth = 20;
        this.tileHeight = 24;
        for (var i = 0; i < 256; i++) {
            this.tileMap[String.fromCharCode(i)] =
                [(i % 16) * this.tileWidth, Math.floor(i / 16) * this.tileHeight];
        }
    }
    return TileSet;
}());
var Actor = (function () {
    function Actor(speed, isPlayer) {
        this.speed = speed;
        this.isPlayer = isPlayer;
    }
    Actor.prototype.getSpeed = function () {
        return this.speed;
    };
    return Actor;
}());
var Game = (function () {
    function Game() {
        this.dungeonMaps = {};
        this.rememberTile = {};
        var tileSet = new TileSet('tileset');
        this.display = new ROT.Display({
            width: 75, height: 30, fontSize: 16, spacing: 1.0,
            layout: "tile", tileColorize: true,
            tileWidth: tileSet.tileWidth, tileHeight: tileSet.tileHeight,
            tileSet: tileSet.tileSet, tileMap: tileSet.tileMap
        });
        document.body.appendChild(this.display.getContainer());
        this.currentDungeon = "worldmap";
        this.dungeonDepth = -1;
        this.rememberTile = {};
        this.actionlog = [];
        this.gameState = PS["Rogue"].initialGameState;
        this.gameState = pushToGamestate(this.gameState, worldmap);
        this.fov = new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));
        this.drawMap();
        this.scheduler = new ROT.Scheduler.Speed();
        this.scheduler.add(new Actor(50, true), true);
        this.currentDungeon = "worldmap";
        this.worldMap = this.gameState.level;
        this.updateLoop();
    }
    Game.prototype.isTransparent = function (x, y) {
        var tile = PS["Rogue"].getTile(this.gameState)({ x: x, y: y });
        return PS["Rogue"].isTileTransparent(tile);
    };
    Game.prototype.isPassable = function (x, y) {
        var tile = PS["Rogue"].getTile(this.gameState)({ x: x, y: y });
        return !PS["Rogue"].isTileSolid(tile);
    };
    Game.prototype.setRememberTile = function (pos) {
        var key = this.currentDungeon + "," + this.dungeonDepth;
        if (!(key in this.rememberTile)) {
            this.rememberTile[key] = {};
        }
        this.rememberTile[key][pos.x + "," + pos.y] = true;
    };
    Game.prototype.remembersTile = function (pos) {
        var key = this.currentDungeon + "," + this.dungeonDepth;
        var dungeon = this.rememberTile[key];
        if (dungeon !== undefined) {
            var tile = dungeon[pos.x + "," + pos.y];
            return tile !== undefined;
        }
        return false;
    };
    Game.prototype.updateLoop = function () {
        for (;;) {
            var current = this.scheduler.next();
            console.log(current);
            if (current.isPlayer) {
                window.addEventListener("keydown", this);
                break;
            }
        }
    };
    Game.prototype.changeLevel = function (newLevel, playerPos) {
        this.gameState.level = newLevel;
        this.gameState.player.pos = playerPos;
        // TODO: add enemies to scheduler
        this.refreshDisplay();
    };
    Game.prototype.handleEvent = function (e) {
        var code = e.keyCode;
        console.log(code);
        if (code == 111) {
            var playerPos = { x: this.gameState.player.pos.x, y: this.gameState.player.pos.y };
            var potentialDoor = PS["Rogue"].getTile(this.gameState)(playerPos);
            var tileName = PS["Data.Show"].show(PS["Rogue"].showTile)(potentialDoor);
            if (tileName == "DungeonEntrance") {
                var key = "" + playerPos.x + "," + playerPos.y;
                this.currentDungeon = key;
                this.dungeonDepth = 0;
                var newLevel = void 0;
                if (key in this.dungeonMaps) {
                    var floors = this.dungeonMaps[this.currentDungeon];
                    newLevel = floors[0];
                }
                else {
                    newLevel = this.generateLevel();
                    this.dungeonMaps[key] = [newLevel];
                }
                this.changeLevel(newLevel, newLevel.up);
            }
            else if (tileName == "StairsDown") {
                this.dungeonDepth++;
                var floors = this.dungeonMaps[this.currentDungeon];
                var newLevel = void 0;
                // If current floor is the last explored floor of the dungeon
                if (this.dungeonDepth == floors.length) {
                    newLevel = this.generateLevel();
                    floors.push(newLevel);
                }
                else {
                    newLevel = floors[this.dungeonDepth];
                }
                this.changeLevel(newLevel, newLevel.up);
            }
            else if (tileName == "StairsUp") {
                var floors = this.dungeonMaps[this.currentDungeon];
                // If we are on the first floor of the dungeon, the worldmap awaits at the top of the stairs
                this.dungeonDepth--;
                if (this.dungeonDepth == -1) {
                    // Get the dungeons position on the world map based on the dungeonmaps key
                    var mapPos = this.currentDungeon.split(",");
                    this.currentDungeon = "worldmap";
                    // Position point needs int values and .split() gives string
                    this.changeLevel(this.worldMap, { x: parseInt(mapPos[0]), y: parseInt(mapPos[1]) });
                }
                else {
                    var newOldLevel = floors[this.dungeonDepth];
                    this.changeLevel(newOldLevel, newOldLevel.down);
                }
            }
        }
        if (code == 106) {
            this.actionlog.push("Ilmoitus: " + this.actionlog.length);
        }
        if (!(code in Game.keyMap)) {
            return;
        }
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;
        var diff = ROT.DIRS[8][Game.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];
        var tile = PS["Rogue"].getTile(this.gameState)({ x: newX, y: newY });
        console.log(tile);
        console.log("Going to pos:" + newX + "," + newY);
        if (!PS["Rogue"].isTileSolid(tile) && !(newX < 0 || newX > 74) && !(newY < 0 || newY > 24)) {
            this.gameState.player.pos = { x: newX, y: newY };
            this.drawMap();
        }
        window.removeEventListener("keydown", this);
        this.updateLoop();
    };
    Game.prototype.drawTile = function (pos, visible, remember) {
        if (!visible && !remember)
            return;
        var tile = PS["Rogue"].getTile(this.gameState)(pos);
        var icon = PS["Rogue"].tileIcon(tile);
        var col = visible ? PS["Rogue"].tileColor(tile) : "rgba(30, 30, 30, 0.8)";
        this.display.draw(pos.x, pos.y, icon, col);
    };
    Game.prototype.refreshDisplay = function () {
        this.display.clear();
        this.drawAllTiles();
        this.drawMap();
    };
    Game.prototype.drawLog = function () {
        var itemsInLog = this.actionlog.length;
        var grayism = 50;
        if (itemsInLog > 0) {
            for (var i = -1; i > -5; i--) {
                if (itemsInLog + i < 0)
                    break;
                this.display.drawText(0, (30 + i), "%c{rgba(" + String(255 + i * grayism) + "," + String(255 + i * grayism) + "," + String(255 + i * grayism) + ",0.8)}" + this.actionlog[itemsInLog + i] + "%c{}", 106);
            }
        }
    };
    Game.prototype.drawAllTiles = function () {
        for (var y = 0; y < this.gameState.level.height; y++) {
            for (var x = 0; x < this.gameState.level.width; x++) {
                var pos = { x: x, y: y };
                var rem = this.remembersTile(pos);
                this.drawTile(pos, false, rem);
            }
        }
    };
    Game.prototype.drawMap = function () {
        var radius = 5;
        var player = this.gameState.player;
        var levelWidth = this.gameState.level.width;
        var levelHeight = this.gameState.level.height;
        this.drawLog();
        // Calculate player's field of view
        var visible = {};
        var fovCallback = function (x, y, r, v) {
            var dx = player.pos.x - x;
            var dy = player.pos.y - y;
            if (dx * dx + dy * dy < radius * radius) {
                visible["" + x + "," + y] = true;
                this.setRememberTile({ x: x, y: y });
            }
        };
        this.fov.compute(player.pos.x, player.pos.y, radius, fovCallback.bind(this));
        // Add adjacent tiles to field of view
        for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
                var pos = { x: player.pos.x + dx, y: player.pos.y + dy };
                visible["" + pos.x + "," + pos.y] = true;
                this.setRememberTile(pos);
            }
        }
        // Draw tiles
        for (var dy = -radius - 1; dy <= radius + 1; dy++) {
            for (var dx = -radius - 1; dx <= radius + 1; dx++) {
                var pos = { x: player.pos.x + dx, y: player.pos.y + dy };
                if (pos.x < 0 || pos.y < 0 || pos.x >= levelWidth || pos.y >= levelHeight)
                    continue;
                var vis = visible[pos.x + "," + pos.y] === true;
                var rem = this.remembersTile(pos);
                this.drawTile(pos, vis, rem);
            }
        }
        // Draw items
        for (var i = 0; i < this.gameState.level.items.length; i++) {
            var item = this.gameState.level.items[i];
            var itemVisible = visible[item.pos.x + "," + item.pos.y] === true;
            if (itemVisible) {
                var icon = PS["Rogue"].itemIcon(item.item);
                var color = PS["Rogue"].itemColor(item.item);
                this.display.draw(item.pos.x, item.pos.y, icon, color);
            }
        }
        // Draw enemies
        for (var i = 0; i < this.gameState.level.enemies.length; i++) {
            var enemy = this.gameState.level.enemies[i];
            var enemyVisible = visible[enemy.pos.x + "," + enemy.pos.y] === true;
            if (enemyVisible) {
                var icon = PS["Rogue"].creatureIcon(enemy);
                var color = PS["Rogue"].creatureColor(enemy);
                this.display.draw(enemy.pos.x, enemy.pos.y, icon, color);
            }
        }
        // Draw player
        this.display.draw(player.pos.x, player.pos.y, '@', "rgba(0, 200, 0, 0.6)");
    };
    Game.prototype.generateLevel = function () {
        var width = 75;
        var height = 23;
        var fillTile = PS["Rogue"].Wall.create({ frozen: false });
        var level = PS["Rogue"].createLevel(width)(height)(fillTile);
        var digger = new ROT.Map.Digger(width, height);
        var digCallback = function (x, y, value) {
            if (value === 1) {
                return;
            }
            var position = { x: x, y: y };
            var floor = PS["Rogue"].Ground.create({ frozen: false });
            level = PS["Rogue"].setLevelTile(level)(floor)(position);
        };
        digger.create(digCallback.bind(this));
        var freePositions = [];
        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                var pos = { x: x, y: y };
                var tile = PS["Rogue"].getLevelTile(level)(pos);
                if (!PS["Rogue"].isTileSolid(tile)) {
                    freePositions.push(pos);
                }
            }
        }
        function randomFreePosition() {
            var index = Math.floor(ROT.RNG.getUniform() * freePositions.length);
            return freePositions.splice(index, 1)[0];
        }
        var itemSeed = new Date().getTime();
        function randomItem() {
            var theme = undefined;
            var result = PS["Random"].runRandom(PS["ContentGenerator"].randomItem(theme)(this.dungeonDepth))(itemSeed);
            itemSeed = result.seed;
            return result.value;
        }
        randomItem.bind(this)();
        var enemySeed = new Date().getTime();
        function randomEnemy() {
            var theme = undefined;
            var result = PS["Random"].runRandom(PS["ContentGenerator"].randomEnemy(theme)(this.dungeonDepth))(enemySeed);
            enemySeed = result.seed;
            return result.value;
        }
        randomEnemy.bind(this)();
        // Generate stairs
        var stairsUpPos = randomFreePosition();
        var stairsDownPos = randomFreePosition();
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsDown())(stairsDownPos);
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsUp())(stairsUpPos);
        level = PS["Rogue"].setExits(level)(stairsUpPos)(stairsDownPos);
        // Remove stairs from free positions
        freePositions.splice(freePositions.indexOf(stairsUpPos), 1);
        freePositions.splice(freePositions.indexOf(stairsDownPos), 1);
        // Generate random items
        for (var i = 0; i < 10; i++) {
            var pos = randomFreePosition();
            var item = randomItem();
            level.items.push({ pos: pos, item: item });
        }
        // Generate random enemies
        for (var i = 0; i < 10; i++) {
            var enemy = randomEnemy();
            enemy.pos = randomFreePosition();
            level.enemies.push(enemy);
            console.log(enemy);
        }
        return level;
    };
    return Game;
}());
Game.keyMap = { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7 };
var worldmap = [];
worldmap[0] = "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^";
worldmap[1] = "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^~^^^^o^^^^^^^^^^^^^^^^^^^^^^";
worldmap[2] = "^^^^o.^..^......^^T^TT^^^TT.T......^^^^^^^^^^^^~^^^^^.TT^......^^T.^.^^^^^^";
worldmap[3] = "^^^..^..^T..T...TT^TTT.T^T.T.TT..T...^^^^^^^^^.~.^^^^^^...........^...T^^^^";
worldmap[4] = "^^^^...TTTT.T....^.TTT^T.T^TT..T.......^^.TT..~T~T.^^^^T.T..............^^^";
worldmap[5] = "^^^^.T..T.T.T.T^^^^^T^^^^^^TT.T.T...........T.~T~^T.^TT^..T.....o.......^^^";
worldmap[6] = "^^^.T..T.T..T.^^^^^^^o^^^^^^T...T.TT.........T~T~^T^.^.^^..............^^^^";
worldmap[7] = "^^^T.tT....T.^^^^^--^^^^^^^^^.^^^^..T........~..~^T.T.T^^..T..........^.^^^";
worldmap[8] = "vvv,,,,T,,T.^^^^^-------o^^^^..^^^^T..T......~..~~.^.T^.^^........T.^.^^^^^";
worldmap[9] = "vvv,,t,,,,T...^^^^--~^~-^^^^^.T.T^^^^.......~~...~.T.^^.^.........^.^^^^^^^";
worldmap[10] = "vv,,tT,,T,,...^^^^^^^~^^^^^^^^T...T.TT......~....~....T^^..^...^^.^^^^^^^^^";
worldmap[11] = ",,,,t,T,T,,,T.^^^^^^^~^^^^^^^^^.T.TTT......~.....~~..T^^^.^.^^^.^^.^.T^^^^^";
worldmap[12] = "vv,,,,,T,,,T.T...^^^o~~^^^^^....T-T........~......~....T^^^.^^..^^....^^^^^";
worldmap[13] = "vvv,,t,,t,TT.......^.~~.T.^....T.-.........~......~~......T^^..^..^.^^oT^^^";
worldmap[14] = "vvv,t,tt,,,,,.......~T~T.T.....---.......---....^^.~.............^^^^^^^^^^";
worldmap[15] = "^^^,,t,,,t,......~~~TT~TT....------..---------..o^.~~.............T.T^^T^^^";
worldmap[16] = "^^^tt.t,,,,...T~~~TTTT.~.--------------------------.~....T.T.....TTT^.T.^^^";
worldmap[17] = "^^^,,t,,,.....~~TT.....~.-------------TTTT-----------......T.T.....TTT.T^^^";
worldmap[18] = "^^^tttt,,,,...~TT.--..--------------TTTTTTTT----------------TT...o..TT^^^^^";
worldmap[19] = "^^^tt,,,,,....~T.-----------------TTTTTTTTTTTT--------------TTT.....TTT^^^^";
worldmap[20] = "^^,,t,,,,,,..o~.--------------------TTTTTTTTTT----------------TTTTTTTTTT.^^";
worldmap[21] = "^^-----,,,,-----------------------------TTTT-------------------.TTTTTT.---^";
worldmap[22] = "-------------------------------------------------------------------..-----^";
worldmap[23] = "---------------------------------------------------------------------------";
worldmap[24] = "---------------------------------------------------------------------------";
function pushToGamestate(gameState, map) {
    var ps = PS["Rogue"];
    var width = worldmap[0].length;
    var height = worldmap.length;
    var tiles = { '.': ps.Ground.create({ frozen: true }),
        ',': ps.Ground.create({ frozen: false }),
        '^': ps.Mountain.create({ frozen: true }),
        'v': ps.Mountain.create({ frozen: false }),
        'T': ps.Forest.create({ frozen: true }),
        't': ps.Forest.create({ frozen: false }),
        '-': ps.Water.create({ frozen: false }),
        '~': new ps.River(),
        'o': new ps.DungeonEntrance()
    };
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var char = worldmap[y][x];
            var tile = tiles[char];
            if (tile !== undefined) {
                gameState = ps.setTile(gameState)(tile)({ x: x, y: y });
            }
        }
    }
    return gameState;
}
//# sourceMappingURL=tsoutput.js.map