class TileSet {
    tileSet: HTMLElement;
    tileMap: object;
    tileWidth: number;
    tileHeight: number;
    constructor(imageId: string) {
        this.tileSet = document.getElementById(imageId);
        this.tileMap = {};
        this.tileWidth = 20;
        this.tileHeight = 24;
        for(let i=0; i<256; i++) {
            this.tileMap[String.fromCharCode(i)] =
                [(i % 16) * this.tileWidth, Math.floor(i / 16) * this.tileHeight];
        }
    }
}

class Actor {
    speed: number;
    isPlayer: boolean;
    constructor(speed: number, isPlayer: boolean) {
        this.speed = speed;
        this.isPlayer = isPlayer;
    }
    getSpeed(): number {
        return this.speed;
    }
}

class Game {
    static readonly keyMap: { [id: number] : number }
        = { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7};

    dungeonMaps: {[id: string] : Array<Rogue.Level>} = {};
    display: ROT.Display;
    scheduler: ROT.Scheduler.Speed<Actor>;
    gameState: any;
 
    constructor() {
        let tileSet = new TileSet('tileset');
        this.display = new ROT.Display({
            width:75, height:25, fontSize: 16, spacing: 1.0,
            layout: "tile", tileColorize: true,
            tileWidth: tileSet.tileWidth, tileHeight: tileSet.tileHeight,
            tileSet: tileSet.tileSet, tileMap: tileSet.tileMap
        });
        document.body.appendChild(this.display.getContainer());

        this.gameState = PS["Rogue"].initialGameState;

        this.gameState = pushToGamestate(this.gameState, worldmap);

        this.drawMap();

        this.scheduler = new ROT.Scheduler.Speed<Actor>();
        this.scheduler.add(new Actor(50, true), true);

        this.updateLoop();
    }

    updateLoop() {
        for(;;) {
            let current = this.scheduler.next();
            console.log(current);

            if (current.isPlayer) {
                window.addEventListener("keydown", this);
                break;
            }
        }
    }

    handleEvent(e: KeyboardEvent) {
        var code = e.keyCode;
        console.log(code);

        if (code == 111) {
            let playerPos = {x: this.gameState.player.pos.x, y: this.gameState.player.pos.y};
            let potentialDoor = PS["Rogue"].getTile(this.gameState)(playerPos);
            let tileName = PS["Data.Show"].show(PS["Rogue"].showTile)(potentialDoor);
            if (tileName == "DungeonEntrance") { 
                var key = "" + playerPos.x + "," + playerPos.y;
                if (key in this.dungeonMaps)
                {
                    // TODO: Get first level from this.dungeonMaps
                    console.log("Here be dungeonz");
                }
                else
                {
                    let newLevel = this.generateLevel();
                    this.dungeonMaps[key] = [newLevel];
                    this.gameState.level = newLevel;
                    console.log("Added new dungeon level");
                    this.drawMap();
                }
            }
        }

        if (!(code in Game.keyMap)) { return; }
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;

        var diff = ROT.DIRS[8][Game.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];

        let tile = PS["Rogue"].getTile(this.gameState)({x: newX, y: newY});
        if (!PS["Rogue"].isTileSolid(tile) && !(newX < 0 || newX >74) && !(newY < 0 || newY > 24) ) {
            this.gameState.player.pos = { x: newX, y: newY };
            this.drawMap();
        }

        window.removeEventListener("keydown", this);
        this.updateLoop();
    }

    drawMap() {
        this.display.clear();

        for (let y=0; y < this.gameState.level.height; y++) {
            for (let x=0; x < this.gameState.level.width; x++) {
                let tile = PS["Rogue"].getTile(this.gameState)({x: x, y: y});
                let icon = PS["Rogue"].tileIcon(tile);
                let col = PS["Rogue"].tileColor(tile);
                this.display.draw(x, y, icon, col);
            }
        }

        let player = this.gameState.player;
        this.display.draw(player.pos.x, player.pos.y, '@', "rgba(0, 200, 0, 0.6)");
    }

    generateLevel(): Rogue.Level {
        let width = 75;
        let height = 23;
        let fillTile = PS["Rogue"].Wall.create({ frozen: false });
        let level = PS["Rogue"].createLevel(width)(height)(fillTile);

        let digger = new ROT.Map.Digger(width, height);
        let digCallback = function(x, y, value) {
            if (value === 1) { return; }
            let position = { x: x, y: y };
            let floor = PS["Rogue"].Ground.create({ frozen: false });

            level = PS["Rogue"].setLevelTile(level)(floor)(position);
        }
        digger.create(digCallback.bind(this));

        let freePositions = [];
        for (let y=0; y<height; y++)
        {
            for (let x=0; x<width; x++)
            {
                let pos = { x: x, y: y };
                let tile = PS["Rogue"].getLevelTile(level)(pos);
                if (!PS["Rogue"].isTileSolid(tile)) {
                    freePositions.push(pos);
                }
            }
        }

        function randomFreePosition() {
            var index = Math.floor(ROT.RNG.getUniform() * freePositions.length);
            return freePositions.splice(index, 1)[0];
        }

        let startPos = randomFreePosition();
        this.gameState.player.pos = startPos; // TODO: remove
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsUp())(startPos);

        return level;
    }
}
