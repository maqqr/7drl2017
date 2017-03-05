
var TileSet = function(imageId) {
    this.tileSet = document.getElementById(imageId);
    this.tileMap = {};
    this.tileWidth = 20;
    this.tileHeight = 24;
    for(var i=0; i<256; i++) {
        this.tileMap[String.fromCharCode(i)] =
            [(i % 16) * this.tileWidth, Math.floor(i / 16) * this.tileHeight];
    }
}

var Actor = function(speed, isPlayer) {
    this.speed = speed;
    this.isPlayer = isPlayer;
}

Actor.prototype.getSpeed = function() {
    return this.speed;
}

var Game = {
    // Numpadin keycodea vastaavat ROT.DIRS suunnat.
    keyMap: { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7},

    display: null, // Rot.js display
    scheduler: null, // Rot.js actor scheduler
    gameState: null,
 
    init: function() {
        // Alustetaan konsoli.
        var tileSet = new TileSet('tileset');
        this.display = new ROT.Display({
            width:75, height:25, fontSize: 16, spacing: 1.0,
            layout: "tile", tileColorize: true,
            tileWidth: tileSet.tileWidth, tileHeight: tileSet.tileHeight,
            tileSet: tileSet.tileSet, tileMap: tileSet.tileMap
        });
        document.body.appendChild(this.display.getContainer());

        var startPosition = { x: 3, y: 5 };
        this.gameState = PS["Rogue"].createGameState(startPosition);
        console.log(this.gameState);

        this.generateMap();
        this.drawMap();

        // Lisätään pelaaja scheduleriin.
        this.scheduler = new ROT.Scheduler.Speed();
        this.scheduler.add(new Actor(50, true), true);

        this.updateLoop();
    },

    updateLoop: function() {
        // Poimitaan schedulerista actoreita kunnes tulee pelaajan vuoro.
        for(;;) {
            var current = this.scheduler.next();
            console.log(current);

            if (current.isPlayer) {
                window.addEventListener("keydown", this);
                break;
            }
        }
    },

    handleEvent: function(e) {
        var code = e.keyCode;
        console.log(code);
    
        if (!(code in this.keyMap)) { return; }
    
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;

        var diff = ROT.DIRS[8][this.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];
        var tile = PS["Rogue"].getTile(this.gameState)({x: newX, y: newY});
        console.log(tile);
        if (tile.solid == false) {

            this.gameState.player.pos = { x: newX, y: newY };

            if(tile == PS["Rogue"].chest) {
                this.gameState = PS["Rogue"].setTile(this.gameState)(PS["Rogue"].ground)({x: newX, y: newY});
                this.gameState.score += PS["Rogue"].randomScore();
                console.log(this.gameState.score);

            }
        }
        this.drawMap();

        window.removeEventListener("keydown", this);
        this.updateLoop();
    },

    generateMap: function() {
        var freeCells = [];
        function randomFreePosition() {
            var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
            var key = freeCells.splice(index, 1)[0];
            var parts = key.split(",");
            var x = parseInt(parts[0]);
            var y = parseInt(parts[1]);
            return { x: x, y: y};
        }

        var digger = new ROT.Map.Digger(this.gameState.tileMap.width, this.gameState.tileMap.height);
        var digCallback = function(x, y, value) {
            if (value) { return; }
            var key = x+","+y;
            freeCells.push(key);
            this.gameState = PS["Rogue"].setTile(this.gameState)(PS["Rogue"].ground)({x: x, y: y});
        }
        digger.create(digCallback.bind(this));

        //Pelaaja voi aloittaa arkun päältä, koska arkkujen paikkoja ei poisteta freeCellistä

        for(i = 0; i<10;i++) {
            this.gameState = PS["Rogue"].setTile(this.gameState)(PS["Rogue"].chest)(randomFreePosition());
        }

        this.gameState.player.pos = randomFreePosition();
    },

    drawMap: function() {
        // Piirretään kenttä.
        for (var y=0; y < this.gameState.tileMap.height; y++) {
            for (var x=0; x < this.gameState.tileMap.width; x++) {
                var tile = PS["Rogue"].getTile(this.gameState)({x: x, y: y});
                this.display.draw(x, y, tile.icon, tile.color);
            }
        }

        // Piirretään pelaaja.
        var player = this.gameState.player;
        this.display.draw(player.pos.x, player.pos.y, '@', "rgba(0, 200, 0, 0.6)");

        // Piirretään jotain satunnaista tekstiä eri väreillä.
        // Tämä on ihan testausta vaan ja tämän voi melkeinpä heittää pois.
        var words = "%c{rgba(255,0,0,0.6)}kala%c{} %c{rgba(255,0,255,0.6)}kalatus%c{} %c{rgba(0,255,255,0.6)}maccarae%c{} vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae donec egestas tristique consectetur ligula orci pellentesque sapien ac mollis augue orci nec metus".split(" ");
        var long = [];
        for (var i=0; i<30; i++) {
            long.push(words.random());
        }
        long = long.join(" ");

        this.display.drawText(41, 3, long, 35);
        // Piirretään pelaajan pisteet
        this.display.drawText(41, 1, "Score: "+this.gameState.score, "rgba(0, 200, 0, 0.6)");
    }
}

$(window).on("load", function() {
    Game.init();
});

// Prevent the backspace key from navigating back.
$(document).unbind('keydown').bind('keydown', function (event) {
    if (event.keyCode === 8) {
        var doPrevent = true;
        var types = ["text", "password", "file", "search", "email", "number", "date", "color", "datetime", "datetime-local", "month", "range", "search", "tel", "time", "url", "week"];
        var d = $(event.srcElement || event.target);
        var disabled = d.prop("readonly") || d.prop("disabled");
        if (!disabled) {
            if (d[0].isContentEditable) {
                doPrevent = false;
            } else if (d.is("input")) {
                var type = d.attr("type");
                if (type) {
                    type = type.toLowerCase();
                }
                if (types.indexOf(type) > -1) {
                    doPrevent = false;
                }
            } else if (d.is("textarea")) {
                doPrevent = false;
            }
        }
        if (doPrevent) {
            event.preventDefault();
            return false;
        }
    }
});