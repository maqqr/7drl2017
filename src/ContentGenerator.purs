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
randomTheme = unsafePartial $ unsafeSelectOne [DwarvenMine, GoblinCave, Cave]

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
        weaponTypeWeights = [{ item: Axe,    weight: 15 }
                            ,{ item: Dagger, weight: 40 }
                            ,{ item: Sword,  weight: 10 }
                            ]

        weaponPrefixWeights :: Array (Weighted WeaponPrefix)
        weaponPrefixWeights = [{ item: Common,     weight: 30 }
                              ,{ item: Rusty,      weight: 30 }
                              ,{ item: Masterwork, weight: 0}
                              ,{ item: Sharp,      weight: 10 }
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
        armourPrefixWeights = [{ item: CommonA,     weight: 30 }
                              ,{ item: LightA,      weight: 20 }
                              ,{ item: ThickA,      weight: 10}
                              ,{ item: MasterworkA, weight: 5 }
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
        randomCreatureType = [{ item: AlphaWolf, weight: if theme == Cave then 100 else 5 }
                             ,{ item: Wolf,      weight: if theme == Cave then 300 else 30 }
                             ,{ item: Bear,      weight: if theme == Cave then 300 else 30 }
                             ,{ item: Goblin,    weight: if theme == GoblinCave then 400 else 10 }
                             ,{ item: Snowman,   weight: if theme == IceCave then 200 else 5 }
                             ,{ item: IceCorpse, weight: if theme == IceCave then 200 else 5 }
                             ]

        randomCreatureStats :: Array (Weighted Stats)
        randomCreatureStats = [{ item: { hpMax: 14, hp: 14, str: 11, dex: 10, int:  9 }, weight: 10 }
                              ,{ item: { hpMax: 12, hp: 12, str: 10, dex: 11, int: 13 }, weight: 20 }
                              ,{ item: { hpMax: 10, hp: 10, str: 10, dex: 10, int: 10 }, weight: 60 }
                              ,{ item: { hpMax:  8, hp:  8, str:  8, dex:  8, int:  8 }, weight: 50 }
                              ]

        randomCreature :: Random Creature
        randomCreature = do
            s <- randomWeighted randomCreatureStats
            c <- randomWeighted randomCreatureType
            pure $ Creature { creatureType: c, pos: { x: 0, y: 0 }, stats: addStats s (creatureTypeStats c) , inv: [], time: 0.0 }
