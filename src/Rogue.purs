module Rogue where

import Prelude
import Data.Array (index, updateAt, snoc, deleteAt, replicate)
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
                  | Bear
                  | Goblin
                  | Snowman
                  | IceCorpse
                  | Tim
                  | Ismo

instance showCreature :: Show Creature where
    show (Creature { creatureType: Player p })  = p.name
    show (Creature { creatureType: AlphaWolf }) = "alpha wolf"
    show (Creature { creatureType: Wolf })      = "wolf"
    show (Creature { creatureType: Bear })      = "bear"
    show (Creature { creatureType: Goblin })    = "goblin"
    show (Creature { creatureType: Snowman })   = "snowman"
    show (Creature { creatureType: IceCorpse }) = "frozen zombie"
    show (Creature { creatureType: Tim })       = "evil sorcerer"
    show _                                      = "Ismo"

creatureIcon :: Creature -> Char
creatureIcon (Creature { creatureType: Player p })  = '@'
creatureIcon (Creature { creatureType: AlphaWolf }) = 'W'
creatureIcon (Creature { creatureType: Wolf })      = 'w'
creatureIcon (Creature { creatureType: Bear })      = 'B'
creatureIcon (Creature { creatureType: Goblin })    = 'G'
creatureIcon (Creature { creatureType: Snowman })   = 'S'
creatureIcon (Creature { creatureType: IceCorpse }) = 'Z'
creatureIcon (Creature { creatureType: Tim })       = '\001'
creatureIcon _                                      = 'S'

creatureTypeStats :: CreatureType -> Stats
creatureTypeStats AlphaWolf  = { hpMax: 16, hp: 16, str: 15, dex: 17, int:  9 }
creatureTypeStats Wolf       = { hpMax: 10, hp: 10, str: 10, dex: 12, int:  9 }
creatureTypeStats Bear       = { hpMax: 20, hp: 20, str: 20, dex: 10, int:  9 }
creatureTypeStats Goblin     = { hpMax: 10, hp: 10, str:  8, dex: 10, int:  8 }
creatureTypeStats Snowman    = { hpMax: 15, hp: 15, str: 18, dex: 16, int:  9 }
creatureTypeStats IceCorpse  = { hpMax: 25, hp: 25, str: 12, dex:  8, int:  9 }
creatureTypeStats Tim        = { hpMax: 99, hp: 99, str: 10, dex: 15, int: 50 }
creatureTypeStats _          = { hpMax: 10, hp: 10, str: 10, dex: 10, int: 10 }

creatureBaseDmg :: Creature -> Int
creatureBaseDmg (Creature { creatureType: AlphaWolf }) = 2
creatureBaseDmg (Creature { creatureType: Bear })      = 3
creatureBaseDmg (Creature { creatureType: Snowman })   = 4
creatureBaseDmg (Creature { creatureType: Tim })       = 10
creatureBaseDmg _                                      = 1

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

addStats :: Stats -> Stats -> Stats
addStats a b = { hpMax: a.hpMax + b.hpMax, hp: a.hp + b.hp, str: a.str + b.str, dex: a.dex + b.dex, int: a.int + b.int }

type Frozen = { frozen :: Boolean }

data Tile = Ground Frozen
          | Wall Frozen
          | Mountain Frozen
          | Forest Frozen
          | Water Frozen  -- Large body of water (river, lake, etc.), solid when unfrozen (because the player can not swim)
          | Puddle Frozen -- Wet floor, turns into solid ice wall when frozen
          | Door Frozen
          | River
          | StairsUp
          | StairsDown
          | DungeonEntrance
          | ErrorTile

instance showTile :: Show Tile where
    show (Ground _)      = "Ground"
    show (Wall _)        = "Wall"
    show (Mountain _)    = "Mountain"
    show (Forest _)      = "Forest"
    show (Water _)       = "Water"
    show (Puddle _)      = "Puddle"
    show (Door _)        = "Door"
    show River           = "River"
    show StairsUp        = "StairsUp"
    show StairsDown      = "StairsDown"
    show DungeonEntrance = "DungeonEntrance"
    show ErrorTile       = "ErrorTile"

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
isTileTransparent (Forest _)   = false
isTileTransparent _            = true

