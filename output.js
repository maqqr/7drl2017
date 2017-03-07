// Generated by psc-bundle 0.10.7
var PS = {};
(function(exports) {
  // Generated by psc version 0.10.7
  "use strict";
  var Semigroupoid = function (compose) {
      this.compose = compose;
  };
  var semigroupoidFn = new Semigroupoid(function (f) {
      return function (g) {
          return function (x) {
              return f(g(x));
          };
      };
  });
  var compose = function (dict) {
      return dict.compose;
  };
  exports["Semigroupoid"] = Semigroupoid;
  exports["compose"] = compose;
  exports["semigroupoidFn"] = semigroupoidFn;
})(PS["Control.Semigroupoid"] = PS["Control.Semigroupoid"] || {});
(function(exports) {
  // Generated by psc version 0.10.7
  "use strict";
  var Control_Semigroupoid = PS["Control.Semigroupoid"];        
  var Category = function (__superclass_Control$dotSemigroupoid$dotSemigroupoid_0, id) {
      this["__superclass_Control.Semigroupoid.Semigroupoid_0"] = __superclass_Control$dotSemigroupoid$dotSemigroupoid_0;
      this.id = id;
  };
  var id = function (dict) {
      return dict.id;
  };
  var categoryFn = new Category(function () {
      return Control_Semigroupoid.semigroupoidFn;
  }, function (x) {
      return x;
  });
  exports["Category"] = Category;
  exports["id"] = id;
  exports["categoryFn"] = categoryFn;
})(PS["Control.Category"] = PS["Control.Category"] || {});
(function(exports) {
    "use strict";

  exports.replicate = function (count) {
    return function (value) {
      var result = [];
      var n = 0;
      for (var i = 0; i < count; i++) {
        result[n++] = value;
      }
      return result;
    };
  };   

  //------------------------------------------------------------------------------
  // Array size ------------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.length = function (xs) {
    return xs.length;
  };

  exports.snoc = function (l) {
    return function (e) {
      var l1 = l.slice();
      l1.push(e);
      return l1;
    };
  };

  //------------------------------------------------------------------------------
  // Indexed operations ----------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.indexImpl = function (just) {
    return function (nothing) {
      return function (xs) {
        return function (i) {
          return i < 0 || i >= xs.length ? nothing :  just(xs[i]);
        };
      };
    };
  };

  exports._insertAt = function (just) {
    return function (nothing) {
      return function (i) {
        return function (a) {
          return function (l) {
            if (i < 0 || i > l.length) return nothing;
            var l1 = l.slice();
            l1.splice(i, 0, a);
            return just(l1);
          };
        };
      };
    };
  };

  exports._deleteAt = function (just) {
    return function (nothing) {
      return function (i) {
        return function (l) {
          if (i < 0 || i >= l.length) return nothing;
          var l1 = l.slice();
          l1.splice(i, 1);
          return just(l1);
        };
      };
    };
  };

  //------------------------------------------------------------------------------
  // Subarrays -------------------------------------------------------------------
  //------------------------------------------------------------------------------

  exports.slice = function (s) {
    return function (e) {
      return function (l) {
        return l.slice(s, e);
      };
    };
  };
})(PS["Data.Array"] = PS["Data.Array"] || {});
(function(exports) {
  // Generated by psc version 0.10.7
  "use strict";
  var Prelude = PS["Prelude"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Extend = PS["Control.Extend"];
  var Control_MonadZero = PS["Control.MonadZero"];
  var Control_Plus = PS["Control.Plus"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Functor_Invariant = PS["Data.Functor.Invariant"];
  var Data_Monoid = PS["Data.Monoid"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Functor = PS["Data.Functor"];
  var Control_Apply = PS["Control.Apply"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad = PS["Control.Monad"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Bounded = PS["Data.Bounded"];
  var Data_Show = PS["Data.Show"];
  var Data_Unit = PS["Data.Unit"];
  var Data_Function = PS["Data.Function"];
  var Control_Category = PS["Control.Category"];        
  var Nothing = (function () {
      function Nothing() {

      };
      Nothing.value = new Nothing();
      return Nothing;
  })();
  var Just = (function () {
      function Just(value0) {
          this.value0 = value0;
      };
      Just.create = function (value0) {
          return new Just(value0);
      };
      return Just;
  })();
  var maybe = function (v) {
      return function (v1) {
          return function (v2) {
              if (v2 instanceof Nothing) {
                  return v;
              };
              if (v2 instanceof Just) {
                  return v1(v2.value0);
              };
              throw new Error("Failed pattern match at Data.Maybe line 220, column 1 - line 220, column 22: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
          };
      };
  };
  var fromMaybe = function (a) {
      return maybe(a)(Control_Category.id(Control_Category.categoryFn));
  };
  exports["Nothing"] = Nothing;
  exports["Just"] = Just;
  exports["fromMaybe"] = fromMaybe;
  exports["maybe"] = maybe;
})(PS["Data.Maybe"] = PS["Data.Maybe"] || {});
(function(exports) {
  // Generated by psc version 0.10.7
  "use strict";
  var $foreign = PS["Data.Array"];
  var Prelude = PS["Prelude"];
  var Control_Alt = PS["Control.Alt"];
  var Control_Alternative = PS["Control.Alternative"];
  var Control_Lazy = PS["Control.Lazy"];
  var Control_Monad_Rec_Class = PS["Control.Monad.Rec.Class"];
  var Control_Monad_ST = PS["Control.Monad.ST"];
  var Data_Array_ST = PS["Data.Array.ST"];
  var Data_Array_ST_Iterator = PS["Data.Array.ST.Iterator"];
  var Data_Foldable = PS["Data.Foldable"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_NonEmpty = PS["Data.NonEmpty"];
  var Data_Traversable = PS["Data.Traversable"];
  var Data_Tuple = PS["Data.Tuple"];
  var Data_Unfoldable = PS["Data.Unfoldable"];
  var Partial_Unsafe = PS["Partial.Unsafe"];
  var Data_Function = PS["Data.Function"];
  var Data_Ord = PS["Data.Ord"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Boolean = PS["Data.Boolean"];
  var Data_Ordering = PS["Data.Ordering"];
  var Data_Ring = PS["Data.Ring"];
  var Data_Eq = PS["Data.Eq"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Control_Apply = PS["Control.Apply"];
  var Data_Functor = PS["Data.Functor"];
  var Control_Applicative = PS["Control.Applicative"];
  var Control_Bind = PS["Control.Bind"];
  var Control_Monad_Eff = PS["Control.Monad.Eff"];
  var Control_Semigroupoid = PS["Control.Semigroupoid"];
  var Data_Semigroup = PS["Data.Semigroup"];
  var Control_Category = PS["Control.Category"];
  var insertAt = $foreign._insertAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var index = $foreign.indexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  var deleteAt = $foreign._deleteAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
  exports["deleteAt"] = deleteAt;
  exports["index"] = index;
  exports["insertAt"] = insertAt;
  exports["replicate"] = $foreign.replicate;
  exports["snoc"] = $foreign.snoc;
})(PS["Data.Array"] = PS["Data.Array"] || {});
(function(exports) {
  // Generated by psc version 0.10.7
  "use strict";
  var Prelude = PS["Prelude"];
  var Data_Array = PS["Data.Array"];
  var Data_Maybe = PS["Data.Maybe"];
  var Data_Function = PS["Data.Function"];
  var Data_Semiring = PS["Data.Semiring"];
  var Data_Ring = PS["Data.Ring"];
  var Data_HeytingAlgebra = PS["Data.HeytingAlgebra"];
  var Data_Eq = PS["Data.Eq"];
  var Data_Semigroup = PS["Data.Semigroup"];        
  var Axe = (function () {
      function Axe() {

      };
      Axe.value = new Axe();
      return Axe;
  })();
  var Dagger = (function () {
      function Dagger() {

      };
      Dagger.value = new Dagger();
      return Dagger;
  })();
  var Sword = (function () {
      function Sword() {

      };
      Sword.value = new Sword();
      return Sword;
  })();
  var Common = (function () {
      function Common() {

      };
      Common.value = new Common();
      return Common;
  })();
  var Rusty = (function () {
      function Rusty() {

      };
      Rusty.value = new Rusty();
      return Rusty;
  })();
  var Masterwork = (function () {
      function Masterwork() {

      };
      Masterwork.value = new Masterwork();
      return Masterwork;
  })();
  var Ground = (function () {
      function Ground(value0) {
          this.value0 = value0;
      };
      Ground.create = function (value0) {
          return new Ground(value0);
      };
      return Ground;
  })();
  var Wall = (function () {
      function Wall(value0) {
          this.value0 = value0;
      };
      Wall.create = function (value0) {
          return new Wall(value0);
      };
      return Wall;
  })();
  var Mountain = (function () {
      function Mountain(value0) {
          this.value0 = value0;
      };
      Mountain.create = function (value0) {
          return new Mountain(value0);
      };
      return Mountain;
  })();
  var Forest = (function () {
      function Forest(value0) {
          this.value0 = value0;
      };
      Forest.create = function (value0) {
          return new Forest(value0);
      };
      return Forest;
  })();
  var Water = (function () {
      function Water(value0) {
          this.value0 = value0;
      };
      Water.create = function (value0) {
          return new Water(value0);
      };
      return Water;
  })();
  var Puddle = (function () {
      function Puddle(value0) {
          this.value0 = value0;
      };
      Puddle.create = function (value0) {
          return new Puddle(value0);
      };
      return Puddle;
  })();
  var Door = (function () {
      function Door(value0) {
          this.value0 = value0;
      };
      Door.create = function (value0) {
          return new Door(value0);
      };
      return Door;
  })();
  var StairsUp = (function () {
      function StairsUp() {

      };
      StairsUp.value = new StairsUp();
      return StairsUp;
  })();
  var StairsDown = (function () {
      function StairsDown() {

      };
      StairsDown.value = new StairsDown();
      return StairsDown;
  })();
  var DungeonEnterance = (function () {
      function DungeonEnterance() {

      };
      DungeonEnterance.value = new DungeonEnterance();
      return DungeonEnterance;
  })();
  var ErrorTile = (function () {
      function ErrorTile() {

      };
      ErrorTile.value = new ErrorTile();
      return ErrorTile;
  })();
  var Player = (function () {
      function Player(value0) {
          this.value0 = value0;
      };
      Player.create = function (value0) {
          return new Player(value0);
      };
      return Player;
  })();
  var AlphaWolf = (function () {
      function AlphaWolf() {

      };
      AlphaWolf.value = new AlphaWolf();
      return AlphaWolf;
  })();
  var Wolf = (function () {
      function Wolf() {

      };
      Wolf.value = new Wolf();
      return Wolf;
  })();
  var Goblin = (function () {
      function Goblin() {

      };
      Goblin.value = new Goblin();
      return Goblin;
  })();
  var Snowman = (function () {
      function Snowman() {

      };
      Snowman.value = new Snowman();
      return Snowman;
  })();
  var Tim = (function () {
      function Tim() {

      };
      Tim.value = new Tim();
      return Tim;
  })();
  var Ismo = (function () {
      function Ismo() {

      };
      Ismo.value = new Ismo();
      return Ismo;
  })();
  var Cloak = (function () {
      function Cloak() {

      };
      Cloak.value = new Cloak();
      return Cloak;
  })();
  var Chest = (function () {
      function Chest() {

      };
      Chest.value = new Chest();
      return Chest;
  })();
  var Gloves = (function () {
      function Gloves() {

      };
      Gloves.value = new Gloves();
      return Gloves;
  })();
  var CommonA = (function () {
      function CommonA() {

      };
      CommonA.value = new CommonA();
      return CommonA;
  })();
  var LightA = (function () {
      function LightA() {

      };
      LightA.value = new LightA();
      return LightA;
  })();
  var ThickA = (function () {
      function ThickA() {

      };
      ThickA.value = new ThickA();
      return ThickA;
  })();
  var MasterworkA = (function () {
      function MasterworkA() {

      };
      MasterworkA.value = new MasterworkA();
      return MasterworkA;
  })();
  var Weapon = (function () {
      function Weapon(value0) {
          this.value0 = value0;
      };
      Weapon.create = function (value0) {
          return new Weapon(value0);
      };
      return Weapon;
  })();
  var Armour = (function () {
      function Armour(value0) {
          this.value0 = value0;
      };
      Armour.create = function (value0) {
          return new Armour(value0);
      };
      return Armour;
  })();
  var Wood = (function () {
      function Wood() {

      };
      Wood.value = new Wood();
      return Wood;
  })();
  var ErrorItem = (function () {
      function ErrorItem() {

      };
      ErrorItem.value = new ErrorItem();
      return ErrorItem;
  })();
  var Creature = function (x) {
      return x;
  };
  var GameState = function (x) {
      return x;
  };
  var weaponWeight = function (v) {
      if (v instanceof Dagger) {
          return 4;
      };
      if (v instanceof Axe) {
          return 12;
      };
      return 10;
  };
  var weaponPrefixWeight = function (v) {
      if (v instanceof Rusty) {
          return 8;
      };
      if (v instanceof Masterwork) {
          return 9;
      };
      return 10;
  };
  var tileIcon = function (v) {
      if (v instanceof Ground) {
          return ".";
      };
      if (v instanceof Wall) {
          return "#";
      };
      if (v instanceof Mountain) {
          return "^";
      };
      if (v instanceof Forest) {
          return "T";
      };
      if (v instanceof Water) {
          return "~";
      };
      if (v instanceof Puddle) {
          if (v.value0.frozen) {
              return "#";
          };
          if (!v.value0.frozen) {
              return ".";
          };
          throw new Error("Failed pattern match at Rogue line 120, column 31 - line 121, column 1: " + [ v.value0.frozen.constructor.name ]);
      };
      if (v instanceof Door) {
          return "+";
      };
      if (v instanceof StairsUp) {
          return "<";
      };
      if (v instanceof StairsDown) {
          return ">";
      };
      if (v instanceof DungeonEnterance) {
          return "o";
      };
      return "?";
  };
  var setTile = function (v) {
      return function (t) {
          return function (p) {
              var $49 = {};
              for (var $50 in v) {
                  if ({}.hasOwnProperty.call(v, $50)) {
                      $49[$50] = v[$50];
                  };
              };
              $49.level = (function () {
                  var $46 = {};
                  for (var $47 in v.level) {
                      if ({}.hasOwnProperty.call(v.level, $47)) {
                          $46[$47] = v["level"][$47];
                      };
                  };
                  $46.tiles = Data_Maybe.fromMaybe(v.level.tiles)(Data_Array.insertAt((p.y * v.level.width | 0) + p.x | 0)(t)(v.level.tiles));
                  return $46;
              })();
              return $49;
          };
      };
  };
  var setPlayer = function (v) {
      return function (pl) {
          var $54 = {};
          for (var $55 in v) {
              if ({}.hasOwnProperty.call(v, $55)) {
                  $54[$55] = v[$55];
              };
          };
          $54.player = pl;
          return $54;
      };
  };
  var pointPlus = function (v) {
      return function (v1) {
          return {
              x: v.x + v1.x | 0, 
              y: v.y + v1.y | 0
          };
      };
  };
  var pointMinus = function (v) {
      return function (v1) {
          return {
              x: v.x - v1.x | 0, 
              y: v.y - v1.y | 0
          };
      };
  };
  var pointEquals = function (v) {
      return function (v1) {
          return v.x === v1.x && v.y === v1.y;
      };
  };
  var isTileTransparent = function (v) {
      if (v instanceof Wall) {
          return false;
      };
      if (v instanceof Mountain) {
          return false;
      };
      return true;
  };
  var isTileSolid = function (v) {
      if (v instanceof Ground) {
          return false;
      };
      if (v instanceof Forest) {
          return false;
      };
      if (v instanceof Water) {
          return !v.value0.frozen;
      };
      if (v instanceof Puddle) {
          return v.value0.frozen;
      };
      if (v instanceof DungeonEnterance) {
          return false;
      };
      return true;
  };
  var getTile = function (v) {
      return function (p) {
          return Data_Maybe.fromMaybe(ErrorTile.value)(Data_Array.index(v.level.tiles)((p.y * v.level.width | 0) + p.x | 0));
      };
  };
  var getPlayer = function (v) {
      return v.player;
  };
  var getName = function (v) {
      if (v.creatureType instanceof Player) {
          return v.creatureType.value0.name;
      };
      if (v.creatureType instanceof AlphaWolf) {
          return "alpha wolf";
      };
      if (v.creatureType instanceof Wolf) {
          return "wolf";
      };
      if (v.creatureType instanceof Goblin) {
          return "goblin";
      };
      if (v.creatureType instanceof Snowman) {
          return "snowman";
      };
      if (v.creatureType instanceof Tim) {
          return "evil sorcerer";
      };
      return "Ismo";
  };
  var frozenColor = function (v) {
      if (v.frozen) {
          return "0.2)";
      };
      if (!v.frozen) {
          return "0.6)";
      };
      throw new Error("Failed pattern match at Rogue line 128, column 1 - line 129, column 1: " + [ v.constructor.name ]);
  };
  var tileColor = function (v) {
      if (v instanceof Ground) {
          return "rgba(120, 120, 120, " + frozenColor(v.value0);
      };
      if (v instanceof Wall) {
          return "rgba(120, 120, 120, " + frozenColor(v.value0);
      };
      if (v instanceof Mountain) {
          return "rgba(70, 70, 70, " + frozenColor(v.value0);
      };
      if (v instanceof Forest) {
          return "rgba(20, 240, 30, " + frozenColor(v.value0);
      };
      if (v instanceof Water) {
          return "rgba(20, 20, 250, " + frozenColor(v.value0);
      };
      if (v instanceof Puddle) {
          return "rgba(20, 20, 250, " + frozenColor(v.value0);
      };
      if (v instanceof Door) {
          return "rgba(200, 180, 50, " + frozenColor(v.value0);
      };
      return "rgba(120, 120, 120, 0.6)";
  };
  var deleteItem = function (v) {
      return function (i) {
          var $107 = {};
          for (var $108 in v) {
              if ({}.hasOwnProperty.call(v, $108)) {
                  $107[$108] = v[$108];
              };
          };
          $107.inv = Data_Maybe.fromMaybe(v.inv)(Data_Array.deleteAt(i)(v.inv));
          return $107;
      };
  };
  var defaultStats = {
      hpMax: 200, 
      hp: 200, 
      str: 10, 
      dex: 10, 
      "int": 10
  };
  var initialGameState = {
      level: {
          tiles: Data_Array.replicate(75 * 25 | 0)(new Ground({
              frozen: false
          })), 
          width: 75, 
          height: 25
      }, 
      player: {
          creatureType: new Player({
              name: "Frozty"
          }), 
          pos: {
              x: 10, 
              y: 10
          }, 
          stats: defaultStats, 
          inv: [  ]
      }, 
      coldStatus: 100, 
      enemies: [  ], 
      items: [  ], 
      equipment: {
          cloak: Data_Maybe.Nothing.value, 
          chest: Data_Maybe.Nothing.value, 
          hands: Data_Maybe.Nothing.value, 
          weapon: Data_Maybe.Nothing.value
      }
  };
  var creatureBaseDmg = function (v) {
      if (v.creatureType instanceof AlphaWolf) {
          return 2;
      };
      if (v.creatureType instanceof Snowman) {
          return 4;
      };
      if (v.creatureType instanceof Tim) {
          return 10;
      };
      return 1;
  };
  var dmg = function (v) {
      return v.stats.str * creatureBaseDmg(v) | 0;
  };
  var attack = function (v) {
      return function (v1) {
          var $120 = {};
          for (var $121 in v1) {
              if ({}.hasOwnProperty.call(v1, $121)) {
                  $120[$121] = v1[$121];
              };
          };
          $120.stats = (function () {
              var $117 = {};
              for (var $118 in v1.stats) {
                  if ({}.hasOwnProperty.call(v1.stats, $118)) {
                      $117[$118] = v1["stats"][$118];
                  };
              };
              $117.hp = v1.stats.hp - dmg(v) | 0;
              return $117;
          })();
          return $120;
      };
  };
  var armourWeight = function (v) {
      if (v instanceof Chest) {
          return 20;
      };
      if (v instanceof Gloves) {
          return 2;
      };
      return 10;
  };
  var armourPrefixWeight = function (v) {
      if (v instanceof LightA) {
          return 5;
      };
      if (v instanceof ThickA) {
          return 13;
      };
      if (v instanceof MasterworkA) {
          return 8;
      };
      return 10;
  };
  var itemWeight = function (v) {
      if (v instanceof Weapon) {
          return weaponWeight(v.value0.weaponType) + weaponPrefixWeight(v.value0.prefixe) | 0;
      };
      if (v instanceof Armour) {
          return armourWeight(v.value0.armourType) + armourPrefixWeight(v.value0.prefixe) | 0;
      };
      if (v instanceof Wood) {
          return 10;
      };
      return 2;
  };
  var addItem = function (v) {
      return function (i) {
          var $130 = {};
          for (var $131 in v) {
              if ({}.hasOwnProperty.call(v, $131)) {
                  $130[$131] = v[$131];
              };
          };
          $130.inv = Data_Array.snoc(v.inv)(i);
          return $130;
      };
  };
  exports["CommonA"] = CommonA;
  exports["LightA"] = LightA;
  exports["ThickA"] = ThickA;
  exports["MasterworkA"] = MasterworkA;
  exports["Cloak"] = Cloak;
  exports["Chest"] = Chest;
  exports["Gloves"] = Gloves;
  exports["Creature"] = Creature;
  exports["Player"] = Player;
  exports["AlphaWolf"] = AlphaWolf;
  exports["Wolf"] = Wolf;
  exports["Goblin"] = Goblin;
  exports["Snowman"] = Snowman;
  exports["Tim"] = Tim;
  exports["Ismo"] = Ismo;
  exports["GameState"] = GameState;
  exports["Weapon"] = Weapon;
  exports["Armour"] = Armour;
  exports["Wood"] = Wood;
  exports["ErrorItem"] = ErrorItem;
  exports["Ground"] = Ground;
  exports["Wall"] = Wall;
  exports["Mountain"] = Mountain;
  exports["Forest"] = Forest;
  exports["Water"] = Water;
  exports["Puddle"] = Puddle;
  exports["Door"] = Door;
  exports["StairsUp"] = StairsUp;
  exports["StairsDown"] = StairsDown;
  exports["DungeonEnterance"] = DungeonEnterance;
  exports["ErrorTile"] = ErrorTile;
  exports["Common"] = Common;
  exports["Rusty"] = Rusty;
  exports["Masterwork"] = Masterwork;
  exports["Axe"] = Axe;
  exports["Dagger"] = Dagger;
  exports["Sword"] = Sword;
  exports["addItem"] = addItem;
  exports["armourPrefixWeight"] = armourPrefixWeight;
  exports["armourWeight"] = armourWeight;
  exports["attack"] = attack;
  exports["creatureBaseDmg"] = creatureBaseDmg;
  exports["defaultStats"] = defaultStats;
  exports["deleteItem"] = deleteItem;
  exports["dmg"] = dmg;
  exports["frozenColor"] = frozenColor;
  exports["getName"] = getName;
  exports["getPlayer"] = getPlayer;
  exports["getTile"] = getTile;
  exports["initialGameState"] = initialGameState;
  exports["isTileSolid"] = isTileSolid;
  exports["isTileTransparent"] = isTileTransparent;
  exports["itemWeight"] = itemWeight;
  exports["pointEquals"] = pointEquals;
  exports["pointMinus"] = pointMinus;
  exports["pointPlus"] = pointPlus;
  exports["setPlayer"] = setPlayer;
  exports["setTile"] = setTile;
  exports["tileColor"] = tileColor;
  exports["tileIcon"] = tileIcon;
  exports["weaponPrefixWeight"] = weaponPrefixWeight;
  exports["weaponWeight"] = weaponWeight;
})(PS["Rogue"] = PS["Rogue"] || {});
