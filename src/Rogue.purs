module Rogue where

import Prelude
import Data.Maybe (fromMaybe)
import Data.Array (index, singleton, insertAt)

type Point = { x :: Int , y :: Int }

pointPlus :: Point -> Point -> Point
pointPlus {x: x1, y: y1} {x: x2, y: y2} = {x: x1 + x2 , y: y1 + y2}
infixl 9 pointPlus as .+.

pointMinus :: Point -> Point -> Point
pointMinus {x: x1, y: y1} {x: x2, y: y2} = {x: x1-x2, y: y1-y2}
infixl 9 pointMinus as .-.

pointEquals :: Point -> Point -> Boolean
pointEquals {x: x1, y: y1} {x: x2, y: y2} = x1 == x2 && y1 == y2
infix 7 pointEquals as .==.

newtype GameState = GameState
    { level      :: Level
    , player     :: Creature
    , coldStatus :: Int
    , enemies    :: Array Creature
    }

newtype Creature = Creature
    { icon  :: Char
    , pos   :: Point
    , stats :: Stats
    }

newtype Stats = Stats
    { hpMax :: Int
    , hp    :: Int
    , str   :: Int
    , dex   :: Int
    , int   :: Int
    }

data Tile = Ground
          | Wall
          | ErrorTile

isTileSolid :: Tile -> Boolean
isTileSolid Ground = false
isTileSolid _      = true

isTileTransparent :: Tile -> Boolean
isTileTransparent Ground = true
isTileTransparent _      = false

type Level =
    { tiles  :: Array Tile
    , width  :: Int
    , height :: Int
    }

getTile :: GameState -> Point -> Tile
getTile (GameState gs) p = fromMaybe ErrorTile $ index (gs.level.tiles) (p.y * gs.level.width + p.x)

setTile :: GameState -> Tile -> Point -> GameState
setTile (GameState gs) t p = GameState ( gs { level { tiles = (fromMaybe (singleton ErrorTile) $ insertAt (p.y * gs.level.width + p.x) t gs.level.tiles) } } )