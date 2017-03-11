declare module Rogue {
    class Point {
        x: number;
        y: number;
    }

    class Creature {
        pos: Point;
    }

    class Tile {
    }

    class Level {
        width: number;
        height: number;
        tiles: Array<Tile>;
        up: Point;
        down: Point;
    }
}