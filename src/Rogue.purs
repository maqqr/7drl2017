module Rogue where

import Prelude
import Data.Array (index, insertAt, snoc, deleteAt, replicate, (:), head, tail, union)
import Data.Maybe (Maybe(..), fromMaybe)


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
    , equipment  :: { cloak :: Maybe Item , chest :: Maybe Item , hands :: Maybe Item , weapon :: Maybe Item }
    }

initialGameState :: GameState
initialGameState = GameState
    { level:      createLevel 75 25 (Ground { frozen: false })
    , player:     Creature {creatureType: Player {name: "Frozty"}, pos: {x: 10, y: 10}, stats: defaultStats, inv: []}
    , coldStatus: 100
    , equipment:  { cloak: Nothing, chest: Nothing, hands: Nothing, weapon: Nothing }
    }

newtype Creature = Creature
    { creatureType :: CreatureType
    , pos          :: Point
    , stats        :: Stats
    , inv          :: Array Item
    }

data CreatureType = Player { name :: String }
                  | AlphaWolf
                  | Wolf
                  | Goblin
                  | Snowman
                  | Tim
                  | Ismo

getName :: Creature -> String
getName (Creature { creatureType: Player p})  = p.name
getName (Creature { creatureType: AlphaWolf}) = "alpha wolf"
getName (Creature { creatureType: Wolf})      = "wolf"
getName (Creature { creatureType: Goblin})    = "goblin"
getName (Creature { creatureType: Snowman})   = "snowman"
getName (Creature { creatureType: Tim})       = "evil sorcerer"
getName _                                     = "Ismo"

creatureBaseDmg :: Creature -> Int
creatureBaseDmg (Creature { creatureType: AlphaWolf}) = 2
creatureBaseDmg (Creature { creatureType: Snowman})   = 4
creatureBaseDmg (Creature { creatureType: Tim})       = 10
creatureBaseDmg _                                     = 1

setPlayer :: GameState -> Creature -> GameState
setPlayer (GameState gs) pl = GameState gs { player = pl }

getPlayer :: GameState -> Creature
getPlayer (GameState gs) = gs.player

type Stats = 
    { hpMax :: Int
    , hp    :: Int
    , str   :: Int
    , dex   :: Int
    , int   :: Int
    }

defaultStats :: Stats
defaultStats = { hpMax: 200, hp: 200, str: 10, dex: 10, int: 10 }

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
          | DungeonEntrance
          | ErrorTile

instance showTile :: Show Tile where
    show (Ground _)       = "Ground"
    show (Wall _)         = "Wall"
    show (Mountain _)     = "Mountain"
    show (Forest _)       = "Forest"
    show (Water _)        = "Water"
    show (Puddle _)       = "Puddle"
    show (Door _)         = "Door"
    show StairsUp         = "StairsUp"
    show StairsDown       = "StairsDown"
    show DungeonEntrance = "DungeonEntrance"
    show ErrorTile        = "ErrorTile"

isTileSolid :: Tile -> Boolean
isTileSolid (Ground _)      = false
isTileSolid (Forest _)      = false
isTileSolid (Water t)       = not t.frozen
isTileSolid (Puddle t)      = t.frozen
isTileSolid DungeonEntrance = false
isTileSolid StairsUp        = false
isTileSolid StairsDown      = false
isTileSolid _               = true

isTileTransparent :: Tile -> Boolean
isTileTransparent (Wall _)     = false
isTileTransparent (Mountain _) = false
isTileTransparent _            = true

tileIcon :: Tile -> Char
tileIcon (Ground _)        = '.'
tileIcon (Wall _)          = '#'
tileIcon (Mountain _)      = '^'
tileIcon (Forest _)        = 'T'
tileIcon (Water _)         = '~'
tileIcon (Puddle t)        = if t.frozen then '#' else '.'
tileIcon (Door _)          = '+'
tileIcon (StairsUp)        = '<'
tileIcon (StairsDown)      = '>'
tileIcon (DungeonEntrance) = 'o'
tileIcon _                 = '?'

frozenColor :: Frozen -> String
frozenColor { frozen: true } = "0.2)"
frozenColor { frozen: false } = "0.6)"

