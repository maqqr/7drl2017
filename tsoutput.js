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
        var tileSet = new TileSet('tileset');
        this.display = new ROT.Display({
            width: 75, height: 25, fontSize: 16, spacing: 1.0,
            layout: "tile", tileColorize: true,
            tileWidth: tileSet.tileWidth, tileHeight: tileSet.tileHeight,
            tileSet: tileSet.tileSet, tileMap: tileSet.tileMap
        });
        document.body.appendChild(this.display.getContainer());
        this.gameState = PS["Rogue"].initialGameState;
        this.gameState = pushToGamestate(this.gameState, worldmap);
        this.drawMap();
        this.scheduler = new ROT.Scheduler.Speed();
        this.scheduler.add(new Actor(50, true), true);
        this.currentDungeon = "worldmap";
        this.worldMap = this.gameState.level;
        this.updateLoop();
    }
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
                if (key in this.dungeonMaps) {
                    // TODO: Get first level from this.dungeonMaps
                    console.log("Here be dungeonz");
                    var floors = this.dungeonMaps[this.currentDungeon];
                    this.gameState.level = floors[0];
                    this.gameState.player.pos = floors[0].up; // TODO: remove
                    this.drawMap();
                }
                else {
                    var newLevel = this.generateLevel();
                    this.dungeonMaps[key] = [newLevel];
                    this.gameState.level = newLevel;
                    console.log("Added new dungeon level");
                    this.gameState.player.pos = newLevel.up; // TODO: remove
                    this.drawMap();
                }
            }
            else if (tileName == "StairsDown") {
                var floors = this.dungeonMaps[this.currentDungeon];
                var currentFloorIndex = floors.indexOf(this.gameState.level);
                //If current floor is the last explored floor of the dungeon
                if (currentFloorIndex == floors.length - 1) {
                    var newLevel = this.generateLevel();
                    floors.push(newLevel);
                    this.gameState.level = newLevel;
                    this.gameState.player.pos = newLevel.up; // TODO: remove
                    this.drawMap();
                }
                else {
                    var newOldLevel = floors[currentFloorIndex + 1];
                    this.gameState.level = newOldLevel;
                    this.gameState.player.pos = newOldLevel.up; // TODO: remove
                    this.drawMap();
                }
            }
            else if (tileName == "StairsUp") {
                var floors = this.dungeonMaps[this.currentDungeon];
                var currentFloorIndex = floors.indexOf(this.gameState.level);
                //If we are on the first floor of the dungeon, the worldmap awaits at the top of the stairs
                if (currentFloorIndex == 0) {
                    //Get the dungeons position on the world map based on the dungeonmaps key
                    var mapPos = this.currentDungeon.split(",");
                    this.currentDungeon = "worldmap";
                    this.gameState.level = this.worldMap;
                    //Position point needs int values and .split() gives string
                    this.gameState.player.pos = { x: parseInt(mapPos[0]), y: parseInt(mapPos[1]) };
                    this.drawMap();
                }
                else {
                    var newOldLevel = floors[currentFloorIndex - 1];
                    this.gameState.level = newOldLevel;
                    this.gameState.player.pos = newOldLevel.down; // TODO: remove
                    this.drawMap();
                }
            }
        }
        if (code == 106) {
            console.log("Portaat ovat: " + this.gameState.level);
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
    Game.prototype.drawMap = function () {
        this.display.clear();
        for (var y = 0; y < this.gameState.level.height; y++) {
            for (var x = 0; x < this.gameState.level.width; x++) {
                var tile = PS["Rogue"].getTile(this.gameState)({ x: x, y: y });
                var icon = PS["Rogue"].tileIcon(tile);
                var col = PS["Rogue"].tileColor(tile);
                this.display.draw(x, y, icon, col);
            }
        }
        var player = this.gameState.player;
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
        var stairsUpPos = randomFreePosition();
        var stairsDownPos = randomFreePosition();
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsDown())(stairsDownPos);
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsUp())(stairsUpPos);
        level = PS["Rogue"].setExits(level)(stairsUpPos)(stairsDownPos);
        return level;
    };
    return Game;
}());
Game.keyMap = { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7 };
var worldmap = [];
worldmap[0] = "---------------------------------------------------------------------------";
worldmap[1] = "---------------------------------------------------------------------------";
worldmap[2] = "-----^^^--^^^^-------------------------------------------------------------";
worldmap[3] = "------^^^---^^^^-----------------------------------------------------------";
worldmap[4] = "-------^^^---^^^^^-----------------------................-----------.......";
worldmap[5] = "---------^^^--^^^^^^..^^^^^^^^^^^^^^^.....TT......TT......---------........";
worldmap[6] = "-----------^^^---^^^^...^^^^^^^^^^^^^...TTTTTT..TTTTTT .........---........";
worldmap[7] = "...TTTT.TT^^^...^^^o^^.................TTTTTTTTTTTTTTTT....................";
worldmap[8] = "....TT..^^^..^^^^^^..^^^^^^...^^^^^^^..TTTTTToTTTTTTTTT....................";
worldmap[9] = "..TT..^^^..^^^^^....---^^^^^^...^^o^^...TTTTTTTTTTTTTT.....................";
worldmap[10] = "...T.^^o..^^^^^..T-------^^^^^^...........TTTTTTTTTT.......................";
worldmap[11] = "...^^^..^^^^^...TT---------^^^^^^...........TTTTTT........TT...............";
worldmap[12] = "..^^^..^^^^^....---------TTTT^o^^^^...........TT........TT.................";
worldmap[13] = ".........................TTT...................TT....TT....................";
worldmap[14] = ".............................................TT.....TT.....................";
worldmap[15] = "............................................TT.......TT....................";
worldmap[16] = "............................................TT......TT.....................";
worldmap[17] = "..............................................TT...TT......................";
worldmap[18] = ".......................................^^^..............^^^^^^.............";
worldmap[19] = "........................................^^^....^^^^...^^.....^.............";
worldmap[20] = ".........................................^^^^......^^...^^^^^^.............";
worldmap[21] = "............................................^^^^......^^^^.................";
worldmap[22] = ".........................................^^^^^^...^^^^^....................";
worldmap[23] = "...........................................^^^^^^^.......^^................";
function pushToGamestate(gameState, map) {
    var ps = PS["Rogue"];
    var width = worldmap[0].length;
    var height = worldmap.length;
    var tiles = { '.': ps.Ground.create({ frozen: false }),
        '^': ps.Mountain.create({ frozen: false }),
        'T': ps.Forest.create({ frozen: false }),
        '-': ps.Water.create({ frozen: false }),
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