module Rogue where

import Prelude
import Data.Array (index, insertAt, snoc, deleteAt, replicate)
import Data.Maybe (fromMaybe)

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
    { level:      { tiles: replicate (75*25) (Ground { frozen: false }), width: 75, height: 25 }
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
getName (Creature { creatureType : Player p}) = p.name
getName (Creature { creatureType : Wolf})     = "wolf"
getName _                                     = "Ismo" 

newtype Stats = Stats
    { hpMax :: Int
    , hp    :: Int
    , str   :: Int
    , dex   :: Int
    , int   :: Int
    }

defaultStats :: Stats
defaultStats = Stats { hpMax: 20, hp: 20, str: 10, dex: 10, int: 10 }

type Frozen = { frozen :: Boolean }

data Tile = Ground Frozen
          | Wall Frozen
          | Mountain Frozen
          | Forest Frozen
          | Water Frozen  -- Large body of water (river, lake, etc.), solid when unfrozen (because the player can not swim)
          | Puddle Frozen -- Wet floor, turns into solid ice wall when frozen
          | Door Frozen
          | StairsUp
          | StairsDown
          | DungeonEnterance
          | ErrorTile

isTileSolid :: Tile -> Boolean
isTileSolid (Ground _)       = false
isTileSolid (Forest _)       = false
isTileSolid (Water t)        = not t.frozen
isTileSolid (Puddle t)       = t.frozen
isTileSolid DungeonEnterance = false
isTileSolid _                = true

isTileTransparent :: Tile -> Boolean
isTileTransparent (Wall _)     = false
isTileTransparent (Mountain _) = false
isTileTransparent _            = true

tileIcon :: Tile -> Char
tileIcon (Ground _)         = '.'
tileIcon (Wall _)           = '#'
tileIcon (Mountain _)       = '^'
tileIcon (Forest _)         = 'T'
tileIcon (Water _)          = '~'
tileIcon (Puddle t)         = if t.frozen then '#' else '.'
tileIcon (Door _)           = '+'
tileIcon (StairsUp)         = '<'
tileIcon (StairsDown)       = '>'
tileIcon (DungeonEnterance) = 'o'
tileIcon _                  = '?'

frozenColor :: Frozen -> String
frozenColor { frozen: true } = "0.2)"
frozenColor { frozen: false } = "0.6)"

tileColor :: Tile -> String
tileColor (Ground t) = "rgba(120, 120, 120, " <> frozenColor t
tileColor (Wall t) = "rgba(120, 120, 120, " <> frozenColor t
tileColor (Mountain t) = "rgba(70, 70, 70, " <> frozenColor t
tileColor (Forest t) = "rgba(20, 240, 30, " <> frozenColor t
tileColor (Water t) = "rgba(20, 20, 250, " <> frozenColor t
tileColor (Puddle t) = "rgba(20, 20, 250, " <> frozenColor t
tileColor (Door t) = "rgba(200, 180, 50, " <> frozenColor t
tileColor _ = "rgba(120, 120, 120, 0.6)"


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
