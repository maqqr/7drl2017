module Rogue where

import Prelude
import Data.Array (index, updateAt, snoc, deleteAt, replicate)
import Data.Int (toNumber)
import Data.Maybe (Maybe(..), fromMaybe, maybe)
import Data.Traversable (foldl)
import Data.StrMap (StrMap, empty)
import Random (Random, Seed, generateInt, runRandom)

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
    , coldStep   :: Int
    , maxEnc     :: Int
    , equipment  :: { cloak :: Maybe Item , chest :: Maybe Item , hands :: Maybe Item , weapon :: Maybe Item }
    }

initialGameState :: Unit -> GameState
initialGameState _ = GameState
    { level:      createLevel 75 25 (Ground { frozen: false })
    , player:     Creature {creatureType: Player {name: "Frozty"}, pos: {x: 0, y: 11}, stats: defaultStats unit, inv: [Wood, Wood, Armour { armourType: Cloak, prefix: CommonA }, Weapon { weaponType: Dagger, prefix: Rusty }], time: 0.0 }
    , coldStatus: 0
    , coldStep: 0
    , maxEnc: 70
    , equipment:  { cloak: Nothing, chest: Nothing, hands: Nothing, weapon: Nothing }
    }

totalEnc :: GameState -> Int
totalEnc (GameState gs@{ player: Creature player}) =
    cloak + chest + hands + weapon + inv
    where
        inv = foldl (+) 0 $ map itemWeight player.inv
        cloak = maybe 0 itemWeight gs.equipment.cloak
        chest = maybe 0 itemWeight gs.equipment.chest
        hands = maybe 0 itemWeight gs.equipment.hands
        weapon = maybe 0 itemWeight gs.equipment.weapon

newtype Creature = Creature
    { creatureType :: CreatureType
    , pos          :: Point
    , stats        :: Stats
    , inv          :: Array Item
    , time         :: Number
    }

data CreatureType = Player { name :: String }
                  | AlphaWolf
                  | Wolf
                  | Bear
                  | Goblin
                  | Snowman
                  | IceCorpse
                  | Tim
                  | IceElemental
                  | GiantIceElemental
                  | DwarfGhost
                  | Snake
                  | GiantSnake
                  | Bat

instance showCreature :: Show Creature where
    show (Creature { creatureType: Player p })          = p.name
    show (Creature { creatureType: AlphaWolf })         = "alpha wolf"
    show (Creature { creatureType: Wolf })              = "wolf"
    show (Creature { creatureType: Bear })              = "bear"
    show (Creature { creatureType: Goblin })            = "goblin"
    show (Creature { creatureType: Snowman })           = "snowman"
    show (Creature { creatureType: IceCorpse })         = "frozen zombie"
    show (Creature { creatureType: Tim })               = "evil wizard"
    show (Creature { creatureType: IceElemental })      = "small ice elemental"
    show (Creature { creatureType: GiantIceElemental }) = "giant ice elemental"
    show (Creature { creatureType: DwarfGhost })        = "dwarf spirit"
    show (Creature { creatureType: Snake })             = "snake"
    show (Creature { creatureType: GiantSnake })        = "giant snake"
    show (Creature { creatureType: Bat })               = "small bat"

createWizard :: Unit -> Creature
createWizard _ = Creature { creatureType: Tim, stats: { hpMax: 20, hp: 20, str: 10, dex: 10, int: 10 }, inv: [], pos: { x: 0, y: 0 }, time: 0.0}

creatureSpeed :: Creature -> Number
creatureSpeed (Creature c) = toNumber $ 300 - c.stats.dex * 10

creatureIcon :: Creature -> Char
creatureIcon (Creature { creatureType: Player p })          = '@'
creatureIcon (Creature { creatureType: AlphaWolf })         = 'W'
creatureIcon (Creature { creatureType: Wolf })              = 'w'
creatureIcon (Creature { creatureType: Bear })              = 'B'
creatureIcon (Creature { creatureType: Goblin })            = 'g'
creatureIcon (Creature { creatureType: Snowman })           = '\234'
creatureIcon (Creature { creatureType: IceCorpse })         = 'Z'
creatureIcon (Creature { creatureType: Tim })               = '\143'
creatureIcon (Creature { creatureType: IceElemental })      = '\164'
creatureIcon (Creature { creatureType: GiantIceElemental }) = '\165'
creatureIcon (Creature { creatureType: DwarfGhost })        = '\002'
creatureIcon (Creature { creatureType: Snake })             = 's'
creatureIcon (Creature { creatureType: GiantSnake })        = 'S'
creatureIcon (Creature { creatureType: Bat })               = 'b'


