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

const enum State {
    InGame,
    Inventory,
    MessageBuffer,
    GitGud,
    Start,
    Victory
}

const enum InventoryState {
    Show,
    Drop,
    Equip,
    Unequip,
    Use
}

class Game {
    static readonly keyMap: { [id: number] : number }
        = { 104: 0, 105: 1, 102: 2, 99: 3, 98: 4, 97: 5, 100: 6, 103: 7, 37: 6, 38: 0, 39: 2, 40: 4, 33: 1, 34: 3, 46: 5, 45:7};

    dungeonMaps: {[id: string] : Array<Rogue.Level>} = {};
    rememberTile: {[id: string] : {[id: string] : boolean}} = {};
    currentDungeon: string;
    dungeonDepth: number; // -1 = world map, 0 = first level, 1 = second level
    display: ROT.Display;
    fov: ROT.FOV.PreciseShadowcasting;
    visible: {[id: string]: boolean} = {};
    gameState: any;
    worldMap: Rogue.Level;
    state: State;
    invState: InventoryState;
    handlers: { [id: number]: (e: KeyboardEvent) => void } = {};
    themes: { [id: string]: Rogue.Theme } = {};
    wizardDead: boolean;
    inputtedName:string;
    enteredName: boolean;

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

        let help = [ "NumPad numbers - move"
                   , "arrow keys + DEL, END, INS, PGUP, PGDOWN - alternative movement keys"
                   , "NumPad / (division) or HOME - move into dungeons and between floors"
                   , "U - use items"
                   , "M - message log"
                   , "I - inventory"
                   , "D - drop items"
                   , "G - pick up items"
                   , "E - equip items"
                   , "T - take off (unequip) items"];

        let helpP = document.createElement("p");
        let helpText = document.createTextNode("List of possible commands:");
        helpP.appendChild(helpText);
        document.body.appendChild(helpP);
        let helpUl = document.createElement("ul");

        for (let i=0; i<help.length; i++) {
            let moveLi = document.createElement("li");
            let moveText = document.createTextNode(help[i]);
            moveLi.appendChild(moveText);
            helpUl.appendChild(moveLi);
        }

        document.body.appendChild(helpUl);

        let tipsP = document.createElement("p");
        let tipsText = document.createTextNode("Tips: Use wood to make a campfire. Press numpad 5 or END to wait near the campfire to warm up. Use healing potion to regain hit points. Liquid fire reduces coldness. Killing enemies does not benefit you so choose your fights wisely.");
        tipsP.appendChild(tipsText);
        document.body.appendChild(tipsP);

        this.handlers[State.InGame] = this.handleInGame.bind(this);
        this.handlers[State.Inventory] = this.handleInventory.bind(this);
        this.handlers[State.MessageBuffer] = this.handleMessageBuffer.bind(this);
        this.handlers[State.GitGud] = this.handleGitGud.bind(this);
        this.handlers[State.Victory] = this.handleVictory.bind(this);
        this.handlers[State.Start] = this.handleStart.bind(this);

