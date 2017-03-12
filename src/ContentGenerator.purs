module ContentGenerator where

import Prelude
import Rogue
import Data.Array (filter, head, tail)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Traversable (foldl)
import Partial.Unsafe (unsafeCrashWith, unsafePartial)
import Random (Random, generateInt, unsafeSelectOne)

type Weighted a = { item :: a, weight :: Int }

type DungeonDepth = Int

randomWeighted :: forall a. Array (Weighted a) -> Random a
randomWeighted initialItems =
    go (filterNegativeWeights initialItems) <$> generateInt 0 weightSum
    where
        go items weight =
            case head items of
                Nothing -> unsafeCrashWith "empty array in randomWeighted"
                Just value ->
                    if weight > value.weight
                        then let tail' = fromMaybe [] (tail items)
                             in go tail' (weight - value.weight)
                        else value.item

        weightSum :: Int
        weightSum = foldl (\acc a -> acc + a.weight) 0 initialItems


filterNegativeWeights :: forall a. Array (Weighted a) -> Array (Weighted a)
filterNegativeWeights = filter (\x -> x.weight > 0)

randomTheme :: Random Theme
randomTheme = unsafePartial $ unsafeSelectOne [DwarvenMine, GoblinCave, Cave, IceCave]

randomItem :: Theme -> Int -> Random Item
randomItem theme depth = do
    weapon <- randomWeapon
    armour <- randomArmour
    potion <- randomPotion
    wood   <- pure Wood
    randomWeighted [{ item: weapon, weight: 20 }
                   ,{ item: armour, weight: 20 }
                   ,{ item: potion, weight: 10 }
                   ,{ item: wood,   weight: 5 }
                   ]
    where
        ------------ Weapon generation ------------

        weaponTypeWeights :: Array (Weighted WeaponType)
        weaponTypeWeights = [{ item: Axe,    weight: if theme == DwarvenMine then 100 else 5 }
                            ,{ item: Dagger, weight: 40 }
                            ,{ item: Sword,  weight: 20 }
                            ,{ item: Spear,  weight: 20 }
                            ]

        weaponPrefixWeights :: Array (Weighted WeaponPrefix)
        weaponPrefixWeights = [{ item: Common,     weight: 30 - depth }
                              ,{ item: Rusty,      weight: 30 - depth * 10 }
                              ,{ item: Masterwork, weight: 0 + depth * 2}
                              ,{ item: Sharp,      weight: 10 + depth * 5 }
                              ]

        randomWeapon :: Random Item
        randomWeapon = do
            wType <- randomWeighted weaponTypeWeights
            prefix <- randomWeighted weaponPrefixWeights
            pure $ Weapon { weaponType: wType, prefix: prefix }

        ------------ Armour generation ------------

        armourTypeWeights :: Array (Weighted ArmourType)
        armourTypeWeights = [{ item: Cloak,  weight: 10 }
                            ,{ item: Chest,  weight: 10 }
                            ,{ item: Gloves, weight: 10 }
                            ]

        armourPrefixWeights :: Array (Weighted ArmourPrefix)
        armourPrefixWeights = [{ item: CommonA,     weight: 30 - depth }
                              ,{ item: LightA,      weight: 20 + depth }
                              ,{ item: ThickA,      weight: 10 + depth * 2 }
                              ,{ item: MasterworkA, weight: 5 + depth }
                              ]
        
        randomArmour :: Random Item
        randomArmour = do
            aType <- randomWeighted armourTypeWeights
            prefix <- randomWeighted armourPrefixWeights
            pure $ Armour { armourType: aType, prefix: prefix }

        ------------ Potion generation ------------

        potionEffectWeights :: Array (Weighted PotionEffect)
        potionEffectWeights = [{ item: Healing, weight: 50 }
                              ,{ item: Warming, weight: 50 }
                              ]

        randomPotion :: Random Item
        randomPotion = do
            eff <- randomWeighted potionEffectWeights
            pure $ Potion { effect: eff }



randomEnemy :: Theme -> Int -> Random Creature
randomEnemy theme depth = randomCreature
    where
        randomCreatureType :: Array (Weighted CreatureType)
        randomCreatureType = [{ item: AlphaWolf,         weight: if theme == Cave then 100 else 5 }
                             ,{ item: Wolf,              weight: if theme == Cave then 300 else 30 }
                             ,{ item: Bear,              weight: if theme == Cave then 300 else 30 }
                             ,{ item: Goblin,            weight: if theme == GoblinCave then 400 else 10 }
                             ,{ item: Snowman,           weight: if theme == IceCave || theme == WizardTower then 200 else 5 }
                             ,{ item: IceCorpse,         weight: if theme == IceCave || theme == WizardTower then 200 else 5 }
                             ,{ item: IceElemental,      weight: if theme == IceCave || theme == WizardTower then 200 else 5 }
                             ,{ item: GiantIceElemental, weight: if theme == WizardTower then 200 else 0 }
                             ,{ item: Snake,             weight: if theme == Cave then 300 else 0 }
                             ,{ item: GiantSnake,        weight: if theme == Cave then 100 else 0 }
                             ,{ item: DwarfGhost,        weight: if theme == DwarvenMine then 600 else 0 }
                             ]

        randomCreatureStats :: Array (Weighted Stats)
        randomCreatureStats = [{ item: { hpMax:  3, hp:  3, str:  2, dex:  2, int:  0 }, weight: 10 }
                              ,{ item: { hpMax:  2, hp:  2, str:  1, dex:  1, int:  0 }, weight: 20 }
                              ,{ item: { hpMax:  1, hp:  1, str:  1, dex:  1, int:  0 }, weight: 60 }
                              ,{ item: { hpMax:  0, hp:  0, str:  0, dex:  0, int:  0 }, weight: 50 }
                              ]

        randomCreature :: Random Creature
        randomCreature = do
            s <- randomWeighted randomCreatureStats
            c <- randomWeighted randomCreatureType
            pure $ Creature { creatureType: c, pos: { x: 0, y: 0 }, stats: addStats s (creatureTypeStats c) , inv: [], time: 0.0 }
