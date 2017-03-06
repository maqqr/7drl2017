module Rogue where

import Prelude
import Data.Maybe (fromMaybe)
import Data.Array (index, insertAt, snoc, deleteAt, replicate)

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
    , items      :: Array { pos :: Point, item :: Item }
    }

initialGameState :: GameState
initialGameState = GameState
    { level:      { tiles: replicate (75*25) Ground, width: 75, height: 25 }
    , player:     Creature {creatureType: Player {name: "Frozty"}, pos: {x: 10, y: 10}, stats: defaultStats, inv: []}
    , coldStatus: 100
    , enemies:    []
    , items:      []
    }

newtype Creature = Creature
    { creatureType :: CreatureType
    , pos          :: Point
    , stats        :: Stats
    , inv          :: Array Item
    }

data CreatureType = Player { name :: String }
                  | Wolf
                  | Ismo

getName :: Creature -> String
getName (Creature { creatureType: Player p}) = p.name
getName (Creature { creatureType: Wolf})     = "wolf"
getName _                                    = "Ismo" 

setPlayer :: GameState -> Creature -> GameState
setPlayer (GameState gs) pl = GameState gs { player = pl }

getPlayer :: GameState -> Creature
getPlayer (GameState gs) = gs.player

newtype Stats = Stats
    { hpMax :: Int
    , hp    :: Int
    , str   :: Int
    , dex   :: Int
    , int   :: Int
    }

defaultStats :: Stats
defaultStats = Stats { hpMax: 20, hp: 20, str: 10, dex: 10, int: 10 }

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
setTile (GameState gs) t p = GameState ( gs { level { tiles = (fromMaybe (gs.level.tiles) $ insertAt (p.y * gs.level.width + p.x) t gs.level.tiles) } } )

data Item = Weapon { weaponType :: WeaponType, prefixe :: WeaponPrefix }
          | Armour { armourType :: ArmourType, prefixe :: ArmourPrefix }
        --| Scroll { weight :: Int, effect :: Effect }
        --| Potion { weight :: Int, effect :: Effect }    
          | Wood
          | ErrorItem

data WeaponType = Sword | Axe

data WeaponPrefix = Common | Rusty | Masterwork

data ArmourType = Cloak | Chest | Gloves

data ArmourPrefix = CommonA | LightA | ThickA | MasterworkA

addItem :: Creature -> Item -> Creature
addItem (Creature c) i = Creature ( c { inv = snoc (c.inv) i } )

deleteItem :: Creature -> Int -> Creature
deleteItem (Creature c) i =  Creature ( c { inv = fromMaybe (c.inv) $ deleteAt i (c.inv) } )