tileColor :: Tile -> String
tileColor (Ground t)   = "rgba(139, 69, 19, " <> frozenColor t
tileColor (Wall t)     = "rgba(120, 120, 120, " <> frozenColor t
tileColor (Mountain t) = "rgba(70, 70, 70, " <> frozenColor t
tileColor (Forest t)   = "rgba(20, 240, 30, " <> frozenColor t
tileColor (Water t)    = "rgba(20, 20, 250, " <> frozenColor t
tileColor (Puddle t)   = "rgba(20, 20, 250, " <> frozenColor t
tileColor (Door t)     = "rgba(200, 180, 50, " <> frozenColor t
tileColor _            = "rgba(120, 120, 120, 0.6)"

data Theme = Mine | GoblinCave | Cave | WizardTower

instance eqTheme :: Eq Theme where
    eq Mine Mine               = true
    eq GoblinCave GoblinCave   = true
    eq Cave Cave               = true
    eq WizardTower WizardTower = true
    eq _ _                     = false

------------------------------------------------------------------------------------------------------------------------------------------ Testing shit

-- yeah, needs more time and coffee
{-
data ThemePool = ThemeWeaponPrefixes { theme :: Theme, prefixes :: Array { prefix :: WeaponPrefix, chance :: Int } }
               | ThemeArmourPrefixes { theme :: Theme, prefixes :: Array { prefix :: ArmourPrefix, chance :: Int } }
               | ThemeWeapon         { theme :: Theme, weapons  :: Array { wType :: WeaponType, chance :: Int } }
               | ThemeArmour         { theme :: Theme, armour   :: Array { aType :: ArmourType, chance :: Int } }
-}
----------------------------------------------------------------------nope



{-
type ThemeWeaponPrefixes = { theme :: Theme, prefixes :: Array { prefix :: WeaponPrefix, chance :: Int } }

weaponPrefixPools :: Array ThemeWeaponPrefixes
weaponPrefixPools =  { theme: Mine, prefixes: { prefix: Common, chance: 50 } : [] } : []


--Does not work...?
getWPPool :: Theme -> Array ThemeWeaponPrefixes -> Array { prefix :: WeaponPrefix, chance :: Int }
getWPPool t []   = []
getWPPool t pool = let p = fromMaybe { theme: Mine, prefixes: [] } (head pool) 
                   in if (p.theme) == t then
                          union (p.prefixes) (getWPPool t (fromMaybe [] (tail pool)))
                      else
                          getWPPool t (fromMaybe [] (tail pool))
getWPPool _ _    = []
-}

------------------------------------------------------------------------------------------------------------------------------------------ Testing shit end

type Level =
    { tiles   :: Array Tile
    , width   :: Int
    , height  :: Int
    , enemies :: Array Creature
    , items   :: Array { pos :: Point, item :: Item }
    }

createLevel :: Int -> Int -> Tile -> Level
createLevel x y t = { tiles: replicate (x*y) t, width: x, height: y, enemies: [], items: [] }

getLevelTile :: Level -> Point -> Tile
getLevelTile level p = fromMaybe ErrorTile $ index (level.tiles) (p.y * level.width + p.x)

setLevelTile :: Level -> Tile -> Point -> Level
setLevelTile level t p = level { tiles = (fromMaybe (level.tiles) $ updateAt (p.y * level.width + p.x) t level.tiles) }

getTile :: GameState -> Point -> Tile
getTile (GameState gs) p = getLevelTile (gs.level) p

setTile :: GameState -> Tile -> Point -> GameState
<<<<<<< HEAD
setTile (GameState gs) t p = GameState ( gs { level = setLevelTile (gs.level) t p } )
=======
setTile (GameState gs) t p = GameState ( gs { level { tiles = (fromMaybe (gs.level.tiles) $ updateAt (p.y * gs.level.width + p.x) t gs.level.tiles) } } )
>>>>>>> 579428baf5debc2adaff60694763831e8ac307da