tileIcon :: Tile -> Char
tileIcon (Ground _)        = '.'
tileIcon (Wall _)          = '#'
tileIcon (Mountain _)      = '^'
tileIcon (Forest _)        = 'T'
tileIcon (Water _)         = '\247'
tileIcon (Puddle t)        = if t.frozen then '#' else '.'
tileIcon (Door _)          = '+'
tileIcon (River)           = '~'
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
tileColor River        = "rgba(10, 10, 125, 0.6)"
tileColor _            = "rgba(120, 120, 120, 0.6)"

data Theme = Mine | GoblinCave | Cave | WizardTower

derive instance eqTheme :: Eq Theme


type Level =
    { tiles   :: Array Tile
    , width   :: Int
    , height  :: Int
    , enemies :: Array Creature
    , items   :: Array { pos :: Point, item :: Item }
    , up      :: Point
    , down    :: Point
    }

createLevel :: Int -> Int -> Tile -> Level
createLevel x y t =
    let zero = { x: 0, y: 0 }
    in { tiles: replicate (x*y) t, width: x, height: y, enemies: [], items: [], up: zero, down: zero }

getLevelTile :: Level -> Point -> Tile
getLevelTile level p = fromMaybe ErrorTile $ index (level.tiles) (p.y * level.width + p.x)

setLevelTile :: Level -> Tile -> Point -> Level
setLevelTile level t p = level { tiles = (fromMaybe (level.tiles) $ updateAt (p.y * level.width + p.x) t level.tiles) }

getTile :: GameState -> Point -> Tile
getTile (GameState gs) p = getLevelTile (gs.level) p

setTile :: GameState -> Tile -> Point -> GameState
setTile (GameState gs) t p = GameState ( gs { level = setLevelTile (gs.level) t p } )

setExits :: Level -> Point -> Point -> Level
setExits l u d = { tiles: l.tiles, width: l.width, height: l.height, enemies: l.enemies, items: l.items, up: u, down: d }

data Item = Weapon { weaponType :: WeaponType, prefix :: WeaponPrefix }
          | Armour { armourType :: ArmourType, prefix :: ArmourPrefix }
        --| Scroll { effect :: Effect }
          | Potion { effect :: PotionEffect }    
          | Wood


type WeaponStats = { dmg :: Int, hit :: Int, weight :: Int }

data WeaponType = Axe | Dagger | Sword

weaponTypeStats :: WeaponType -> WeaponStats
weaponTypeStats Axe    = { dmg: 5, hit: -3, weight: 12 }
weaponTypeStats Dagger = { dmg: -5, hit: 5, weight: 4 }
weaponTypeStats _      = { dmg: 2, hit: 0, weight: 10}

data WeaponPrefix = Common | Rusty | Masterwork | Sharp

weaponPrefixStats :: WeaponPrefix -> WeaponStats
weaponPrefixStats Rusty      = { dmg: -2, hit: 0, weight: -1 }
weaponPrefixStats Masterwork = { dmg: 5, hit: 2, weight: 0 }
weaponPrefixStats Sharp      = { dmg: 2, hit: 0, weight: 0 }
weaponPrefixStats _          = { dmg: 0, hit: 0, weight: 0 }


type ArmourStats = { ap :: Int, cr :: Int, weight :: Int }

addArmourStats :: ArmourStats -> ArmourStats -> ArmourStats
addArmourStats a b = { ap: a.ap + b.ap, cr: a.cr + b.cr, weight: a.weight + b.weight }

defaultArmourStats :: ArmourStats
defaultArmourStats = { ap: 0, cr: 0, weight: 0 }