creatureColor :: Creature -> String
creatureColor (Creature { creatureType: Player p })          = "rgba(0, 200, 0, 0.6)"
creatureColor (Creature { creatureType: AlphaWolf })         = "rgba(200, 200, 200, 0.6)"
creatureColor (Creature { creatureType: Wolf })              = "rgba(100, 100, 100, 0.6)"
creatureColor (Creature { creatureType: Bear })              = "rgba(156, 98, 66, 0.6)"
creatureColor (Creature { creatureType: Goblin })            = "rgba(30, 150, 0, 0.6)"
creatureColor (Creature { creatureType: Snowman })           = "rgba(200, 200, 200, 0.6)"
creatureColor (Creature { creatureType: IceCorpse })         = "rgba(126, 121, 196, 0.6)"
creatureColor (Creature { creatureType: Tim })               = "rgba(245, 65, 241, 0.6)"
creatureColor (Creature { creatureType: IceElemental })      = "rgba(250, 250, 250, 0.2)"
creatureColor (Creature { creatureType: GiantIceElemental }) = "rgba(250, 250, 250, 0.2)"
creatureColor (Creature { creatureType: DwarfGhost })        = "rgba(100, 100, 100, 0.5)"
creatureColor (Creature { creatureType: Snake })             = "rgba(0, 120, 0, 0.6)"
creatureColor (Creature { creatureType: GiantSnake })        = "rgba(0, 120, 0, 0.6)"
creatureColor (Creature { creatureType: Bat })               = "rgba(120, 120, 120, 0.6)"

creatureTypeStats :: CreatureType -> Stats
creatureTypeStats AlphaWolf         = { hpMax: 12, hp: 12, str: 12, dex: 12, int:  9 }
creatureTypeStats Wolf              = { hpMax:  8, hp:  8, str:  7, dex: 10, int:  9 }
creatureTypeStats Bear              = { hpMax: 18, hp: 18, str: 12, dex:  6, int:  9 }
creatureTypeStats Goblin            = { hpMax:  6, hp:  6, str:  6, dex:  8, int:  8 }
creatureTypeStats Snowman           = { hpMax: 10, hp: 10, str: 14, dex:  6, int:  9 }
creatureTypeStats IceCorpse         = { hpMax:  6, hp:  6, str:  8, dex:  5, int:  9 }
creatureTypeStats Tim               = { hpMax: 20, hp: 20, str: 16, dex: 10, int: 50 }
creatureTypeStats IceElemental      = { hpMax: 10, hp: 10, str:  8, dex: 10, int: 10 }
creatureTypeStats GiantIceElemental = { hpMax: 15, hp: 15, str: 14, dex: 10, int: 10 }
creatureTypeStats Snake             = { hpMax:  6, hp:  6, str:  6, dex: 13, int: 10 }
creatureTypeStats GiantSnake        = { hpMax: 12, hp: 12, str: 10, dex:  9, int: 10 }
creatureTypeStats DwarfGhost        = { hpMax:  8, hp:  8, str:  8, dex:  8, int: 10 }
creatureTypeStats Bat               = { hpMax:  4, hp:  4, str:  4, dex: 13, int: 10 }
creatureTypeStats (Player _)        = { hpMax: 12, hp: 12, str: 12, dex: 10, int: 10 }

-- creatureBaseDmg :: Creature -> Int
-- creatureBaseDmg (Creature { creatureType: AlphaWolf }) = 2
-- creatureBaseDmg (Creature { creatureType: Bear })      = 3
-- creatureBaseDmg (Creature { creatureType: Snowman })   = 4
-- creatureBaseDmg (Creature { creatureType: Tim })       = 10
-- creatureBaseDmg _                                      = 1

setPlayer :: GameState -> Creature -> GameState
setPlayer (GameState gs) pl = GameState gs { player = pl }

getPlayer :: GameState -> Creature
getPlayer (GameState gs) = gs.player

isPlayer :: Creature -> Boolean
isPlayer (Creature { creatureType: Player _ }) = true
isPlayer _                                     = false

type Stats = 
    { hpMax :: Int
    , hp    :: Int
    , str   :: Int
    , dex   :: Int
    , int   :: Int
    }

