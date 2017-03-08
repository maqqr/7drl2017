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
    currentDungeon: string;
    display: ROT.Display;
    scheduler: ROT.Scheduler.Speed<Actor>;
    gameState: any;
    worldMap: Rogue.Level;
 
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

        this.currentDungeon = "worldmap";
        this.worldMap = this.gameState.level;

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
                this.currentDungeon = key;
                if (key in this.dungeonMaps)
                {
                    // TODO: Get first level from this.dungeonMaps
                    console.log("Here be dungeonz");
                    let floors = this.dungeonMaps[this.currentDungeon];
                    this.gameState.level = floors[0];
                    this.gameState.player.pos = floors[0].up; // TODO: remove
                    this.drawMap();


                }
                else
                {
                    let newLevel = this.generateLevel();
                    this.dungeonMaps[key] = [newLevel];
                    this.gameState.level = newLevel;
                    console.log("Added new dungeon level");
                    this.gameState.player.pos = newLevel.up; // TODO: remove
                    this.drawMap();
                }
            }
            //Stairs up&down are only found in dungeons
            else if (tileName == "StairsDown") {
                let floors = this.dungeonMaps[this.currentDungeon];
                let currentFloorIndex = floors.indexOf(this.gameState.level);
                //If current floor is the last explored floor of the dungeon
                if (currentFloorIndex == floors.length-1) {
                    let newLevel = this.generateLevel();
                    floors.push(newLevel);
                    this.gameState.level = newLevel;
                    this.gameState.player.pos = newLevel.up; // TODO: remove
                    this.drawMap();

                }
                else {
                    let newOldLevel = floors[currentFloorIndex +1]
                    this.gameState.level = newOldLevel;
                    this.gameState.player.pos = newOldLevel.up; // TODO: remove
                    this.drawMap();
                }
            }
            else if (tileName == "StairsUp") {
                let floors = this.dungeonMaps[this.currentDungeon];
                let currentFloorIndex = floors.indexOf(this.gameState.level);
                //If we are on the first floor of the dungeon, the worldmap awaits at the top of the stairs
                if(currentFloorIndex == 0) {
                    //Get the dungeons position on the world map based on the dungeonmaps key
                    let mapPos = this.currentDungeon.split(",");
                    this.currentDungeon = "worldmap";
                    this.gameState.level = this.worldMap;
                    //Position point needs int values and .split() gives string
                    this.gameState.player.pos = { x: parseInt(mapPos[0]), y: parseInt(mapPos[1]) };
                    this.drawMap();

                }
                else {
                    let newOldLevel = floors[currentFloorIndex -1]
                    this.gameState.level = newOldLevel;
                    this.gameState.player.pos = newOldLevel.down; // TODO: remove
                    this.drawMap();
                }
            }
        }

        if(code == 106) {
            console.log("Portaat ovat: "+this.gameState.level);
        }

        if (!(code in Game.keyMap)) { return; }
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;

        var diff = ROT.DIRS[8][Game.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];

        let tile = PS["Rogue"].getTile(this.gameState)({x: newX, y: newY});
        console.log(tile);
        console.log("Going to pos:"+newX+","+newY);
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

        let stairsUpPos = randomFreePosition();
        let stairsDownPos = randomFreePosition();
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsDown())(stairsDownPos);
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsUp())(stairsUpPos);
        level = PS["Rogue"].setExits(level)(stairsUpPos)(stairsDownPos);
        return level;
    }
}
