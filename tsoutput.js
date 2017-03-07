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
        if (!(code in Game.keyMap)) {
            return;
        }
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;
        var diff = ROT.DIRS[8][Game.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];
        var tile = PS["Rogue"].getTile(this.gameState)({ x: newX, y: newY });
        if (!PS["Rogue"].isTileSolid(tile)) {
            this.gameState.player.pos = { x: newX, y: newY };
            this.drawMap();
        }
        window.removeEventListener("keydown", this);
        this.updateLoop();
    };
    Game.prototype.drawMap = function () {
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
        '-': ps.Water.create({ frozen: false })
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