defaultStats :: Unit -> Stats
defaultStats _ = { hpMax: 50, hp: 50, str: 6, dex: 10, int: 10 }

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
          | Hideout
          | Fire
          | WizardWall
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
    show Hideout         = "Hideout"
    show Fire            = "Fire"
    show WizardWall      = "WizardWall"
    show ErrorTile       = "ErrorTile"

isTileSolid :: Tile -> Boolean
isTileSolid (Ground _)      = false
isTileSolid (Forest _)      = false
isTileSolid (Water t)       = not t.frozen
isTileSolid (Puddle t)      = t.frozen
isTileSolid DungeonEntrance = false
isTileSolid Hideout         = false
isTileSolid StairsUp        = false
isTileSolid StairsDown      = false
isTileSolid Fire            = false
isTileSolid _               = true

isTileTransparent :: Tile -> Boolean
isTileTransparent (Wall _)       = false
isTileTransparent (Mountain _)   = false
isTileTransparent (Forest _)     = false
isTileTransparent WizardWall     = false
isTileTransparent _              = true

tileIcon :: Tile -> Char
tileIcon (Ground _)        = '.'
tileIcon (Wall _)          = '#'
tileIcon (Mountain _)      = '^'
tileIcon (Forest _)        = '\005'
tileIcon (Water _)         = '\247'
tileIcon (Puddle t)        = if t.frozen then '#' else '.'
tileIcon (Door _)          = '+'
tileIcon River             = '~'
tileIcon StairsUp          = '<'
tileIcon StairsDown        = '>'
tileIcon DungeonEntrance   = 'o'
tileIcon Hideout           = 'O'
tileIcon Fire              = '\015'
tileIcon WizardWall        = '#'
tileIcon _                 = '?'

frozenColor :: Frozen -> String
frozenColor { frozen: true } = "0.1)"
frozenColor { frozen: false } = "0.6)"

tileColor :: Tile -> String
tileColor (Ground t)   = "rgba(139, 69, 19, " <> frozenColor t
tileColor (Wall t)     = "rgba(120, 120, 120, " <> frozenColor t
tileColor (Mountain t) = "rgba(70, 70, 70, " <> frozenColor t
tileColor (Forest t)   = "rgba(20, 240, 30, " <> frozenColor t
tileColor (Water t)    = "rgba(10, 10, 125, " <> frozenColor t
tileColor (Puddle t)   = "rgba(20, 20, 250, " <> frozenColor t
tileColor (Door t)     = "rgba(200, 180, 50, " <> frozenColor t
tileColor River        = "rgba(10, 10, 125, 0.6)"
tileColor Hideout      = "rgba(100, 50, 125, 0.6)"
tileColor Fire         = "rgba(250, 70, 30, 0.9)"
tileColor WizardWall   = "rgba(245, 65, 241, 0.6)"
tileColor _            = "rgba(120, 120, 120, 0.6)"

data Theme = DwarvenMine | GoblinCave | Cave | IceCave | WizardTower

derive instance eqTheme :: Eq Theme

themeName :: Theme -> String
themeName DwarvenMine = "abandoned dwarven mines"
themeName GoblinCave = "goblin caves"
themeName Cave = "caves"
themeName WizardTower = "wizard's hideout"
themeName IceCave = "ice caves"

type Level =
    { tiles   :: Array Tile
    , width   :: Int
    , height  :: Int
    , enemies :: StrMap Creature
    , items   :: Array { pos :: Point, item :: Item }
    , up      :: Point
    , down    :: Point
    }

createLevel :: Int -> Int -> Tile -> Level
createLevel x y t =
    let zero = { x: 0, y: 0 }
    in { tiles: replicate (x*y) t, width: x, height: y, enemies: empty, items: [], up: zero, down: zero }

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


armourTypeName :: ArmourType -> String
armourTypeName Cloak = "cloak"
armourTypeName Gloves = "gloves"
armourTypeName Chest = "coat"

itemName :: Item -> String
itemName (Weapon w) = weaponPrefixName w.prefix <> " " <> weaponTypeName w.weaponType
itemName (Armour a) = armourPrefixName a.prefix <> " " <> armourTypeName a.armourType
-- itemName (Scroll s) = "scroll"
itemName (Potion p) = potionName p.effect
itemName Wood       = "wood"

