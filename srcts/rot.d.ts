// Initial definitions taken from
// https://github.com/d3is/rot.js-TS
declare module ROT {

    const DIRS: any;

    interface IFOV {
        compute(x: number, y: number, R: number, callback: (x: number, y: number, r: number) => void );
    }

    interface IMap {
        width: number;
        height: number;
        create(callback: (x: number, y: number, value: number) => void ): void;
        create();
    }

    interface INoise {
        get (x: number, y: number): number;
    }

    interface IPath {
        compute(fromX: number, fromY: number, callback: (x: number, y: number) => void);
    }

    export class Color {
        static add(color1: number[], color2: number[]): number[];
        static fromString(str: string): number[];
        static hsl2rgb(color: number[]): number[];
        static interpolate(color1: number[], color2: number[], factor: number): number[];
        static interpolateHSL(color1: number, color2: number, factor: number): number[];
        static multiply(color1: number[], color2: number[]): number[];
        static randomize(color: number[], diff: number[]): number[];
        static rgb2hsl(color: number[]): number;
        static toHex(color: number[]): string;
        static toRGB(color: number[]): string;
    }

    export class Display {
        constructor(options: any);
        clear();
        computeFontSize(availWidth: number, availHeight: number);
        computeSize(availWidth: number, availHeight: number);
        DEBUG(x: number, y: number, what: number);
        draw(x: number, y: number, ch: string, fg: string);
        draw(x: number, y: number, ch: string, fg: string, bg: string);
        drawText(x: number, y: number, text: string, maxWidth?: number): number;
        eventToPosition(e: Event): number[];
        getContainer(): HTMLElement;
        getOptions(): any;
        setOptions(options: any);
    }

    export class Lighting {
        constructor(reflectivityCallback: (x: number, y: number) => void, options: any);
        compute(lightingCallback: (x: number, y: number, color: number) => void );
        reset();
        setFOV(fov: IFOV);
        setLight(x: number, y: number, color?: number[]);
        setLight(x: number, y: number, color?: string);
        setOptions(options: any);
    }

    export class RNG {
        static getNormal(mean: number, stddev: number): number;
        static staticgetPercentage(): number;
        static getSeed(): number;
        static getState();
        static getUniform(): number;
        static getUniformInt(minBound: number, maxBound: number): number;
        static getWeightedValue(data: any): string;
        static setSeed(seed: number);
        static setState(state);
    }

    // export class Scheduler {
    //     add(item: any);
    //     clear();
    //     next(): any;
    //     remove(item: any);
    // }

    export class StringGenerator {
        constructor(options: any);
        clear();
        generate(): string;
        getStats(): any;
        observe(str: string);
    }

    export class Text {
        static measure(str: string, maxWidth: number): number;
        static tokenize(str: string, maxWidth: number): Array<any>;
    }
}

declare module ROT.Scheduler {
    export class Speed<T> {
        constructor();
        add(item: T, repeating: boolean): void;
        next(): T;
        clear(): void;
    }
}

declare module ROT.FOV {
    export class DiscreteShadowcasting implements IFOV {
        compute(x: number, y: number, R: number, callback: (x: number, y: number, r: number) => void );
        constructor(lightPassesCallback: Function, options: any);
    }

    export class PreciseShadowcasting implements IFOV {
        compute(x: number, y: number, R: number, callback: (x: number, y: number, r: number, visibility: number) => void );
        constructor(lightPassesCallback: Function, options: any);
        constructor(lightPassesCallback: Function);
    }
}

declare module ROT.Map {
    interface IFeature {
        create();
        create(digCallback: Function);
        //static createRandomAt(x: number, y: number, dx: number, dy: number, options: any);
        debug(): void;
        isValid(canBeDugCallback: Function): void;
    }

    export class Dungeon implements IMap {
        width: number;
        height: number;
        constructor();
        constructor(width: number, height: number);
        create();
        create(callback: Function): void;
        getRooms(): ROT.Map.Feature.Room[];
        getCorridors(): ROT.Map.Feature.Corridor[];
    }

    export class Arena extends Dungeon implements IMap {
        constructor(width: number, height: number);
    }

    export class Cellular extends Dungeon implements IMap {
        constructor(width: number, height: number, options: any);
        randomize(probability: number);
        set(x: number, y: number, value: number);
    }

    export class Digger extends Dungeon implements IMap {
        constructor(width: number, height: number, options: any);
        constructor(width: number, height: number);
    }

    export class DividedMaze extends Dungeon implements IMap {
        constructor(width: number, height: number);
    }

    export class EllerMaze extends Dungeon implements IMap {
        constructor(width: number, height: number);
    }

    export class IceyMaze extends Dungeon implements IMap {
        constructor(width: number, height: number, regularity: number);
    }

    export class Rogue extends Dungeon implements IMap {
        constructor(width: number, height: number, options: any);
    }

    export class Uniform extends Dungeon implements IMap {
        constructor(width: number, height: number, options: any);
    }

}

declare module ROT.Map.Feature {
    export class Corridor implements IFeature {
        create();
        create(digCallback: Function);
        debug(): void;
        isValid(canBeDugCallback: Function): void;
        static createRandomAt(x: number, y: number, dx: number, dy: number, options: any);
        constructor(startX: number, startY: number, endX: number, endY: number);
        createPriorityWalls(priorityWallCallback: Function);
    }

    export class Room implements IFeature {
        create();
        create(digCallback: Function);
        debug(): void;
        isValid(canBeDugCallback: Function): void;
        static createRandomAt(x: number, y: number, dx: number, dy: number, options: any);
        constructor(x1: number, y1: number, x2: number, y2: number, doorX: number, doorY: number);
        addDoor(x: number, y: number);
        clearDoors();
        static createRandom(availWidth: number, availHeight: number, options: any);
        static createRandomCenter(cx: number, cy: number, options: any);
        getBottom();
        getCenter();
        getDoors();
        getLeft();
        getRight();
        getTop();
        isValid(isWallCallback: Function, canBeDugCallback: Function);
    }
}

declare module ROT.Noise {
    export class Simplex {
        constructor(gradients?: number);
        get (xin: number, yin: number): number;
    }
}

declare module ROT.Path {
    export class AStar implements IPath {
        constructor(toX: number, toY: number, passableCallback: (x: number, y: number) => boolean, options: any);
        constructor(toX: number, toY: number, passableCallback: (x: number, y: number) => boolean);
        compute(fromX: number, fromY: number, callback: (x: number, y: number) => void);
    }

    export class Dijkstra implements IPath {
        constructor(toX: number, toY: number, passableCallback: (x: number, y: number) => void, options: any);
        compute(fromX: number, fromY: number, callback: (x: number, y: number) => void );
    }
}