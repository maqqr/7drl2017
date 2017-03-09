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
    rememberTile: {[id: string] : {[id: string] : boolean}} = {};
    currentDungeon: string;
    dungeonDepth: number; // -1 = world map, 0 = first level, 1 = second level
    display: ROT.Display;
    scheduler: ROT.Scheduler.Speed<Actor>;
    fov: ROT.FOV.PreciseShadowcasting;
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

        this.currentDungeon = "worldmap";
        this.dungeonDepth = -1;
        this.rememberTile = {};
        this.gameState = PS["Rogue"].initialGameState;
        this.gameState = pushToGamestate(this.gameState, worldmap);

        let isTransparent = function(x: number, y: number): boolean
        {
            let tile = PS["Rogue"].getTile(this.gameState)({x: x, y: y});
            return PS["Rogue"].isTileTransparent(tile);
        };
        this.fov = new ROT.FOV.PreciseShadowcasting(isTransparent.bind(this));

        this.drawMap();

        this.scheduler = new ROT.Scheduler.Speed<Actor>();
        this.scheduler.add(new Actor(50, true), true);

        this.currentDungeon = "worldmap";
        this.worldMap = this.gameState.level;

        this.updateLoop();
    }

    setRememberTile(pos: { x: number, y: number }) {
        let key = this.currentDungeon + "," + this.dungeonDepth;
        if (!(key in this.rememberTile)) {
            this.rememberTile[key] = {};
        }
        this.rememberTile[key][pos.x + "," + pos.y] = true;
    }

    remembersTile(pos: { x: number, y: number }) {
        let key = this.currentDungeon + "," + this.dungeonDepth;
        var dungeon = this.rememberTile[key];
        if (dungeon !== undefined) {
            var tile = dungeon[pos.x + "," + pos.y];
            return tile !== undefined;
        }
        return false;
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
                this.dungeonDepth = 0;
                if (key in this.dungeonMaps)
                {
                    let floors = this.dungeonMaps[this.currentDungeon];
                    this.gameState.level = floors[0];
                    this.gameState.player.pos = floors[0].up;
                    this.refreshDisplay();
                }
                else
                {
                    let newLevel = this.generateLevel();
                    this.dungeonMaps[key] = [newLevel];
                    this.gameState.level = newLevel;
                    console.log("Added new dungeon level");
                    this.gameState.player.pos = newLevel.up;
                    this.refreshDisplay();
                }
            }
            // Stairs up & down are only found in dungeons
            else if (tileName == "StairsDown") {
                this.dungeonDepth++;
                let floors = this.dungeonMaps[this.currentDungeon];
                // If current floor is the last explored floor of the dungeon
                if (this.dungeonDepth == floors.length) {
                    let newLevel = this.generateLevel();
                    floors.push(newLevel);
                    this.gameState.level = newLevel;
                    this.gameState.player.pos = newLevel.up;
                    this.refreshDisplay();
                }
                else {
                    let newOldLevel = floors[this.dungeonDepth]
                    this.gameState.level = newOldLevel;
                    this.gameState.player.pos = newOldLevel.up;
                    this.refreshDisplay();
                }
            }
            else if (tileName == "StairsUp") {
                let floors = this.dungeonMaps[this.currentDungeon];
                // If we are on the first floor of the dungeon, the worldmap awaits at the top of the stairs
                this.dungeonDepth--;
                if (this.dungeonDepth == -1) {
                    // Get the dungeons position on the world map based on the dungeonmaps key
                    let mapPos = this.currentDungeon.split(",");
                    this.currentDungeon = "worldmap";
                    this.gameState.level = this.worldMap;
                    // Position point needs int values and .split() gives string
                    this.gameState.player.pos = { x: parseInt(mapPos[0]), y: parseInt(mapPos[1]) };
                    this.refreshDisplay();
                }
                else {
                    let newOldLevel = floors[this.dungeonDepth];
                    this.gameState.level = newOldLevel;
                    this.gameState.player.pos = newOldLevel.down;
                    this.refreshDisplay();
                }
            }
        }

        if (code == 106) {
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

    drawTile(pos: { x: number, y: number }, visible: boolean, remember: boolean) {
        if (!visible && !remember)
            return;
        let tile = PS["Rogue"].getTile(this.gameState)(pos);
        let icon = PS["Rogue"].tileIcon(tile);
        let col = visible ? PS["Rogue"].tileColor(tile) : "rgba(30, 30, 30, 0.8)";
        this.display.draw(pos.x, pos.y, icon, col);
    }

    refreshDisplay() {
        this.display.clear();
        this.drawAllTiles();
        this.drawMap();
    }

    drawAllTiles() {
        for (let y=0; y < this.gameState.level.height; y++) {
            for (let x=0; x < this.gameState.level.width; x++) {
                let pos = { x: x, y: y };
                let rem = this.remembersTile(pos);
                this.drawTile(pos, false, rem);
            }
        }
    }

    drawMap() {
        let radius = 4;
        let player = this.gameState.player;
        let levelWidth = this.gameState.level.width;
        let levelHeight = this.gameState.level.height;

        // Calculate player's field of view
        let visible = {};
        let fovCallback = function(x, y, r, v) {
            visible["" + x + "," + y] = true;
            this.setRememberTile({ x: x, y: y });
        }
        this.fov.compute(player.pos.x, player.pos.y, radius, fovCallback.bind(this));

        // Add adjacent tiles to field of view
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                let pos = { x: player.pos.x + dx, y: player.pos.y + dy };
                visible["" + pos.x + "," + pos.y] = true;
                this.setRememberTile(pos);
            }
        }

        // Draw tiles
        for (let dy = -radius-1; dy <= radius+1; dy++) {
            for (let dx = -radius-1; dx <= radius+1; dx++) {
                let pos = { x: player.pos.x + dx, y: player.pos.y + dy };
                if (pos.x < 0 || pos.y < 0 || pos.x >= levelWidth || pos.y >= levelHeight)
                    continue;

                let vis = visible[pos.x + "," + pos.y] === true;
                let rem = this.remembersTile(pos);
                this.drawTile(pos, vis, rem);
            }
        }

        // Draw items
        for (let i=0; i < this.gameState.level.items.length; i++) {
            let item = this.gameState.level.items[i];
            let itemVisible = visible[item.pos.x + "," + item.pos.y] === true;
            if (itemVisible) {
                let icon = PS["Rogue"].itemIcon(item.item);
                let color = PS["Rogue"].itemColor(item.item);            
                this.display.draw(item.pos.x, item.pos.y, icon, color);
            }
        }

        // Draw player
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

        let itemSeed = new Date().getTime();
        function randomItem() {
            let theme = undefined;
            let result = PS["Random"].runRandom(PS["ContentGenerator"].randomItem(theme)(this.dungeonDepth))(itemSeed);
            itemSeed = result.seed;
            return result.value;
        }
        randomItem.bind(this)();

        // Generate stairs
        let stairsUpPos = randomFreePosition();
        let stairsDownPos = randomFreePosition();
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsDown())(stairsDownPos);
        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsUp())(stairsUpPos);
        level = PS["Rogue"].setExits(level)(stairsUpPos)(stairsDownPos);

        // Remove stairs from free positions
        freePositions.splice(freePositions.indexOf(stairsUpPos), 1);
        freePositions.splice(freePositions.indexOf(stairsDownPos), 1);

        // Generate random items
        for (let i=0; i < 10; i++) {
            let pos = randomFreePosition();
            let item = randomItem();
            level.items.push({ pos: pos, item: item });
        }

        return level;
    }
}
