'use strict';

gameEngine.client = {
    renderer : new murmures.Renderer(),
    eventDispatcher : new murmures.EventDispatcher(),
    uiBuilder : new murmures.UiBuilder(),
    animationScheduler : new murmures.AnimationScheduler(),
    inputHandler : new murmures.InputHandler(),
};

murmures.staticLevels = {};

murmures.initGameEngine = function () {
    gameEngine.bodies = murmures.bodies;
    gameEngine.locale = {};
    gameEngine.locale.en = murmures.localeEn;

    gameEngine.levels = [];
    gameEngine.activeLevel = 0;
    let loopCounter = 0;
    for (let levelName in murmures.staticLevels) {
        const level1 = new murmures.Level();
        level1.build(murmures.staticLevels[levelName]);
        level1.id = levelName;
        gameEngine.levels.push(level1);
        loopCounter++;
    }
    gameEngine.level = gameEngine.levels[gameEngine.activeLevel];
    
    gameEngine.heros = [];
    const allHeroesKeys = [];
    Object.keys(gameEngine.bodies).forEach(function (assetId) {
        const ref = gameEngine.bodies[assetId];
        if (murmures.C.LAYERS[ref.layerId][0] === 'Hero') allHeroesKeys.push(assetId);
    });
    
    const chosenHeroesKeys = [];
    let chosenHero;
    for (loopCounter = 0; loopCounter < 1; loopCounter++) {
        do {
            const rand = Math.floor(Math.random() * allHeroesKeys.length);
            chosenHero = allHeroesKeys[rand];
        } while (chosenHeroesKeys.indexOf(chosenHero) >= 0); // This loop prevents duplicate heroes
        chosenHeroesKeys.push(chosenHero);
        let hero1 = new murmures.Character();
        hero1.build(gameEngine.level.getEntrance(), chosenHero, 2);
        if (loopCounter === 0) {
            hero1.setVision();
        }
        gameEngine.heros.push(hero1);
            }
    
    gameEngine.state = murmures.C.STATE_ENGINE_INIT;
};

var MazeCells = [];
var SortedCells = [];
var Walls = [];

var MazeCell = function () {
    this.x = 0;
    this.y = 0;
    this.xPlus = null;
    this.yPlus = null;
    this.group = 0;
};

