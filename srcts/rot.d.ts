// Initial definitions taken from
// https://github.com/d3is/rot.js-TS
declare module ROT {

    const DIRS: any;

    /** Cancel key. */
    const VK_CANCEL: number;
    /** Help key. */
    const VK_HELP: number;
    /** Backspace key. */
    const VK_BACK_SPACE: number;
    /** Tab key. */
    const VK_TAB: number;
    /** 5 key on Numpad when NumLock is unlocked. Or on Mac, clear key which is positioned at NumLock key. */
    const VK_CLEAR: number;
    /** Return/enter key on the main keyboard. */
    const VK_RETURN: number;
    /** Reserved, but not used. */
    const VK_ENTER: number;
    /** Shift key. */
    const VK_SHIFT: number;
    /** Control key. */
    const VK_CONTROL: number;
    /** Alt (Option on Mac) key. */
    const VK_ALT: number;
    /** Pause key. */
    const VK_PAUSE: number;
    /** Caps lock. */
    const VK_CAPS_LOCK: number;
    /** Escape key. */
    const VK_ESCAPE: number;
    /** Space bar. */
    const VK_SPACE: number;
    /** Page Up key. */
    const VK_PAGE_UP: number;
    /** Page Down key. */
    const VK_PAGE_DOWN: number;
    /** End key. */
    const VK_END: number;
    /** Home key. */
    const VK_HOME: number;
    /** Left arrow. */
    const VK_LEFT: number;
    /** Up arrow. */
    const VK_UP: number;
    /** Right arrow. */
    const VK_RIGHT: number;
    /** Down arrow. */
    const VK_DOWN: number;
    /** Print Screen key. */
    const VK_PRINTSCREEN: number;
    /** Ins(ert) key. */
    const VK_INSERT: number;
    /** Del(ete) key. */
    const VK_DELETE: number;
    /***/
    const VK_0: number;
    /***/
    const VK_1: number;
    /***/
    const VK_2: number;
    /***/
    const VK_3: number;
    /***/
    const VK_4: number;
    /***/
    const VK_5: number;
    /***/
    const VK_6: number;
    /***/
    const VK_7: number;
    /***/
    const VK_8: number;
    /***/
    const VK_9: number;
    /** Colon (:) key. Requires Gecko 15.0 */
    const VK_COLON: number;
    /** Semicolon (;) key. */
    const VK_SEMICOLON: number;
    /** Less-than (<) key. Requires Gecko 15.0 */
    const VK_LESS_THAN: number;
    /** Equals (=) key. */
    const VK_EQUALS: number;
    /** Greater-than (>) key. Requires Gecko 15.0 */
    const VK_GREATER_THAN: number;
    /** Question mark (?) key. Requires Gecko 15.0 */
    const VK_QUESTION_MARK: number;
    /** Atmark (@) key. Requires Gecko 15.0 */
    const VK_AT: number;
    /***/
    const VK_A: number;
    /***/
    const VK_B: number;
    /***/
    const VK_C: number;
    /***/
    const VK_D: number;
    /***/
    const VK_E: number;
    /***/
    const VK_F: number;
    /***/
    const VK_G: number;
    /***/
    const VK_H: number;
    /***/
    const VK_I: number;
    /***/
    const VK_J: number;
    /***/
    const VK_K: number;
    /***/
    const VK_L: number;
    /***/
    const VK_M: number;
    /***/
    const VK_N: number;
    /***/
    const VK_O: number;
    /***/
    const VK_P: number;
    /***/
    const VK_Q: number;
    /***/
    const VK_R: number;
    /***/
    const VK_S: number;
    /***/
    const VK_T: number;
    /***/
    const VK_U: number;
    /***/
    const VK_V: number;
    /***/
    const VK_W: number;
    /***/
    const VK_X: number;
    /***/
    const VK_Y: number;
    /***/
    const VK_Z: number;
    /***/
    const VK_CONTEXT_MENU: number;
    /** 0 on the numeric keypad. */
    const VK_NUMPAD0: number;
    /** 1 on the numeric keypad. */
    const VK_NUMPAD1: number;
    /** 2 on the numeric keypad. */
    const VK_NUMPAD2: number;
    /** 3 on the numeric keypad. */
    const VK_NUMPAD3: number;
    /** 4 on the numeric keypad. */
    const VK_NUMPAD4: number;
    /** 5 on the numeric keypad. */
    const VK_NUMPAD5: number;
    /** 6 on the numeric keypad. */
    const VK_NUMPAD6: number;
    /** 7 on the numeric keypad. */
    const VK_NUMPAD7: number;
    /** 8 on the numeric keypad. */
    const VK_NUMPAD8: number;
    /** 9 on the numeric keypad. */
    const VK_NUMPAD9: number;
    /** * on the numeric keypad. */
    const VK_MULTIPLY: number;
    /** + on the numeric keypad. */
    const VK_ADD: number;
    /***/
    const VK_SEPARATOR: number;
    /** - on the numeric keypad. */
    const VK_SUBTRACT: number;
    /** Decimal point on the numeric keypad. */
    const VK_DECIMAL: number;
    /** / on the numeric keypad. */
    const VK_DIVIDE: number;
    /** F1 key. */
    const VK_F1: number;
    /** F2 key. */
    const VK_F2: number;
    /** F3 key. */
    const VK_F3: number;
    /** F4 key. */
    const VK_F4: number;
    /** F5 key. */
    const VK_F5: number;
    /** F6 key. */
    const VK_F6: number;
    /** F7 key. */
    const VK_F7: number;
    /** F8 key. */
    const VK_F8: number;
    /** F9 key. */
    const VK_F9: number;
    /** F10 key. */
    const VK_F10: number;
    /** F11 key. */
    const VK_F11: number;
    /** F12 key. */
    const VK_F12: number;
    /** F13 key. */
    const VK_F13: number;
    /** F14 key. */
    const VK_F14: number;
    /** F15 key. */
    const VK_F15: number;
    /** F16 key. */
    const VK_F16: number;
    /** F17 key. */
    const VK_F17: number;
    /** F18 key. */
    const VK_F18: number;
    /** F19 key. */
    const VK_F19: number;
    /** F20 key. */
    const VK_F20: number;
    /** F21 key. */
    const VK_F21: number;
    /** F22 key. */
    const VK_F22: number;
    /** F23 key. */
    const VK_F23: number;
    /** F24 key. */
    const VK_F24: number;
    /** Num Lock key. */
    const VK_NUM_LOCK: number;
    /** Scroll Lock key. */
    const VK_SCROLL_LOCK: number;
    /** Circumflex (^) key. Requires Gecko 15.0 */
    const VK_CIRCUMFLEX: number;
    /** Exclamation (!) key. Requires Gecko 15.0 */
    const VK_EXCLAMATION: number;
    /** Double quote () key. Requires Gecko 15.0 */
    const VK_DOUBLE_QUOTE: number;
    /** Hash (#) key. Requires Gecko 15.0 */
    const VK_HASH: number;
    /** Dollar sign ($) key. Requires Gecko 15.0 */
    const VK_DOLLAR: number;
    /** Percent (%) key. Requires Gecko 15.0 */
    const VK_PERCENT: number;
    /** Ampersand (&) key. Requires Gecko 15.0 */
    const VK_AMPERSAND: number;
    /** Underscore (_) key. Requires Gecko 15.0 */
    const VK_UNDERSCORE: number;
    /** Open parenthesis (() key. Requires Gecko 15.0 */
    const VK_OPEN_PAREN: number;
    /** Close parenthesis ()) key. Requires Gecko 15.0 */
    const VK_CLOSE_PAREN: number;
    /* Asterisk (*) key. Requires Gecko 15.0 */
    const VK_ASTERISK: number;
    /** Plus (+) key. Requires Gecko 15.0 */
    const VK_PLUS: number;
    /** Pipe (|) key. Requires Gecko 15.0 */
    const VK_PIPE: number;
    /** Hyphen-US/docs/Minus (-) key. Requires Gecko 15.0 */
    const VK_HYPHEN_MINUS: number;
    /** Open curly bracket ({) key. Requires Gecko 15.0 */
    const VK_OPEN_CURLY_BRACKET: number;
    /** Close curly bracket (}) key. Requires Gecko 15.0 */
    const VK_CLOSE_CURLY_BRACKET: number;
    /** Tilde (~) key. Requires Gecko 15.0 */
    const VK_TILDE: number;
    /** Comma (,) key. */
    const VK_COMMA: number;
    /** Period (.) key. */
    const VK_PERIOD: number;
    /** Slash (/) key. */
    const VK_SLASH: number;
    /** Back tick (`) key. */
    const VK_BACK_QUOTE: number;
    /** Open square bracket ([) key. */
    const VK_OPEN_BRACKET: number;
    /** Back slash (\) key. */
    const VK_BACK_SLASH: number;
    /** Close square bracket (]) key. */
    const VK_CLOSE_BRACKET: number;
    /** Quote (''') key. */
    const VK_QUOTE: number;
    /** Meta key on Linux, Command key on Mac. */
    const VK_META: number;
    /** AltGr key on Linux. Requires Gecko 15.0 */
    const VK_ALTGR: number;
    /** Windows logo key on Windows. Or Super or Hyper key on Linux. Requires Gecko 15.0 */
    const VK_WIN: number;

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
        remove(item: T): void;
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