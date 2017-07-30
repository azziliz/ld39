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
        gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
        gameEngine.client.eventDispatcher.emitEvent('requestCrawlUi');
    }, false);
    window.addEventListener('mainWindowReady', function (e) {
        gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
        gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
        gameEngine.client.uiBuilder.centerCrawlPanel();
    }, false);
    window.addEventListener('moveHero', function (e) {
        const plane = {
            allowFlying: false,
            allowTerrestrial: true,
            allowAquatic: false,
            allowUnderground: false,
            allowEthereal: false,
        };
        const currentPos = gameEngine.heros[0].position;
        const newX = currentPos.x + e.detail.x;
        const newY = currentPos.y + e.detail.y;
        const newTile = gameEngine.level.tiles[newY][newX];
        if (newTile.isPlaneBlocker(plane)) {
            //TODO : kill
        } else {
            const exit = gameEngine.level.getExit();
            if (newX === exit.x && newY === exit.y) {
                gameEngine.activeLevel++;
                gameEngine.level = gameEngine.levels[gameEngine.activeLevel];
                gameEngine.level.moveHeroesToEntrance();
                gameEngine.client.eventDispatcher.emitEvent('requestHighlight');
                gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
                gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
                gameEngine.client.uiBuilder.centerCrawlPanel();
            } else {
                gameEngine.heros[0].move(newX, newY);
                gameEngine.client.eventDispatcher.emitEvent('requestRefreshCrawlUi');
                gameEngine.client.eventDispatcher.emitEvent('requestRenderPartialEngine');
            }
        }
    }, false);
    
    gameEngine.client.eventDispatcher.emitEvent('requestTileset');
};