data Item = Weapon { weaponType :: WeaponType, prefixe :: WeaponPrefix }
          | Armour { armourType :: ArmourType, prefixe :: ArmourPrefix }
        --| Scroll { effect :: Effect }
        --| Potion { effect :: Effect }    
          | Wood
          | ErrorItem

data WeaponType = Axe | Dagger | Sword

weaponWeight :: WeaponType -> Int
weaponWeight Dagger = 4
weaponWeight Axe    = 12
weaponWeight _      = 10

data WeaponPrefix = Common | Rusty | Masterwork

weaponPrefixWeight :: WeaponPrefix -> Int
weaponPrefixWeight Rusty      = 8
weaponPrefixWeight Masterwork = 9
weaponPrefixWeight _          = 10

data ArmourType = Cloak | Chest | Gloves

armourWeight :: ArmourType -> Int
armourWeight Chest  = 20
armourWeight Gloves = 2
armourWeight _      = 10

data ArmourPrefix = CommonA | LightA | ThickA | MasterworkA

armourPrefixWeight :: ArmourPrefix -> Int
armourPrefixWeight LightA      = 5
armourPrefixWeight ThickA      = 13
armourPrefixWeight MasterworkA = 8
armourPrefixWeight _           = 10

itemWeight :: Item -> Int
itemWeight (Weapon w) = (weaponWeight w.weaponType) + (weaponPrefixWeight w.prefixe)
itemWeight (Armour a) = (armourWeight a.armourType) + (armourPrefixWeight a.prefixe)
itemWeight Wood       = 10
itemWeight _          = 2

addItem :: Creature -> Maybe Item -> Creature
addItem (Creature c) (Just i) = Creature ( c { inv = snoc (c.inv) i } )
addItem c _                   = c

deleteItem :: Creature -> Int -> Creature
deleteItem (Creature c) i =  Creature ( c { inv = fromMaybe (c.inv) $ deleteAt i (c.inv) } )

isCorrectArmour :: Item -> ArmourType -> Int -> Maybe Item
isCorrectArmour a Cloak  1 = Just a
isCorrectArmour a Chest  2 = Just a
isCorrectArmour a Gloves 3 = Just a
isCorrectArmour _ _ _      = Nothing

-- Just equips a new item, if the item corresponds with correct 'slot'
equip :: GameState -> Item -> Int -> GameState
equip (GameState gs) (Armour a) 1 = GameState (gs { equipment { cloak = isCorrectArmour (Armour a) a.armourType 1 } })
equip (GameState gs) (Armour a) 2 = GameState (gs { equipment { chest = isCorrectArmour (Armour a) a.armourType 2 } })
equip (GameState gs) (Armour a) 3 = GameState (gs { equipment { hands = isCorrectArmour (Armour a) a.armourType 3 } })
equip (GameState gs) w          4 = GameState(gs { equipment { weapon = Just w } })
equip gs _ _ = gs

unEquip :: GameState -> Int -> GameState
unEquip (GameState gs) 1 = GameState (gs { equipment { cloak  = Nothing }, player = addItem gs.player gs.equipment.cloak })
unEquip (GameState gs) 2 = GameState (gs { equipment { chest  = Nothing }, player = addItem gs.player gs.equipment.chest })
unEquip (GameState gs) 3 = GameState (gs { equipment { hands  = Nothing }, player = addItem gs.player gs.equipment.hands })
unEquip (GameState gs) 4 = GameState (gs { equipment { weapon = Nothing }, player = addItem gs.player gs.equipment.weapon })
unEquip gs _             = gs

dmg :: Creature -> Int
dmg (Creature c) = c.stats.str * creatureBaseDmg (Creature c)

attack :: Creature -> Creature -> Creature
attack (Creature ac) (Creature dc) = Creature dc { stats { hp = dc.stats.hp - dmg (Creature ac) } }


-- ThemeItems and ThemeCreatures ?  -TODO
randomItem :: Theme -> Int -> Item
randomItem _ _       = Wood

randomCreature :: Theme -> Int -> Point -> Creature
randomCreature _ _ p = Creature { creatureType: Ismo, pos: p, stats: { hpMax: 50, hp: 50, str: 9, dex: 12, int: 6 }, inv: [] }