itemIcon :: Item -> Char
itemIcon (Weapon w) = '/' 
itemIcon (Armour a) = '['
itemIcon (Potion p) = '\173'
itemIcon _          = '='

itemColor :: Item -> String
itemColor (Weapon w)                   = "rgba(102, 102, 153, 0.6)"
itemColor (Armour a)                   = "rgba(102, 102, 143, 0.6)"
itemColor (Potion { effect: Healing }) = "rgba(0, 102, 0, 0.6)"
itemColor (Potion { effect: Warming }) = "rgba(255, 0, 0, 0.6)"
itemColor _                            = "rgba(102, 51, 0, 0.6)"


type WeaponStats = { dmg :: Int, hit :: Int, weight :: Int }

data WeaponType = Axe | Dagger | Sword | Spear | Halberd

weaponTypeName :: WeaponType -> String
weaponTypeName Axe = "axe"
weaponTypeName Dagger = "dagger"
weaponTypeName Sword = "sword"
weaponTypeName Spear = "spear"
weaponTypeName Halberd = "halberd"

weaponTypeStats :: WeaponType -> WeaponStats
weaponTypeStats Axe     = { dmg:  6, hit: -20, weight:  6 }
weaponTypeStats Dagger  = { dmg:  1, hit:  10, weight:  2 }
weaponTypeStats Sword   = { dmg:  3, hit:   0, weight:  4 }
weaponTypeStats Spear   = { dmg:  2, hit:  10, weight:  3 }
weaponTypeStats Halberd = { dmg:  4, hit:   0, weight:  5 }

data WeaponPrefix = Common | Rusty | Masterwork | Sharp

weaponPrefixName :: WeaponPrefix -> String
weaponPrefixName Common = "common"
weaponPrefixName Rusty = "rusty"
weaponPrefixName Masterwork = "masterwork"
weaponPrefixName Sharp = "sharp"

weaponPrefixStats :: WeaponPrefix -> WeaponStats
weaponPrefixStats Rusty      = { dmg: -2, hit: -5, weight: -1 }
weaponPrefixStats Masterwork = { dmg:  4, hit: 10, weight:  0 }
weaponPrefixStats Sharp      = { dmg:  2, hit:  5, weight:  0 }
weaponPrefixStats _          = { dmg:  0, hit:  0, weight:  0 }


type ArmourStats = { ap :: Int, cr :: Int, weight :: Int }

addArmourStats :: ArmourStats -> ArmourStats -> ArmourStats
addArmourStats a b = { ap: a.ap + b.ap, cr: a.cr + b.cr, weight: a.weight + b.weight }

defaultArmourStats :: ArmourStats
defaultArmourStats = { ap: 0, cr: 0, weight: 0 }

data ArmourType = Cloak | Chest | Gloves

derive instance showArmourType :: Eq ArmourType

isArmourOfType :: Item -> ArmourType -> Boolean
isArmourOfType (Armour a) armourType = a.armourType == armourType
isArmourOfType _ _                   = false

isWeapon :: Item -> Boolean
isWeapon (Weapon _) = true
isWeapon _          = false

armourTypeStats :: ArmourType -> ArmourStats
armourTypeStats Cloak  = { ap: 1, cr: 5, weight: 8 }
armourTypeStats Gloves = { ap: 0, cr: 2, weight: 2 }
armourTypeStats Chest  = { ap: 2, cr: 4, weight: 6 }

data ArmourPrefix = CommonA | LightA | ThickA | MasterworkA

armourPrefixName :: ArmourPrefix -> String
armourPrefixName CommonA = "common"
armourPrefixName LightA = "light"
armourPrefixName ThickA = "thick"
armourPrefixName MasterworkA = "masterwork"

armourPrefixStats :: ArmourPrefix -> ArmourStats
armourPrefixStats LightA      = { ap: 0, cr: 0, weight: -3 }
armourPrefixStats ThickA      = { ap: 1, cr: 3, weight: 4 }
armourPrefixStats MasterworkA = { ap: 3, cr: 1, weight: 1 }
armourPrefixStats _           = { ap: 0, cr: 0, weight: 0 }

armourStats :: Item -> ArmourStats
armourStats (Armour a) = addArmourStats (armourTypeStats (a.armourType)) (armourPrefixStats (a.prefix))
armourStats _          = defaultArmourStats

playerArmour :: GameState -> Int
playerArmour (GameState gs) = (armourStats $ fromMaybe Wood (gs.equipment.cloak)).ap + (armourStats $ fromMaybe Wood (gs.equipment.chest)).ap + (armourStats $ fromMaybe Wood (gs.equipment.hands)).ap

