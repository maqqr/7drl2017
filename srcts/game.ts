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
    index: number;

    constructor(speed: number, isPlayer: boolean, index: number) {
        this.speed = speed;
        this.isPlayer = isPlayer;
        this.index = index;
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
    astar: ROT.Path.AStar;
    gameState: any;
    worldMap: Rogue.Level;

    actionlog: Array<string>;
 
    constructor() {
        let tileSet = new TileSet('tileset');
        this.display = new ROT.Display({
            width:75, height:30, fontSize: 16, spacing: 1.0,
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

        this.scheduler = new ROT.Scheduler.Speed<Actor>();
        this.scheduler.add(new Actor(50, true, -1), true);

        this.currentDungeon = "worldmap";
        this.worldMap = this.gameState.level;

        this.updateLoop();
    }

    isTransparent(x: number, y: number): boolean {
        let tile = PS["Rogue"].getTile(this.gameState)({x: x, y: y});
        return PS["Rogue"].isTileTransparent(tile);
    }

    isPassable(x: number, y: number): boolean {
        let tile = PS["Rogue"].getTile(this.gameState)({x: x, y: y});
        return !PS["Rogue"].isTileSolid(tile);
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
            else {
                let enemy = this.gameState.level.enemies[current.index];
                this.updateAI(enemy);
            }
        }
    }

    moveCreature(creature : any, delta : { x: number, y: number }) {
        var newPos = { x: creature.pos.x + delta.x, y: creature.pos.y + delta.y };

        let tile = PS["Rogue"].getTile(this.gameState)(newPos);
        if (!PS["Rogue"].isTileSolid(tile) && !(newPos.x < 0 || newPos.x >74) && !(newPos.y < 0 || newPos.y > 24) ) {
            creature.pos = newPos;
        }
    }

    updateAI(creature : any) {
        var rx = ROT.RNG.getUniformInt(-1, 1);
        var ry = ROT.RNG.getUniformInt(-1, 1);
        var dir = { x: rx, y: ry };
        this.moveCreature(creature, dir);
    }

    changeLevel(newLevel : Rogue.Level, playerPos : { x: number, y: number }) {
        this.gameState.level = newLevel;
        this.gameState.player.pos = playerPos;
        this.scheduler.clear();
        this.scheduler.add(new Actor(50, true, -1), true);
        for (let i = 0; i < this.gameState.level.enemies.length; i++) {
            this.scheduler.add(new Actor(50, false, i), true);
        }
        this.refreshDisplay();
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
                let newLevel;
                if (key in this.dungeonMaps) {
                    let floors = this.dungeonMaps[this.currentDungeon];
                    newLevel = floors[0];
                }
                else {
                    newLevel = this.generateLevel();
                    this.dungeonMaps[key] = [newLevel];
                }
                this.changeLevel(newLevel, newLevel.up);
            }
            // Stairs up & down are only found in dungeons
            else if (tileName == "StairsDown") {
                this.dungeonDepth++;
                let floors = this.dungeonMaps[this.currentDungeon];
                let newLevel;
                // If current floor is the last explored floor of the dungeon
                if (this.dungeonDepth == floors.length) {
                    newLevel = this.generateLevel();
                    floors.push(newLevel);
                }
                else {
                    newLevel = floors[this.dungeonDepth]
                }
                this.changeLevel(newLevel, newLevel.up);
            }
            else if (tileName == "StairsUp") {
                let floors = this.dungeonMaps[this.currentDungeon];
                // If we are on the first floor of the dungeon, the worldmap awaits at the top of the stairs
                this.dungeonDepth--;
                if (this.dungeonDepth == -1) {
                    // Get the dungeons position on the world map based on the dungeonmaps key
                    let mapPos = this.currentDungeon.split(",");
                    this.currentDungeon = "worldmap";
                    // Position point needs int values and .split() gives string
                    this.changeLevel(this.worldMap, { x: parseInt(mapPos[0]), y: parseInt(mapPos[1]) });
                }
                else {
                    let newOldLevel = floors[this.dungeonDepth];
                    this.changeLevel(newOldLevel, newOldLevel.down);
                }
            }
        }

        if (code == 106) {
            this.actionlog.push("Ilmoitus: "+this.actionlog.length);
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

    drawLog() {
        let itemsInLog = this.actionlog.length;
        let grayism = 50;
        if (itemsInLog > 0) {
            for (let i = -1; i>-5;i--) {
                if (itemsInLog+i <0) break;
                this.display.drawText(0,(30+i),"%c{rgba("+String(255+i*grayism)+","+String(255+i*grayism)+","+String(255+i*grayism)+",0.8)}"+this.actionlog[itemsInLog+i]+"%c{}",106);
            } 
        }
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
        let radius = 5;
        let player = this.gameState.player;
        let levelWidth = this.gameState.level.width;
        let levelHeight = this.gameState.level.height;

        this.drawLog();

        // Calculate player's field of view
        let visible = {};
        let fovCallback = function(x, y, r, v) {
            let dx = player.pos.x - x;
            let dy = player.pos.y - y;
            if (dx*dx + dy*dy < radius*radius) {
                visible["" + x + "," + y] = true;
                this.setRememberTile({ x: x, y: y });
            }
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

        // Draw enemies
        for (let i=0; i < this.gameState.level.enemies.length; i++) {
            let enemy = this.gameState.level.enemies[i];
            let enemyVisible = visible[enemy.pos.x + "," + enemy.pos.y] === true;
            if (enemyVisible) {
                let icon = PS["Rogue"].creatureIcon(enemy);
                let color = PS["Rogue"].creatureColor(enemy);
                this.display.draw(enemy.pos.x, enemy.pos.y, icon, color);
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

        let enemySeed = new Date().getTime();
        function randomEnemy() {
            let theme = undefined;
            let result = PS["Random"].runRandom(PS["ContentGenerator"].randomEnemy(theme)(this.dungeonDepth))(enemySeed);
            enemySeed = result.seed;
            return result.value;
        }
        randomEnemy.bind(this)();

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

        // Generate random enemies
        for (let i=0; i < 10; i++) {
            let enemy = randomEnemy();
            enemy.pos = randomFreePosition();
            level.enemies.push(enemy);
        }

        return level;
    }
}
