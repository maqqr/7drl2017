let worldmap: Array<string> = [];
worldmap[0]  = "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^";
worldmap[1]  = "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^~^^^^o^^^^^^^^^^^^^^^^^^^^^^";
worldmap[2]  = "^^^^o.^..^......^^T^TT^^^TT.T......^^^^^^^^^^^^~^^^^^.TT^......^^T.^.^^^^^^";
worldmap[3]  = "^^^..^..^T..T...TT^TTT.T^T.T.TT..T...^^^^^^^^^.~.^^^^^^...........^...T^^^^";
worldmap[4]  = "^^^^...TTTT.T....^.TTT^T.T^TT..T.......^^.TT..~T~T.^^^^T.T..............^^^";
worldmap[5]  = "^^^^.T..T.T.T.T^^^^^T^^^^^^TT.T.T...........T.~T~^T.^TT^..T.....o.......^^^";
worldmap[6]  = "^^^.T..T.T..T.^^^^^^^o^^^^^^T...T.TT.........T~T~^T^.^.^^..............^^^^";
worldmap[7]  = "^^^T.tT....T.^^^^^--^^^^^^^^^.^^^^..T........~..~^T.T.T^^..T..........^.^^^";
worldmap[8]  = "vvv,,,,T,,T.^^^^^-------o^^^^..^^^^T..T......~..~~.^.T^.^^........T.^.^^^^^";
worldmap[9]  = "vvv,,t,,,,T...^^^^--~^~-^^^^^.T.T^^^^.......~~...~.T.^^.^.........^.^^^^^^^";
worldmap[10] = "vv,,tT,,T,,...^^^^^^^~^^^^^^^^T...T.TT......~....~....T^^..^...^^.^^^^^^^^^";
worldmap[11] = ",,,,t,T,T,,,T.^^^^^^^~^^^^^^^^^.T.TTT......~.....~~..T^^^.^.^^^.^^.^.T^^^^^";
worldmap[12] = "vv,,,,,T,,,T.T...^^^o~~^^^^^....T-T........~......~....T^^^.^^..^^....^^^^^";
worldmap[13] = "vvv,,t,,t,TT.......^.~~.T.^....T.-.........~......~~......T^^..^..^.^^oT^^^";
worldmap[14] = "vvv,t,tt,,,,,.......~T~T.T.....---.......---....^^.~.............^^^^^^^^^^";
worldmap[15] = "^^^,,t,,,t,......~~~TT~TT....------..---------..o^.~~.............T.T^^T^^^";
worldmap[16] = "^^^tt.t,,,,...T~~~TTTT.~.--------------------------.~....T.T.....TTT^.T.^^^";
worldmap[17] = "^^^,,t,,,.....~~TT.....~.-------------TTTT-----------......T.T.....TTT.T^^^";
worldmap[18] = "^^^tttt,,,,...~TT.--..--------------TTTTTTTT----------------TT...o..TT^^^^^";
worldmap[19] = "^^^tt,,,,,....~T.-----------------TTTTTTTTTTTT--------------TTT.....TTT^^^^";
worldmap[20] = "^^,,t,,,,,,..o~.--------------------TTTTTTTTTT----------------TTTTTTTTTT.^^"; 
worldmap[21] = "^^-----,,,,-----------------------------TTTT-------------------.TTTTTT.---^";
worldmap[22] = "-------------------------------------------------------------------..-----^";
worldmap[23] = "---------------------------------------------------------------------------";
worldmap[24] = "---------------------------------------------------------------------------";

function pushToGamestate(gameState, map) {
    let ps = PS["Rogue"];
    let width = worldmap[0].length;
    let height = worldmap.length;
    let tiles = { '.': ps.Ground.create({ frozen: true })
                , ',': ps.Ground.create({ frozen: false })
                , '^': ps.Mountain.create({ frozen: true })
                , 'v': ps.Mountain.create({ frozen: false })
                , 'T': ps.Forest.create({ frozen: true })
                , 't': ps.Forest.create({ frozen: false })
                , '-': ps.Water.create({ frozen: false })
                , '~': new ps.River()
                , 'o': new ps.DungeonEntrance()
                };

    for (let y=0; y<height; y++) {
        for (let x=0; x<width; x++) {
            let char = worldmap[y][x];
            let tile = tiles[char];
            if (tile !== undefined) {
                gameState = ps.setTile(gameState)(tile)({x: x, y: y});
            }
        }
    }
    return gameState;
}