data ArmourType = Cloak | Chest | Gloves

armourTypeStats :: ArmourType -> ArmourStats
armourTypeStats Cloak  = { ap: 1, cr: 5, weight: 8 }
armourTypeStats Gloves = { ap: 0, cr: 5, weight: 3 }
armourTypeStats _      = { ap: 5, cr: 1, weight: 20 }

data ArmourPrefix = CommonA | LightA | ThickA | MasterworkA

armourPrefixStats :: ArmourPrefix -> ArmourStats
armourPrefixStats LightA      = { ap: 0, cr: 0, weight: -3 }
armourPrefixStats ThickA      = { ap: 1, cr: 3, weight: 5 }
armourPrefixStats MasterworkA = { ap: 4, cr: 1, weight: 0 }
armourPrefixStats _           = { ap: 0, cr: 0, weight: 0 }

armourStats :: Item -> ArmourStats
armourStats (Armour a) = addArmourStats (armourTypeStats (a.armourType)) (armourPrefixStats (a.prefix))
armourStats _          = defaultArmourStats

playerArmour :: GameState -> Int
playerArmour (GameState gs) = (armourStats $ fromMaybe Wood (gs.equipment.cloak)).ap + (armourStats $ fromMaybe Wood (gs.equipment.chest)).ap + (armourStats $ fromMaybe Wood (gs.equipment.hands)).ap

playerColdRes :: GameState -> Int
playerColdRes (GameState gs) = (armourStats $ fromMaybe Wood (gs.equipment.cloak)).cr + (armourStats $ fromMaybe Wood (gs.equipment.chest)).cr + (armourStats $ fromMaybe Wood (gs.equipment.hands)).cr

data PotionEffect = Healing | Warming


potionEffect :: GameState -> Item -> GameState
potionEffect (GameState gs) (Potion { effect: Healing }) = GameState (gs { player = pl (gs.player) })
    where
        pl :: Creature -> Creature
        pl p@(Creature c) = Creature (c { stats { hp = heal p } })

        heal :: Creature -> Int
        heal (Creature c) = if (c.stats.hp + 5) > (c.stats.hpMax) then (c.stats.hpMax) else (c.stats.hp + 5)
potionEffect (GameState gs) (Potion { effect: Warming }) = GameState (gs { coldStatus = warm })
    where
        warm :: Int
        warm = if (gs.coldStatus + 10) > 100 then 100 else (gs.coldStatus + 10)
potionEffect gs _ = gs


itemWeight :: Item -> Int
itemWeight (Weapon w) = ((weaponTypeStats w.weaponType).weight) + ((weaponPrefixStats w.prefix).weight)
itemWeight (Armour a) = ((armourTypeStats a.armourType).weight) + ((armourPrefixStats a.prefix).weight)
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

dmg :: Creature -> Maybe Item -> Int
dmg (Creature c) (Just (Weapon w)) = c.stats.str + (weaponPrefixStats (w.prefix)).dmg + (weaponTypeStats (w.weaponType)).dmg
dmg (Creature c) _                 = c.stats.str * creatureBaseDmg (Creature c)

attack :: GameState -> Creature -> Creature -> Creature
attack (GameState gs) ap@(Creature { creatureType: Player _ }) (Creature dc) = Creature dc { stats { hp = dc.stats.hp - dmg ap (gs.equipment.weapon) } }
attack gs ac (Creature dp@{ creatureType: Player _ }) = Creature dp { stats { hp = dmgToPlayer } }
    where
        dmgToPlayer :: Int
        dmgToPlayer = if playerArmour gs >= (dmg ac Nothing) then 1 else (dmg ac Nothing) - playerArmour gs
attack _ ac (Creature dc) = Creature dc { stats { hp = dc.stats.hp - dmg ac Nothing } }

cold :: GameState -> GameState
cold (GameState gs) = GameState gs { coldStatus = gs.coldStatus - 20 + playerColdRes (GameState gs) }
