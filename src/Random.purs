module Random where

import Prelude
import Data.Array (index, length, unsafeIndex)
import Data.Maybe (Maybe)

type Seed = Int


newtype Random a = Random (Seed -> { value :: a, seed :: Seed })

runRandom :: forall a. Random a -> Seed -> { value :: a, seed :: Seed }
runRandom (Random f) seed = f seed

--showResult :: forall a. Show a => { value :: a, seed :: Seed } -> String
--showResult r = "(" <> show r.value <> ", " <> show r.seed <> ")"

instance randomFunctor :: Functor Random where
    -- map :: forall a b. (a -> b) -> Random a -> Random b
    map f (Random rnd) =
        Random $ \seed -> let result = rnd seed
                          in result { value = f result.value }

instance applyRandom :: Apply Random where
    -- apply :: forall a b. Random (a -> b) -> Random a -> Random b
    apply rf ra = Random $ \seed ->
        let f = runRandom rf seed
            a = runRandom ra f.seed
        in { value: f.value a.value, seed: a.seed }

instance randomBind :: Bind Random where
    -- bind :: forall a b. Random a -> (a -> Random b) -> Random b
    bind a f = Random $ \seed ->
        let result = runRandom a seed
        in runRandom (f result.value) result.seed

instance randomApplicative :: Applicative Random where
    -- pure :: forall a. a -> Random a
    pure x = Random $ \seed -> { value: x, seed: seed }

instance randomMonad :: Monad Random


generate :: Random Int
generate = Random $ \seed ->
    let new = abs ((a * seed + c) `mod` m)
    in { value: new, seed: new }
    where
        a = 0x343FD
        c = 0x269EC
        m = 0x800000

        abs x | x < 0     = -x
              | otherwise =  x


generateInt :: Int -> Int -> Random Int
generateInt min max = (\n -> min + (n `mod` (max - min))) <$> generate

selectOne :: forall a. Array a -> Random (Maybe a)
selectOne arr = index arr <$> generateInt 0 (length arr)

unsafeSelectOne :: forall a. Partial => Array a -> Random a
unsafeSelectOne arr = unsafeIndex arr <$> generateInt 0 (length arr)
