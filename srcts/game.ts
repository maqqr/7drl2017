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

        if (!(code in Game.keyMap)) { return; }
    
        var oldX = this.gameState.player.pos.x;
        var oldY = this.gameState.player.pos.y;

        var diff = ROT.DIRS[8][Game.keyMap[code]];
        var newX = oldX + diff[0];
        var newY = oldY + diff[1];

        this.gameState.player.pos = { x: newX, y: newY };
        this.drawMap();

        window.removeEventListener("keydown", this);
        this.updateLoop();
    }

    drawMap() {
        for (let y=0; y < this.gameState.tileMap.height; y++) {
            for (let x=0; x < this.gameState.tileMap.width; x++) {
                let tile = PS["Rogue"].getTile(this.gameState)({x: x, y: y});
                this.display.draw(x, y, tile.icon, tile.color);
            }
        }

        let player = this.gameState.player;
        this.display.draw(player.pos.x, player.pos.y, '@', "rgba(0, 200, 0, 0.6)");
    }
}
