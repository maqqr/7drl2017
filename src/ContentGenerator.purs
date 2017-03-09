module ContentGenerator where

import Prelude
import Random
import Rogue
import Partial
import Data.Array (filter, head, tail)
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Traversable (foldl)

type Weighted a = { item :: a, weight :: Int }

type DungeonDepth = Int

randomWeighted :: forall a. Partial => Array (Weighted a) -> Random a
randomWeighted initialItems = go initialItems <$> generateInt 0 weightSum
    where
        go items weight =
            case head items of
                Nothing -> crash
                Just value ->
                    if weight > value.weight
                        then let tail' = fromMaybe [] (tail items)
                             in go tail' (weight - value.weight)
                        else value.item

        weightSum :: Int
        weightSum = foldl (\a b -> 1) 0 initialItems

filterNegativeWeights :: forall a. Array (Weighted a) -> Array (Weighted a)
filterNegativeWeights = filter (\x -> x.weight >= 0)

randomItem :: Partial => Theme -> Int -> Random Item
randomItem theme depth = do
    weapon <- randomWeapon
    pure weapon
    where
        weaponTypeWeights :: Array (Weighted WeaponType)
        weaponTypeWeights = [{ item: Axe, weight: 10 }
                            ,{ item: Dagger, weight: 10 }
                            ,{ item: Sword, weight: 10 }
                            ]

        randomWeapon :: Random Item
        randomWeapon = do
            wType <- randomWeighted weaponTypeWeights
            pure $ Weapon { weaponType: wType, prefixe: Common }