        this.fov = new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));

        this.startNewGame();

        //this.drawMap();

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

        this.drawMap();
        this.playerTurn();
    }

    moveCreature(creature: any, delta: { x: number, y: number }): boolean {
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
                let green = "";
                let brown = "";
                if(PS["Rogue"].isPlayer(creature)) {
                    green = "%c{rgba(0,255,0,0.8)}";
                    brown = "%c{rgba(255,51,153,0.6)}";
                }
                else {
                    green = "%c{rgba(255,51,153,0.6)}";
                    brown = "%c{rgba(0,255,0,0.8)}";
                }

                let hitChance = PS["Rogue"].creatureHitChance(this.gameState)(creature);
                let name = PS["Data.Show"].show(PS["Rogue"].showCreature)(creature);
                name = name.charAt(0).toUpperCase() + name.slice(1);
                let blockname = PS["Data.Show"].show(PS["Rogue"].showCreature)(blocking);
                if (ROT.RNG.getUniformInt(0, 100) < hitChance) {
                    let seed = new Date().getTime();
                    let result = PS["Rogue"].attack(seed)(this.gameState)(creature)(blocking);
                    this.add2ActnLog(green+name+"%c{} hit "+brown+PS["Data.Show"].show(PS["Rogue"].showCreature)(blocking)+"%c{} for %c{rgba(255,0,0,0.8)}"+String(blocking.stats.hp-result.stats.hp)+"%c{} points of damage.");
                    if(result.stats.hp <=0) {
                        this.add2ActnLog(green+name+"%c{} killed the "+brown+blockname+"%c{}.");

                        if (blockname == "evil wizard") {
                            this.wizardDead = true;
                        }
                    }
                    blocking.stats.hp = result.stats.hp;

                    if (blocking.stats.hp <= 0 && !PS["Rogue"].isPlayer(blocking)) {
                        delete this.gameState.level.enemies[blockingId];
                    }
                }
                else {
                    this.add2ActnLog(green+name+"%c{} tried to hit "+brown+blockname+"%c{}, but missed!");
                }
            }
            return true;
        }

        // Tile is free of creatures, attempt to move there
        let tile = PS["Rogue"].getTile(this.gameState)(newPos);
        if (!PS["Rogue"].isTileSolid(tile) && !(newPos.x < 0 || newPos.x >74) && !(newPos.y < 0 || newPos.y > 24) ) {
            creature.pos = newPos;
            return true;
        }
        return false;
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
        if (this.state in this.handlers) {
            this.handlers[this.state](e);
        }
    }

    handleMessageBuffer(e: KeyboardEvent) {
        this.state = State.InGame;
        this.refreshDisplay();
    }

    handleInventory(e: KeyboardEvent) {
        let code = e.keyCode;
        if (code == ROT.VK_RETURN || code == ROT.VK_SPACE || (code == ROT.VK_I && this.invState == InventoryState.Show)) {
            this.state = State.InGame;
            this.refreshDisplay();
        }
        else {
            // Unequip item
            if (this.invState == InventoryState.Unequip) {
                let rogue = PS["Rogue"];
                let maybe = PS["Data.Maybe"];

                if (code == ROT.VK_A) {
                    if (maybe.isJust(this.gameState.equipment.cloak)) {
                        let equipped = this.gameState.equipment.cloak.value0;
                        this.gameState.equipment.cloak = new maybe.Nothing();
                        this.gameState.player.inv.push(equipped);
                        this.add2ActnLog("You take off the " + rogue.itemName(equipped) + ".");
                    }
                    else {
                        this.add2ActnLog("You don't have a cloak.");
                    }
                }

                if (code == ROT.VK_B) {
                    if (maybe.isJust(this.gameState.equipment.chest)) {
                        let equipped = this.gameState.equipment.chest.value0;
                        this.gameState.equipment.chest = new maybe.Nothing();
                        this.gameState.player.inv.push(equipped);
                        this.add2ActnLog("You take off the " + rogue.itemName(equipped) + ".");
                    }
                    else {
                        this.add2ActnLog("You don't have anything on your torso.");
                    }
                }

                if (code == ROT.VK_C) {
                    if (maybe.isJust(this.gameState.equipment.hands)) {
                        let equipped = this.gameState.equipment.hands.value0;
                        this.gameState.equipment.hands = new maybe.Nothing();
                        this.gameState.player.inv.push(equipped);
                        this.add2ActnLog("You take off the " + rogue.itemName(equipped) + ".");
                    }
                    else {
                        this.add2ActnLog("You don't have gloves.");
                    }
                }

                if (code == ROT.VK_D) {
                    if (maybe.isJust(this.gameState.equipment.weapon)) {
                        let equipped = this.gameState.equipment.weapon.value0;
                        this.gameState.equipment.weapon = new maybe.Nothing();
                        this.gameState.player.inv.push(equipped);
                        this.add2ActnLog("You take off the " + rogue.itemName(equipped) + ".");
                    }
                    else {
                        this.add2ActnLog("You can't remove your fists.");
                    }
                }

                this.state = State.InGame;
                this.refreshDisplay();
                this.nextTurn();
            }

            let itemIndex = code - 65;
            if (itemIndex >= 0 && itemIndex < this.gameState.player.inv.length) {
                let item = this.gameState.player.inv[itemIndex];
                
                // Drop item
                if (this.invState == InventoryState.Drop) {
                    this.gameState.player.inv.splice(itemIndex, 1);
                    this.gameState.level.items.push({ pos: this.gameState.player.pos, item: item });
                    this.add2ActnLog("You drop " + PS["Rogue"].itemName(item) + ".");
                }

                // Use item
                if (this.invState == InventoryState.Use) {
                    if (this.currentDungeon == "worldmap" && PS["Rogue"].itemName(item) == "wood") {
                        this.add2ActnLog("You can't make a campfire here, find a sheltered location.");
                    }
                    else if(PS["Rogue"].itemName(item) == "wood"){
                        let tile = PS["Rogue"].getTile(this.gameState)(this.gameState.player.pos);
                        let tileName = PS["Data.Show"].show(PS["Rogue"].showTile)(tile);
                        if (tileName == "Ground") {
                            this.gameState.player.inv.splice(itemIndex, 1);
                            this.add2ActnLog("You make a campfire.");
                            let index = this.gameState.player.pos.y * this.gameState.level.width + this.gameState.player.pos.x;
                            this.gameState.level.tiles[index] = new PS["Rogue"].Fire();
                        }
                        else {
                            this.add2ActnLog("You can't light a fire here.");
                        }

                    }
                    else if(PS["Rogue"].itemName(item) == "healing potion") {
                        this.gameState.player.inv.splice(itemIndex, 1);
                        this.add2ActnLog("You drink the %c{rgba(0,255,0,0.8)}healing potion%c{}. You feel %c{rgba(102,255,102,0.8)}a bit better%c{}.");
                        this.gameState.player.stats.hp = Math.min(this.gameState.player.stats.hp+20, this.gameState.player.stats.hpMax);
                    }
                    else if(PS["Rogue"].itemName(item) == "liquid fire") {
                        this.gameState.player.inv.splice(itemIndex, 1);
                        this.add2ActnLog("You drink the %c{rgba(0,255,0,0.8)}liquid fire.%c{} You feel a %c{rgba(255,128,0,0.8)}fire%c{} burning inside you.");
                        this.gameState.coldStatus = Math.max(0,this.gameState.coldStatus-25);
                    }
                }

                // Equip item
                if (this.invState == InventoryState.Equip) {
                    let rogue = PS["Rogue"];
                    let maybe = PS["Data.Maybe"];

                    if (rogue.isArmourOfType(item)(new rogue.Cloak())) {
                        this.gameState.player.inv.splice(itemIndex, 1);
                        if (maybe.isJust(this.gameState.equipment.cloak)) {
                            let equipped = this.gameState.equipment.cloak.value0;
                            this.gameState.player.inv.push(equipped);
                        }
                        this.gameState.equipment.cloak = maybe.Just.create(item);
                        this.add2ActnLog("You equip the " + rogue.itemName(item) + ".");
                    }

                    else if (rogue.isArmourOfType(item)(new rogue.Chest())) {
                        this.gameState.player.inv.splice(itemIndex, 1);
                        if (maybe.isJust(this.gameState.equipment.chest)) {
                            let equipped = this.gameState.equipment.chest.value0;
                            this.gameState.player.inv.push(equipped);
                        }
                        this.gameState.equipment.chest = maybe.Just.create(item);
                        this.add2ActnLog("You equip the " + rogue.itemName(item) + ".");
                    }

                    else if (rogue.isArmourOfType(item)(new rogue.Gloves())) {
                        this.gameState.player.inv.splice(itemIndex, 1);
                        if (maybe.isJust(this.gameState.equipment.hands)) {
                            let equipped = this.gameState.equipment.hands.value0;
                            this.gameState.player.inv.push(equipped);
                        }
                        this.gameState.equipment.hands = maybe.Just.create(item);
                        this.add2ActnLog("You equip the " + rogue.itemName(item) + ".");
                    }

                    else if (rogue.isWeapon(item)) {
                        this.gameState.player.inv.splice(itemIndex, 1);
                        if (maybe.isJust(this.gameState.equipment.weapon)) {
                            let equipped = this.gameState.equipment.weapon.value0;
                            this.gameState.player.inv.push(equipped);
                        }
                        this.gameState.equipment.weapon = maybe.Just.create(item);
                        this.add2ActnLog("You equip the " + rogue.itemName(item) + ".");
                    }

                    else {
                        this.add2ActnLog("You can't equip " + rogue.itemName(item) + ".");
                    }
                }

                this.state = State.InGame;
                this.refreshDisplay();
                this.nextTurn();
            }
        }
    }

    handleGitGud(e: KeyboardEvent) {
       var code = e.keyCode;
       if (code == ROT.VK_RETURN) {
           this.startNewGame();
       }
    }

    handleVictory(e: KeyboardEvent) {
       var code = e.keyCode;
       if (code == ROT.VK_RETURN) {
           this.startNewGame();
       }
    }

    handleStart(e: KeyboardEvent) {
        this.display.clear();
        var code = e.keyCode;
        this.display.drawText(11,20,"Press Enter to select name. You can erase with Delete.")
        if(this.enteredName == false) {
            this.display.drawText(25,10, "Enter your name: "+this.inputtedName+"%c{rgba(0,0,0,1)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
            if(code == ROT.VK_DELETE && this.inputtedName.length>0) {
                this.inputtedName = this.inputtedName.slice(0,this.inputtedName.length-1);
                 this.display.drawText(25,10, "Enter your name: "+this.inputtedName+"%c{rgba(0,0,0,1)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
            }
            else if (code >=65 && code <= 90 && this.inputtedName.length <=12) {
                let insertChar = String.fromCharCode(code);
                if(this.inputtedName.length>0) insertChar = insertChar.toLowerCase();
                this.inputtedName += insertChar;
                 this.display.drawText(25,10, "Enter your name: "+this.inputtedName+"%c{rgba(0,0,0,1)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
            }
            else if (code == ROT.VK_RETURN && this.inputtedName.length > 0) {
                this.enteredName = true;
                this.gameState.player.creatureType.value0.name = this.inputtedName;
                let possibleText = document.getElementById("story");
                if(possibleText != null) {
                       document.body.removeChild(possibleText);
                }
                this.displayStory();
            }
        }
        else {
            this.displayStory();
            if (code == ROT.VK_RETURN) {
                this.state = State.InGame;
                let storyText = document.createTextNode("You are a fearless peasant called "+PS["Data.Show"].show(PS["Rogue"].showCreature)(this.gameState.player)+". An evil wizard has cast a spell that has covered the world in everfrost. The everfrost is damaging your pumpkin harvest. The wizard has to die.");
                let storyP = document.createElement("p");
                storyP.setAttribute("id","story");
                storyP.appendChild(storyText);
                document.body.appendChild(storyP);
                
                this.refreshDisplay();
            }
        }
    }

    displayStory() {
        this.display.clear();
        this.display.drawText(13,10,"You are a fearless peasant called %c{rgba(0,255,0,0.8)}"+PS["Data.Show"].show(PS["Rogue"].showCreature)(this.gameState.player)+"%c{}.");
        this.display.drawText(3,11,"%c{rgba(245, 65, 241, 0.6)}An evil wizard%c{} has cast a spell that covered the world in %c{rgba(153,255,255,0.8)}everfrost%c{}.");
        this.display.drawText(10,12,"%c{rgba(153,255,255,0.8)}The everfrost%c{} is damaging your %c{rgba(255,128,0,0.8)}pumpkin%c{} harvest.");
        this.display.drawText(22,13,"%c{rgba(245, 65, 241, 0.6)}The wizard%c{} has to %c{rgba(255, 0, 0, 1)}die%c{}.");

        this.display.drawText(17, 17, "You have travelled to a faraway valley.");
        this.display.drawText(16, 19, "%c{rgba(245, 65, 241, 0.6)}The wizard's%c{} hideout is somewhere here...");
    }

    handleInGame(e: KeyboardEvent) {
        var code = e.keyCode;

        if(this.checkAliveStatus() == false) {
            this.state = State.GitGud;
            return;
        }

        if (this.wizardDead) {
            this.victory();
            return;
        }

        if (code == ROT.VK_DIVIDE || code == ROT.VK_HOME) {
            let playerPos = {x: this.gameState.player.pos.x, y: this.gameState.player.pos.y};
            let potentialDoor = PS["Rogue"].getTile(this.gameState)(playerPos);
            let tileName = PS["Data.Show"].show(PS["Rogue"].showTile)(potentialDoor);
            if (tileName == "DungeonEntrance" || tileName == "Hideout") {
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
                let theme = this.themes[this.currentDungeon];
                    this.add2ActnLog("You enter the " + PS["Rogue"].themeName(theme) + " floor " + (this.dungeonDepth + 1) + ".");
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
                let theme = this.themes[this.currentDungeon];
                this.add2ActnLog("You enter the " + PS["Rogue"].themeName(theme) + " floor " + (this.dungeonDepth + 1) + ".");
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
                    let theme = this.themes[this.currentDungeon];
                    this.add2ActnLog("You enter the " + PS["Rogue"].themeName(theme) + " floor " + (this.dungeonDepth + 1) + ".");
                    let newOldLevel = floors[this.dungeonDepth];
                    this.changeLevel(newOldLevel, newOldLevel.down);
                }
            }
        }

        // Show message buffer
        if (code == ROT.VK_M) {
            this.drawmMsgbuFF();
            this.state = State.MessageBuffer;
            return;
        }

        // Show inventory, equip, drop, use, etc.
        let invStates = {};
        invStates[ROT.VK_I] = InventoryState.Show;
        invStates[ROT.VK_E] = InventoryState.Equip;
        invStates[ROT.VK_T] = InventoryState.Unequip;
        invStates[ROT.VK_D] = InventoryState.Drop;
        invStates[ROT.VK_U] = InventoryState.Use;
        if (code in invStates) {
            this.state = State.Inventory;
            this.invState = invStates[code];
            this.drawInventory();
            return;
        }

        // Pickup item
        if (code == ROT.VK_G || code == ROT.VK_COMMA) {
            let itemsAtPlayer = []
            for (let item of this.gameState.level.items) {
                if (PS["Rogue"].pointEquals(this.gameState.player.pos)(item.pos)) {
                    itemsAtPlayer.push(item);
                }
            }

            if (itemsAtPlayer.length > 0) {
                let item = itemsAtPlayer[itemsAtPlayer.length-1];
                let index = this.gameState.level.items.indexOf(item);
                if (PS["Rogue"].totalEnc(this.gameState) + PS["Rogue"].itemWeight(item.item) <= this.gameState.maxEnc) {
                    this.gameState.level.items.splice(index, 1);
                    this.add2ActnLog(PS["Data.Show"].show(PS["Rogue"].showCreature)(this.gameState.player)+ " picked up %c{rgba(0,255,0,1.0)}"+PS["Rogue"].itemName(item.item)+"%c{}!")
                    this.gameState.player.inv.push(item.item);
                }
                else {
                    this.add2ActnLog("You can't pick up the " + PS["Rogue"].itemName(item.item) + ". You are carrying too much.")
                }
            }

            this.nextTurn();
            return;
        }

        // Check if player pressed numpad keys
        if (code in Game.keyMap) {
            var oldX = this.gameState.player.pos.x;
            var oldY = this.gameState.player.pos.y;

            var diff = ROT.DIRS[8][Game.keyMap[code]];
            var newX = oldX + diff[0];
            var newY = oldY + diff[1];

            let success = this.moveCreature(this.gameState.player, { x: diff[0], y: diff[1] });
            if (success) {
                let tile = PS["Rogue"].getTile(this.gameState)(this.gameState.player.pos);
                let tileName = PS["Data.Show"].show(PS["Rogue"].showTile)(tile);
                if (tileName == "DungeonEntrance") {
                    let theme = this.themes[this.gameState.player.pos.x + "," + this.gameState.player.pos.y];
                    this.add2ActnLog("You see an entrance to " + PS["Rogue"].themeName(theme) + " here.");
                }
                if (tileName == "Hideout") {
                    this.add2ActnLog("You see an entrance to the evil wizard's hideout here.");
                }
                if(this.gameState.player.pos.x != oldX || this.gameState.player.pos.y !=oldY) {
                    for (let i = 0; i< this.gameState.level.items.length;i++) {
                        if (this.gameState.level.items[i].pos.x == this.gameState.player.pos.x && this.gameState.level.items[i].pos.y == this.gameState.player.pos.y) {
                            this.add2ActnLog("You step on %c{rgba(0,255,0,0.8)}"+PS["Rogue"].itemName(this.gameState.level.items[i].item) +"%c{}.")
                        }
                }
                }
                this.nextTurn();
            }
            return;
        }

        // Wait for one turn
        if (code == ROT.VK_NUMPAD5 || code == ROT.VK_END) {
            this.nextTurn();
        }
    }

    victory() {
        this.state = State.Victory;
        this.display.clear();
        this.display.drawText(2, 10, "You, "+PS["Data.Show"].show(PS["Rogue"].showCreature)(this.gameState.player)+" the fearless peasant, have defeated the evil wizard!");
        this.display.drawText(2, 12, "With this great deed you saved the world of 7drl2017 from an awful pumpkin harvest!");

        this.display.drawText(2, 16, "Unfortunately melting the everfrost caused massive floods and drowned a lot of people.");
    }

    increaseCold() {
        let dungeonWarmth = this.currentDungeon == "worldmap" ? 0 : 3;
        let coldResistance = dungeonWarmth + PS["Rogue"].playerColdRes(this.gameState);
        this.gameState.coldStep++;
        if (this.gameState.coldStep > coldResistance) {
            this.gameState.coldStatus++;
            this.gameState.coldStep = 0;
        }
    }

    checkWarm() {
        for (let y=-1; y<2; y++) {
            for (let x=-1; x<2; x++) {
                let pos = { x: this.gameState.player.pos.x + x, y: this.gameState.player.pos.y + y };
                let tile = PS["Rogue"].getTile(this.gameState)(pos);
                let tileName = PS["Data.Show"].show(PS["Rogue"].showTile)(tile);
                if (tileName == "Fire") {
                    this.gameState.coldStatus = Math.max(0, this.gameState.coldStatus - 1);
                }
            }
        }
    }

    nextTurn() {
        this.increaseCold();
        this.checkWarm();
        window.removeEventListener("keydown", this);
        let deltaTime = PS["Rogue"].creatureSpeed(this.gameState.player);
        this.updateLoop(deltaTime);
    }

    add2ActnLog(message:string) {
        this.actionlog.push(message);
        if (this.actionlog.length > 30) {
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

    drawLog(lines:number) {
        let itemsInLog = this.actionlog.length;
        let grayism = Math.round(230/lines);
        if (itemsInLog > 0) {
            for (let i = -1; i>(-1-lines);i--) {
                if (itemsInLog+i <0) break;
                this.display.drawText(0, (30+i), "%c{rgba(0,0,0,1.0)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
                let linecolor = "%c{rgba("+String(255+i*grayism)+","+String(255+i*grayism)+","+String(255+i*grayism)+",0.8)}";
                //Make sure that the line color continues after possible colorized text
                let nextLine = this.actionlog[itemsInLog+i];

                let colorPos = nextLine.lastIndexOf("%c{r");
                if (colorPos != -1) {
                    do {
                        nextLine = this.fadeColorInStringAtPositionByScalingWithLinecolor(nextLine, colorPos, (i*grayism),linecolor);
                        let newCPos = nextLine.lastIndexOf("%c{r", colorPos-1);
                        if (newCPos == -1 || newCPos == colorPos) {
                            break;
                        }
                        else {
                            colorPos = newCPos;
                        }
                    } while(true);
                }

                this.display.drawText(0,(30+i),linecolor+nextLine+"%c{}",106);
            } 
        }
    }
    fadeColorInStringAtPositionByScalingWithLinecolor(line:string, pos:number, scale:number, linecolor:string) {
        let cLength = 0;
        let commaPos = 0;
        while (line.charAt(pos+cLength) != ")") {
            cLength +=1;
            if (line.charAt(pos+cLength) == ",") commaPos =pos+cLength;
        }
        let black = ROT.Color.fromString("rgb(0,0,0)");
        let colorRot = ROT.Color.fromString("rgb"+line.slice(pos+7,commaPos)+")");
        
        colorRot = ROT.Color.interpolate(colorRot, black,(1-(230+scale)/230)*0.75); 

        line = line.replace(line.slice(pos+6,pos+cLength),"("+colorRot.toString());
        //Last changes
        let endPos = line.indexOf("%c{}",pos)+4;
        line = line.slice(0,endPos) + linecolor + line.slice(endPos);
        
        return line;
    }

    startNewGame() {
        this.wizardDead = false;
        this.enteredName = false;
        this.currentDungeon = "worldmap";
        this.dungeonDepth = -1;
        this.rememberTile = {};
        this.actionlog = [];
        this.inputtedName = "";
        this.gameState = PS["Rogue"].initialGameState();
        this.state = State.Start;
        this.themes = {};
        this.visible = {};
        this.dungeonMaps = {};
        this.gameState = pushToGamestate(this, this.gameState, worldmap);
        //this.refreshDisplay();
        this.display.clear();
        this.display.drawText(25,10, "Enter your name: "+this.inputtedName+"%c{rgba(0,0,0,1)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
        this.display.drawText(11,20,"Press Enter to select name. You can erase with Delete.")
    }
    
    /**
     * Draws the player's stats.
     */
    staTifY() {
        this.display.drawText(0, 25, "%c{rgba(0,0,0,1.0)}bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%c{}");
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

    checkAliveStatus() {
        if(this.gameState.player.stats.hp <=0 || this.gameState.coldStatus >=100) {
            this.drawEncouragement();
            return false;
        }
        return true;
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

    drawmMsgbuFF() {
        this.display.clear();
        this.drawLog(30);
    }

    drawEncouragement() {
        this.display.clear();
        this.display.drawText(26,12,PS["Data.Show"].show(PS["Rogue"].showCreature)(this.gameState.player)+" has died :(");
        this.display.drawText(20,14,"Press Enter to start a new game");
    }

    drawInventory() {
        this.display.clear();

        let text = {};
        text[InventoryState.Show] = "Inventory";
        text[InventoryState.Equip] = "Select item to equip:";
        text[InventoryState.Unequip] = "Select item to take off:";
        text[InventoryState.Drop] = "Select item to drop:";
        text[InventoryState.Use] = "Select item to use:";

        let maybeItemName = function(maybeItem, nothingName) {
            let maybe = PS["Data.Maybe"];
            let rogue = PS["Rogue"];
            return maybe.maybe(nothingName)(rogue.itemName)(maybeItem);
        };

        let drawEquipment = function(sx: number, sy: number) {
            this.display.drawText(sx+1, sy+2, "cloak  - " + maybeItemName(this.gameState.equipment.cloak, "nothing"));
            this.display.drawText(sx+1, sy+3, "torso  - " + maybeItemName(this.gameState.equipment.chest, "nothing"));
            this.display.drawText(sx+1, sy+4, "gloves - " + maybeItemName(this.gameState.equipment.hands, "nothing"));
            this.display.drawText(sx+1, sy+5, "weapon - " + maybeItemName(this.gameState.equipment.weapon, "fists"));
        }

        if (this.invState !== InventoryState.Unequip) {
            this.display.drawText(2, 2, text[this.invState]);

            for (let i=0; i<this.gameState.player.inv.length; i++) {
                let item = this.gameState.player.inv[i];
                let key = String.fromCharCode(65 + i);
                let weight = PS["Rogue"].itemWeight(item);
                this.display.drawText(3, 4 + i, key + " - " + PS["Rogue"].itemName(item) + " (" + weight + " lbs)");
            }

            let ap = PS["Rogue"].playerArmour(this.gameState);
            let cr = PS["Rogue"].playerColdRes(this.gameState);
            let maxDam = this.gameState.player.stats.str + PS["Rogue"].weaponDamage(this.gameState.equipment.weapon);
            let hit = PS["Rogue"].creatureHitChance(this.gameState)(this.gameState.player);

            this.display.drawText(35, 12, "Armour points    : " + ap);
            this.display.drawText(35, 13, "Cold resistance  : " + cr);
            this.display.drawText(35, 14, "Weapon damage    : 0 - " + maxDam);
            this.display.drawText(35, 15, "Weapon hit chance: " + hit + "%");

            this.display.drawText(35, 28, "Total encumbrance: " + PS["Rogue"].totalEnc(this.gameState) + " / " + this.gameState.maxEnc + " lbs.");

            this.display.drawText(2, 28, "Space or return - cancel");
            
            this.display.drawText(35, 2, "Equipment");
            drawEquipment.bind(this)(35, 2);
        }
        else if (this.invState === InventoryState.Unequip) {
            this.display.drawText(2, 2, text[this.invState]);
            this.display.drawText(3, 4, "A - cloak");
            this.display.drawText(3, 5, "B - torso");
            this.display.drawText(3, 6, "C - gloves");
            this.display.drawText(3, 7, "D - weapon");
            
            this.display.drawText(35, 2, "Equipment");
            drawEquipment.bind(this)(35, 2);
        }
    }

    drawMap() {
        let radius = 5;
        let player = this.gameState.player;
        let levelWidth = this.gameState.level.width;
        let levelHeight = this.gameState.level.height;

        this.staTifY();
        this.drawLog(4);

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

    createDungeon(width: number, height: number, level: Rogue.Level): Rogue.Level {
        let digger = new ROT.Map.Digger(width, height);
        let digCallback = function(x, y, value) {
            if (value === 1) { return; }
            let position = { x: x, y: y };
            let floor = PS["Rogue"].Ground.create({ frozen: false });

            level = PS["Rogue"].setLevelTile(level)(floor)(position);
        }
        digger.create(digCallback.bind(this));
        return level;
    }

    createCave(width: number, height: number, level: Rogue.Level): Rogue.Level {
        let map = new ROT.Map.Cellular(width, height, { connected: true });
        map.randomize(0.5);
        for (let i=0; i<3; i++) {
            map.create();
        }
        let callback = function(x, y, value) {
            if (value == 0 || !(x > 0 && y > 0 && x < width - 1 && y < height - 1))
                return;
            let position = { x: x, y: y };
            let floor = PS["Rogue"].Ground.create({ frozen: false });

            level = PS["Rogue"].setLevelTile(level)(floor)(position);
        }
        map.create(callback);
        map.connect(callback, 1);
        return level;
    }

    createIceCave(width: number, height: number, level: Rogue.Level): Rogue.Level {
        for (let y=0; y<height; y++) {
            for (let x=0; x<width; x++) {
                level = PS["Rogue"].setLevelTile(level)(PS["Rogue"].Wall.create({frozen: true}))({ x: x, y: y});
            }
        }
        let map = new ROT.Map.Cellular(width, height, { connected: true });
        map.randomize(0.5);
        for (let i=0; i<3; i++) {
            map.create();
        }
        let callback = function(x, y, value) {
            if (value == 0 || !(x > 0 && y > 0 && x < width - 1 && y < height - 1))
                return;
            let position = { x: x, y: y };
            let floor = PS["Rogue"].Ground.create({ frozen: true });

            level = PS["Rogue"].setLevelTile(level)(floor)(position);
        }
        map.create(callback);
        map.connect(callback, 1);
        return level;
    }

    createWizDungeon(width: number, height: number, level: Rogue.Level): Rogue.Level {
        for (let y=0; y<height; y++) {
            for (let x=0; x<width; x++) {
                level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].WizardWall())({ x: x, y: y});
            }
        }
        let digger = new ROT.Map.Digger(width, height);
        let digCallback = function(x, y, value) {
            if (value === 1) { return; }
            let position = { x: x, y: y };
            let floor = PS["Rogue"].Ground.create({ frozen: false });

            level = PS["Rogue"].setLevelTile(level)(floor)(position);
        }
        digger.create(digCallback.bind(this));
        return level;
    }

    generateLevel(): Rogue.Level {
        let width = 75;
        let height = 23;
        let fillTile = PS["Rogue"].Wall.create({ frozen: false });
        let level = PS["Rogue"].createLevel(width)(height)(fillTile);
        level.enemies = {};

        let theme = this.themes[this.currentDungeon];

        if (theme instanceof PS["Rogue"].GoblinCave || theme instanceof PS["Rogue"].Cave) {
            level = this.createCave(width, height, level);
        }
        else if (theme instanceof PS["Rogue"].IceCave) {
            level = this.createIceCave(width, height, level);
        }
        else if (PS["Rogue"].themeName(theme) == "wizard's hideout") {
            level = this.createWizDungeon(width, height, level);
        }
        else {
            level = this.createDungeon(width, height, level);
        }

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
            let result = PS["Random"].runRandom(PS["ContentGenerator"].randomItem(theme)(this.dungeonDepth))(itemSeed);
            itemSeed = result.seed;
            return result.value;
        }
        randomItem.bind(this)();

        let enemySeed = new Date().getTime();
        function randomEnemy() {
            let result = PS["Random"].runRandom(PS["ContentGenerator"].randomEnemy(theme)(this.dungeonDepth))(enemySeed);
            enemySeed = result.seed;
            return result.value;
        }
        randomEnemy.bind(this)();

        // Generate stairs
        let stairsUpPos = randomFreePosition();
        let stairsDownPos = randomFreePosition();

        if (this.dungeonDepth < 4) {
            level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsDown())(stairsDownPos);
            freePositions.splice(freePositions.indexOf(stairsDownPos), 1);
        }
        else {
            let stairsDownPos = {x:-1, y:-1};
        }

        level = PS["Rogue"].setLevelTile(level)(new PS["Rogue"].StairsUp())(stairsUpPos);
        level = PS["Rogue"].setExits(level)(stairsUpPos)(stairsDownPos);

        // Remove stairs from free positions
        freePositions.splice(freePositions.indexOf(stairsUpPos), 1);

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

        // Generate the evil wizard
        if (PS["Rogue"].themeName(theme) == "wizard's hideout" && this.dungeonDepth == 4) {
            let wizard = PS["Rogue"].createWizard();
            wizard.pos = randomFreePosition();
            level.enemies[50] = wizard;
        }

        return level;
    }
}
