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

class Game {
    static readonly keyMap: { [id: number] : number }
        = { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7};

    dungeonMaps: {[id: string] : Array<Rogue.Level>} = {};
    rememberTile: {[id: string] : {[id: string] : boolean}} = {};
    currentDungeon: string;
    dungeonDepth: number; // -1 = world map, 0 = first level, 1 = second level
    display: ROT.Display;
    fov: ROT.FOV.PreciseShadowcasting;
    visible: {[id: string]: boolean} = {};
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

        this.currentDungeon = "worldmap";
        this.worldMap = this.gameState.level;

        this.playerTurn();
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

    playerTurn() {
        window.addEventListener("keydown", this);
    }

    updateLoop(deltaTime: number) {
        for (let id in this.gameState.level.enemies) {
            let enemy = this.gameState.level.enemies[id];
            let speed = PS["Rogue"].creatureSpeed(enemy);
            enemy.time += deltaTime;
            while (enemy.time >= speed) {
                enemy.time -= speed;
                this.updateAI(id, enemy);
            }
        }

        this.playerTurn();
    }

    moveCreature(creature: any, delta: { x: number, y: number }) {
        var newPos = { x: creature.pos.x + delta.x, y: creature.pos.y + delta.y };

        // Check if there is anyone at newPos
        let blockingId: string = null;
        let blocking = null;
        for (let id in this.gameState.level.enemies) {
            let other = this.gameState.level.enemies[id];
            if (other.pos.x == newPos.x && other.pos.y == newPos.y) {
                blockingId = id;
                blocking = other;
                break;
            }
        }
        if (newPos.x == this.gameState.player.pos.x && newPos.y == this.gameState.player.pos.y) {
            blockingId = "player";
            blocking = this.gameState.player;
        }

        if (blocking !== null) {
            if (PS["Rogue"].isPlayer(creature) !== PS["Rogue"].isPlayer(blocking)) {
                let result = PS["Rogue"].attack(this.gameState)(creature)(blocking);
                blocking.stats.hp = result.stats.hp;

                if (blocking.stats.hp <= 0 && !PS["Rogue"].isPlayer(blocking)) {
                    delete this.gameState.level.enemies[blockingId];
                }
            }
            return;
        }

        // Tile is free of creatures, attempt to move there
        let tile = PS["Rogue"].getTile(this.gameState)(newPos);
        if (!PS["Rogue"].isTileSolid(tile) && !(newPos.x < 0 || newPos.x >74) && !(newPos.y < 0 || newPos.y > 24) ) {
            creature.pos = newPos;
        }
        return creature;
    }

    updateAI(id: string, creature: any) {
        if (this.visible[creature.pos.x + "," + creature.pos.y] === true) {
            let p = this.gameState.player.pos;
            let astar = new ROT.Path.AStar(p.x, p.y, this.isPassable.bind(this));
            let path = [];
            astar.compute(creature.pos.x, creature.pos.y, function(x, y) {
                path.push({ x: x, y: y});
            });
            path.splice(0, 1);
            if (path.length > 0) {
                let nextPos = path[0];
                let delta = { x: nextPos.x - creature.pos.x, y: nextPos.y - creature.pos.y };
                this.moveCreature(creature, delta);
            }
        }
        else {
            var rx = ROT.RNG.getUniformInt(-1, 1);
            var ry = ROT.RNG.getUniformInt(-1, 1);
            var dir = { x: rx, y: ry };
            this.moveCreature(creature, dir);
        }
    }

    changeLevel(newLevel : Rogue.Level, playerPos : { x: number, y: number }) {
        this.gameState.level = newLevel;
        this.gameState.player.pos = playerPos;
        this.refreshDisplay();
    }

    handleEvent(e: KeyboardEvent) {
        var code = e.keyCode;
        //console.log(code);

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
            this.add2ActnLog("Ilmoitus: "+this.actionlog.length);
        }

        if (!(code in Game.keyMap)) { return; }
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;

        var diff = ROT.DIRS[8][Game.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];

        this.moveCreature(this.gameState.player, { x: diff[0], y: diff[1] });
        this.drawMap();

        window.removeEventListener("keydown", this);

        let deltaTime = PS["Rogue"].creatureSpeed(this.gameState.player);
        this.updateLoop(deltaTime);
    }

    add2ActnLog(message:string) {
        this.actionlog.push(message);
        if (this.actionlog.length > 20) {
            this.actionlog.splice(0,1);
        }
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
    
    /**
     * Draws the player's stats.
     */
    staTifY() {
        this.display.drawText(0, 25, "%c{rgba(0,0,0,1.0)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
        //hp
        let hp = this.gameState.player.stats.hp
        let maxhp = this.gameState.player.stats.hpMax
        let hpscale = String(Math.round(255*hp/maxhp));
        this.display.drawText(2, 25, "HP: "+"%c{rgba(255,"+hpscale+","+hpscale+",0.6)}"+hp+"%c{}"+"/"+maxhp)
        //coldness
        let cold = this.gameState.coldStatus;
        let coldscale = String(Math.round(255*(1-cold/100)));
        this.display.drawText(20,25,"You are %c{rgba("+coldscale+",255,255,0.6)}"+cold+"%c{}% freezing")
        
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

        this.staTifY();
        this.drawLog();

        // Calculate player's field of view
        this.visible = {};
        let fovCallback = function(x, y, r, v) {
            let dx = player.pos.x - x;
            let dy = player.pos.y - y;
            if (dx*dx + dy*dy < radius*radius) {
                this.visible["" + x + "," + y] = true;
                this.setRememberTile({ x: x, y: y });
            }
        }
        this.fov.compute(player.pos.x, player.pos.y, radius, fovCallback.bind(this));

        // Add adjacent tiles to field of view
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                let pos = { x: player.pos.x + dx, y: player.pos.y + dy };
                this.visible["" + pos.x + "," + pos.y] = true;
                this.setRememberTile(pos);
            }
        }

        // Draw tiles
        for (let dy = -radius-1; dy <= radius+1; dy++) {
            for (let dx = -radius-1; dx <= radius+1; dx++) {
                let pos = { x: player.pos.x + dx, y: player.pos.y + dy };
                if (pos.x < 0 || pos.y < 0 || pos.x >= levelWidth || pos.y >= levelHeight)
                    continue;

                let vis = this.visible[pos.x + "," + pos.y] === true;
                let rem = this.remembersTile(pos);
                this.drawTile(pos, vis, rem);
            }
        }

        // Draw items
        for (let i=0; i < this.gameState.level.items.length; i++) {
            let item = this.gameState.level.items[i];
            let itemVisible = this.visible[item.pos.x + "," + item.pos.y] === true;
            if (itemVisible) {
                let icon = PS["Rogue"].itemIcon(item.item);
                let color = PS["Rogue"].itemColor(item.item);
                this.display.draw(item.pos.x, item.pos.y, icon, color);
            }
        }

        // Draw enemies
        for (let id in this.gameState.level.enemies) {
            let enemy = this.gameState.level.enemies[id];
            let enemyVisible = this.visible[enemy.pos.x + "," + enemy.pos.y] === true;
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
            level.enemies[i] = enemy;
        }

        return level;
    }
}
