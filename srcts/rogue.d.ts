declare module Rogue {
    class Point {
        x: number;
        y: number;
    }

    class Tile {
    }

    class Level {
        width: number;
        height: number;
        tiles: Array<Tile>;
    }
}