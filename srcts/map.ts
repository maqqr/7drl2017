let worldmap: Array<string> = [];
worldmap[0]  = "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^";
worldmap[1]  = "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^~^^^^o^^^^^^^^^^^^^^^^^^^^^^";
worldmap[2]  = "^^^^o.^..^......^^T^TT^^^TT.T......^^^^^^^^^^^^~^^^^^.TT^......^^T.^.^^^^^^";
worldmap[3]  = "^^^..^..^T..T...TT^TTT.T^T.T.TT..T...^^^^^^^^^.~.^^^^^^...........^...T^^^^";
worldmap[4]  = "^^^^...TTTT.T....^.TTT^T.T^TT..T.......^^.TT..~T~T.^^^^T.T..............^^^";
worldmap[5]  = "^^^^.T..T.T.T.T^^^^^T^^^^^^TT.T.T...........T.~T~^T.^TT^..T.....o.......^^^";
worldmap[6]  = "^^^.T..T.T..T.^^^^^^^o^^^^^^T...T.TT.........T~T~^T^.^.^^..............^^^^";
worldmap[7]  = "^^^T.TT....T.^^^^^--^^^^^^^^^.^^^^..T........~..~^T.T.T^^..T..........^.^^^";
worldmap[8]  = "^^^....T..T.^^^^^-------o^^^^..^^^^T..T......~..~~.^.T^.^^........T.^.^^^^^";
worldmap[9]  = "^^^..T....T...^^^^--~^~-^^^^^.T.T^^^^.......~~...~.T.^^.^.........^.^^^^^^^";
worldmap[10] = "^^..TT..T.....^^^^^^^~^^^^^^^^T...T.TT......~....~....T^^..^...^^.^^^^^^^^^";
worldmap[11] = "....T.T.T...T.^^^^^^^~^^^^^^^^^.T.TTT......~.....~~..T^^^.^.^^^.^^.^.T^^^^^";
worldmap[12] = "^^.....T...T.T...^^^o~~^^^^^....T-T........~......~....T^^^.^^..^^....^^^^^";
worldmap[13] = "^^^..T..T.TT.......^.~~.T.^....T.-.........~......~~......T^^..^..^.^^oT^^^";
worldmap[14] = "^^^.T.TT............~T~T.T.....---.......---....^^.~.............^^^^^^^^^^";
worldmap[15] = "^^^..T...T.......~~~TT~TT....------..---------..o^.~~.............T.T^^T^^^";
worldmap[16] = "^^^TT.T.......T~~~TTTTT~.--------------------------.~....T.T.....TTT^.T.^^^";
worldmap[17] = "^^^..T........~~TTTTTT.~.-------------TTTT-----------......T.T.....TTT.T^^^";
worldmap[18] = "^^^TTTT.......~TTT--TT--------------TTTTTTTT----------------TT...o..TT^^^^^";
worldmap[19] = "^^^TT.........~T.-----------------TTTTTTTTTTTT--------------TTT.....TTT^^^^";
worldmap[20] = "^^..T........o~T--------------------TTTTTTTTTT----------------TTTTTTTTTT.^^"; 
worldmap[21] = "^^-----....-----------------------------TTTT-------------------.TTTTTT.---^";
worldmap[22] = "-------------------------------------------------------------------..-----^";
worldmap[23] = "---------------------------------------------------------------------------";

function pushToGamestate(gameState, map) {
    let ps = PS["Rogue"];
    let width = worldmap[0].length;
    let height = worldmap.length;
    let tiles = { '.': ps.Ground.create({ frozen: false })
                , '^': ps.Mountain.create({ frozen: false })
                , 'T': ps.Forest.create({ frozen: false })
                , '-': ps.Water.create({ frozen: false })
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