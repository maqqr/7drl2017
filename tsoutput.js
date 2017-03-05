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
        this.gameState.player.pos = { x: newX, y: newY };
        this.drawMap();
        window.removeEventListener("keydown", this);
        this.updateLoop();
    };
    Game.prototype.drawMap = function () {
        for (var y = 0; y < this.gameState.tileMap.height; y++) {
            for (var x = 0; x < this.gameState.tileMap.width; x++) {
                var tile = PS["Rogue"].getTile(this.gameState)({ x: x, y: y });
                this.display.draw(x, y, tile.icon, tile.color);
            }
        }
        var player = this.gameState.player;
        this.display.draw(player.pos.x, player.pos.y, '@', "rgba(0, 200, 0, 0.6)");
    };
    return Game;
}());
Game.keyMap = { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7 };
//# sourceMappingURL=tsoutput.js.map