playerColdRes :: GameState -> Int
playerColdRes (GameState gs) = (armourStats $ fromMaybe Wood (gs.equipment.cloak)).cr + (armourStats $ fromMaybe Wood (gs.equipment.chest)).cr + (armourStats $ fromMaybe Wood (gs.equipment.hands)).cr

data PotionEffect = Healing | Warming

potionName :: PotionEffect -> String
potionName Healing = "healing potion"
potionName Warming = "liquid fire"

potionEffect :: GameState -> Item -> GameState
potionEffect (GameState gs) (Potion { effect: Healing }) = GameState (gs { player = heal (gs.player) })
    where
        heal :: Creature -> Creature
        heal (Creature c) = Creature (c { stats { hp = max (c.stats.hp + 5) c.stats.hpMax } })
potionEffect (GameState gs) (Potion { effect: Warming }) = GameState (gs { coldStatus = warm })
    where
        warm :: Int
        warm = min (gs.coldStatus - 10) 0
potionEffect gs _ = gs


itemWeight :: Item -> Int
itemWeight (Weapon w) = max' 1 $ ((weaponTypeStats w.weaponType).weight) + ((weaponPrefixStats w.prefix).weight)
itemWeight (Armour a) = max' 1 $  ((armourTypeStats a.armourType).weight) + ((armourPrefixStats a.prefix).weight)
itemWeight (Potion _) = 1
itemWeight Wood       = 5

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
equip gs _ _                      = gs

unEquip :: GameState -> Int -> GameState
unEquip (GameState gs) 1 = GameState (gs { equipment { cloak  = Nothing }, player = addItem gs.player gs.equipment.cloak })
unEquip (GameState gs) 2 = GameState (gs { equipment { chest  = Nothing }, player = addItem gs.player gs.equipment.chest })
unEquip (GameState gs) 3 = GameState (gs { equipment { hands  = Nothing }, player = addItem gs.player gs.equipment.hands })
unEquip (GameState gs) 4 = GameState (gs { equipment { weapon = Nothing }, player = addItem gs.player gs.equipment.weapon })
unEquip gs _             = gs

weaponDamage :: Maybe Item -> Int
weaponDamage (Just (Weapon w)) = (weaponPrefixStats (w.prefix)).dmg + (weaponTypeStats (w.weaponType)).dmg
weaponDamage _                 = -3

weaponHitChance :: Maybe Item -> Int
weaponHitChance (Just (Weapon w)) = (weaponTypeStats w.weaponType).hit
weaponHitChance _                 = 0

creatureHitChance :: GameState -> Creature -> Int
creatureHitChance (GameState gs) (Creature c@{ creatureType: (Player _) }) = 40 + c.stats.dex * 2 + weaponHitChance gs.equipment.weapon
creatureHitChance _ (Creature c)                                           = 40 + c.stats.dex * 2

dmg :: Creature -> Maybe Item -> Random Int
dmg (Creature c) (Just w@(Weapon _)) =
    let maxDam = c.stats.str + weaponDamage (Just w)
    in generateInt 0 maxDam
dmg (Creature c) _ =
    let maxDam = c.stats.str
    in generateInt 0 maxDam

min' :: Int -> Int -> Int
min' x y
    | x < y     = x
    | otherwise = y

max' :: Int -> Int -> Int
max' x y
    | x > y     = x
    | otherwise = y

attack :: Seed -> GameState -> Creature -> Creature -> Creature
attack seed (GameState gs) ap@(Creature { creatureType: Player _ }) (Creature dc) =
    let d = (runRandom (dmg ap (gs.equipment.weapon)) seed).value
    in Creature dc { stats { hp = dc.stats.hp - d } }
attack seed gs ac (Creature dp@{ creatureType: Player _ }) =
    let d = max' 0 $ (runRandom (dmg ac Nothing) seed).value - playerArmour gs
    in Creature dp { stats { hp = dp.stats.hp - d } }
attack seed _ ac (Creature dc) =
    let d = (runRandom (dmg ac Nothing) seed).value
    in Creature dc { stats { hp = dc.stats.hp - d } }

-- cold :: GameState -> GameState
-- cold (GameState gs) = GameState gs { coldStatus = gs.coldStatus + 1 - playerColdRes (GameState gs) }