var GenerateMaze = function (xMax, yMax) {
    MazeCells = [];
    SortedCells = [];
    Walls = [];
    let cellGroup = 0;
    for (let xVar = 0; xVar < xMax; xVar++) {
        for (let yVar = 0; yVar < yMax; yVar++) {
            const cell = new MazeCell();
            cell.x = xVar;
            cell.y = yVar;
            cell.group = cellGroup++;
            MazeCells.push(cell);
            SortedCells.push({ key: Math.random(), cell: cell });
        }
    }
    MazeCells.forEach(function (cell) {
        const xPlus = MazeCells.filter(function (p) {
            return (p.x === cell.x + 1 && p.y === cell.y)
        });
        if (xPlus.length > 0) {
            cell.xPlus = xPlus[0];
            Walls.push({ key: Math.random(), cell: cell, neighbor: xPlus[0], dir : 1 });
        }
        const yPlus = MazeCells.filter(function (p) {
            return (p.x === cell.x && p.y === cell.y + 1)
        });
        if (yPlus.length > 0) {
            cell.yPlus = yPlus[0];
            Walls.push({ key: Math.random(), cell: cell, neighbor: yPlus[0], dir : 2 });
        }
    });
    SortedCells.sort(function (a, b) {
        return a.key - b.key;
    });
    Walls.sort(function (a, b) {
        return a.key - b.key;
    });
    Walls.forEach(function (wall) {
        const currentcell = wall.cell;
        const neighbor = wall.neighbor;
        const newGroup = currentcell.group;
        const oldGroup = neighbor.group;
        if (oldGroup !== newGroup) {
            MazeCells.forEach(function (neighborGroupElement) {
                if (neighborGroupElement.group === oldGroup) neighborGroupElement.group = newGroup;
            });
            if (wall.dir === 1) {
                currentcell.xPlus = null;
            }
            if (wall.dir === 2) {
                currentcell.yPlus = null;
            }
        }
    });
    let wallId = '';
    while (true) {
        let result;
        let count = 0;
        for (var prop in gameEngine.bodies) {
            if (Math.random() < 1 / ++count) {
                result = prop;
            }
            if (count > 1500) break;
        }
        if (gameEngine.bodies[result].layerId === '06' 
            && gameEngine.bodies[result].hasPhysics === true 
            && gameEngine.bodies[result].allowFlying === undefined) {
            wallId = result;
            break;
        };
    }
    const floors = ['_b1_01_corridor_light.conv',
        '_b1_01_black_cobalt12',
        '_b1_01_bog_green0',
        '_b1_01_cobble_blood1',
        '_b1_01_corridor.rl1',
        '_b1_01_crystal_floor0',
        '_b1_01_dirt0',
        '_b1_01_floor11',
        '_b1_01_floor12',
        '_b1_01_floor13',
        '_b1_01_floor22',
        '_b1_01_floor33',
        '_b1_01_floor_light.conv',
        '_b1_01_floor_sand_rock0',
        '_b1_01_gervais_2945',
        '_b1_01_gervais_3016',
        '_b1_01_gervais_3018',
        '_b1_01_gervais_3022',
        '_b1_01_gervais_3122',
        '_b1_01_gervais_3139',
        '_b1_01_grass0-dirt-mix1',
        '_b1_01_grass0',
        '_b1_01_hive0',
        '_b1_01_lair3b',
        '_b1_01_limestone0',
        '_b1_01_lit_corridor.rl1',
        '_b1_01_mesh0',
        '_b1_01_sand1',
        '_b1_01_sandstone_floor0',
        '_b1_01_white_marble0'
    ];
    let floorId = floors[Math.floor(Math.random() * floors.length)];;
    const ret = new murmures.Level();
    ret.guid = murmures.Utils.newGuid();
    ret.id = 'ld39.10';
    ret.h1 = 'Level ' + (gameEngine.activeLevel + 1);
    ret.h2 = 'Keep going, as far as possible';
    ret.hasHP = true;
    ret.power = 4;
    ret.layout = 'square';
    ret.width = 2 * xMax + 1;
    ret.height = 2 * yMax + 1;
    ret.tiles = [];
    for (let y = 0; y < ret.height; y++) {
        ret.tiles[y] = [];
        for (let x = 0; x < ret.width; x++) {
            ret.tiles[y][x] = new murmures.Tile(x, y);
            if (x % 2 === 0 && y % 2 === 0) {
                ret.tiles[y][x].build({ "groundId": wallId });
            } else if (x === 0 || y === 0 || x === ret.width - 1 || y === ret.height - 1) {
                ret.tiles[y][x].build({ "groundId": wallId });
            } else {
                ret.tiles[y][x].build({ "groundId": floorId });
            }
        }
    }
    MazeCells.forEach(function (currentcell) {
        if (currentcell.xPlus != null) {
            ret.tiles[currentcell.y * 2 + 1][currentcell.x * 2 + 2].groundId = wallId;
        }
        if (currentcell.yPlus != null) {
            ret.tiles[currentcell.y * 2 + 2][currentcell.x * 2 + 1].groundId = wallId;
        }
    });
    
    const stdPlane = {
        allowFlying: true,
        allowTerrestrial: false,
        allowAquatic: false,
        allowUnderground: false,
        allowEthereal: false,
    };
    
    
    let maxLoops1 = 30;
    do {
        const rng1 = Math.floor(Math.random() * (cellGroup - 1));
        const rng2 = Math.floor(Math.random() * (cellGroup - 1));
        if (rng2 === rng1) continue;
        const pfg = new murmures.Pathfinding();
        pfg.compute(
            ret.tiles[SortedCells[rng1].cell.y * 2 + 1][SortedCells[rng1].cell.x * 2 + 1], 
            ret.tiles[SortedCells[rng2].cell.y * 2 + 1][SortedCells[rng2].cell.x * 2 + 1], 
            stdPlane, ret);
        if (pfg.path.length >= 2 * (xMax + yMax - 2)) {
            ret.tiles[SortedCells[rng1].cell.y * 2 + 1][SortedCells[rng1].cell.x * 2 + 1].build({ "groundId": floorId, "propId": '_b1_11_rock_stairs_up' });
            ret.tiles[SortedCells[rng2].cell.y * 2 + 1][SortedCells[rng2].cell.x * 2 + 1].build({ "groundId": wallId }); // teporarily build a wall on rng2 because we don't want powerups AFTER the exit
            let rng3 = rng1;
            if (gameEngine.activeLevel % 3 === 0 || gameEngine.activeLevel > 20) {
                let maxLoops2 = 30;
                do {
                    rng3 = Math.floor(Math.random() * (cellGroup - 1));
                    let powerupIsInPath = false;
                    pfg.path.forEach(function (tile) {
                        if (tile.x === SortedCells[rng3].cell.x * 2 + 1 && tile.y === SortedCells[rng3].cell.y * 2 + 1) {
                            powerupIsInPath = true;
                        }
                    });
                    if (powerupIsInPath) continue;
                    const pfg2 = new murmures.Pathfinding();
                    pfg2.compute(
                        ret.tiles[SortedCells[rng1].cell.y * 2 + 1][SortedCells[rng1].cell.x * 2 + 1], 
                        ret.tiles[SortedCells[rng3].cell.y * 2 + 1][SortedCells[rng3].cell.x * 2 + 1], 
                        stdPlane, ret);
                    if (pfg2.path.length > 5) {
                        const pups = ['_b1_25_blue.rl1',
                            '_b1_25_gervais_0680',
                            '_b1_25_gervais_0910',
                            '_b1_25_gervais_0911',
                            '_b1_25_gervais_0912',
                            '_b1_25_gervais_0913',
                            '_b1_25_green.rl1',
                            '_b1_25_red.conv',
                            '_b1_25_violet.conv',
                            '_b1_25_yellow.conv'
                        ];
                        const pupId = pups[Math.floor(Math.random() * pups.length)];;
                        ret.tiles[SortedCells[rng3].cell.y * 2 + 1][SortedCells[rng3].cell.x * 2 + 1].build({ "groundId": floorId, "itemId": pupId });
                        break;
                    }
                } while (maxLoops2-- > 0);          
            }
            ret.tiles[SortedCells[rng2].cell.y * 2 + 1][SortedCells[rng2].cell.x * 2 + 1].build({ "groundId": floorId, "propId": '_b1_11_rock_stairs_down' });
            let maxLoops3 = xMax + 1 + Math.floor(gameEngine.activeLevel / 6);
            do {
                const rng4 = Math.floor(Math.random() * (cellGroup - 1));
                if (rng4 === rng3) continue;
                let trapIsInPath = false;
                pfg.path.forEach(function (tile) {
                    if (tile.x === SortedCells[rng4].cell.x * 2 + 1 && tile.y === SortedCells[rng4].cell.y * 2 + 1) {
                        trapIsInPath = true;
                    }
                });
                if (trapIsInPath) continue;
                const traps = ['_b1_03_bear_trap.rl1',
                    '_b1_03_spear',
                    '_b1_03_dngn_trap_axe',
                    '_b1_03_bolt',
                    '_b1_03_fire_trap.rl1',
                    '_b1_04_zot'
                ];
                const trapId = traps[Math.floor(Math.random() * traps.length)];;

                ret.tiles[SortedCells[rng4].cell.y * 2 + 1][SortedCells[rng4].cell.x * 2 + 1].build({ "groundId": floorId, "propId": trapId });
            } while (maxLoops3-- > 0);
            break;
        }
    } while (maxLoops1-- > 0);
    
    return ret;
};