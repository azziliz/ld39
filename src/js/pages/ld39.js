'use strict';

window.onload = function () {
    gameEngine.client.uiBuilder.init();
    gameEngine.client.eventDispatcher.emitEvent('requestDevTools');
    gameEngine.client.eventDispatcher.init();
    gameEngine.client.renderer.init();
    gameEngine.client.animationScheduler.init();
    gameEngine.client.inputHandler.init();
    
    window.addEventListener('tilesetReady', function (e) {
        murmures.initGameEngine();
        gameEngine.client.eventDispatcher.emitEvent('requestCrawlUi');
    }, false);
    window.addEventListener('mainWindowReady', function (e) {
        gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
        gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
        gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
        gameEngine.client.uiBuilder.centerCrawlPanel();
    }, false);
    window.addEventListener('moveHero', function (e) {
        const stdPlane = {
            allowFlying: true,
            allowTerrestrial: false,
            allowAquatic: false,
            allowUnderground: false,
            allowEthereal: false,
        };
        const currentPos = gameEngine.heros[0].position;
        const newX = currentPos.x + e.detail.x;
        const newY = currentPos.y + e.detail.y;
        const newTile = gameEngine.level.tiles[newY][newX];
        if (newTile.isPlaneBlocker(stdPlane, false)) {
            //wall, do nothing
        } else {
            const dangerPlane = {
                allowFlying: false,
                allowTerrestrial: true,
                allowAquatic: false,
                allowUnderground: false,
                allowEthereal: false,
            };
            if (newTile.isPlaneBlocker(dangerPlane, false)) {
                // hero is hurt. Is it a trap or lava?
                if (newTile.isPlaneBlocker(dangerPlane, true)) {
                    // lava. Kill?
                    gameEngine.heros[0].hitPoints--;
                } else {
                    // trap HP - 1
                    gameEngine.heros[0].hitPoints--;
                }
            }
            //TODO : death
            const exit = gameEngine.level.getExit();
            if (newX === exit.x && newY === exit.y) {
                gameEngine.activeLevel++;
                if (gameEngine.activeLevel >= 9) {
                    gameEngine.level = GenerateMaze(Math.floor(gameEngine.activeLevel / 3), 2 + Math.floor(gameEngine.activeLevel / 7));
                } else {
                    gameEngine.level = gameEngine.levels[gameEngine.activeLevel];
                }
                gameEngine.level.moveHeroesToEntrance();
                if (gameEngine.level.power >= 4) {
                    gameEngine.flash = true;
                    window.clearTimeout(gameEngine.flashTimeoutId);
                    gameEngine.flashTimeoutId = window.setTimeout(function () {
                        gameEngine.flash = false;
                        gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
                    }, 3000);
                }
                gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
                gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
                gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
                gameEngine.client.uiBuilder.centerCrawlPanel();
            } else {
                gameEngine.heros[0].move(newX, newY);
                if (gameEngine.heros[0].position.itemId === '_b1_25_gervais_0921') { // lamp
                    gameEngine.level.power = 0; // full highlight
                    gameEngine.heros[0].position.itemId = ''; // remove lamp
                    gameEngine.heros[0].powerCharge = 5;
                    gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
                    gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
                    gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
                } else if (gameEngine.heros[0].position.itemId !== '') { // crystal
                    gameEngine.heros[0].position.itemId = ''; // remove crystal
                    gameEngine.heros[0].powerCharge += 1;
                    gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
                    gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
                    gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
                } else {
                    gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
                    gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
                }
            }
        }
    }, false);
    
    gameEngine.client.eventDispatcher.emitEvent('requestTileset');
};