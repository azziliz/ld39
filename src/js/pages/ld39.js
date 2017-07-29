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
        //document.getElementById('leftCharacters').innerHTML = 
        //'<div>Pathfinding plane<br><br><br><div style="display: table;"> <p><label>allowFlying</label><input type="checkbox" id="allowFlying"></p> <p><label>allowTerrestrial</label><input type="checkbox" checked="checked" id="allowTerrestrial"></p> <p><label>allowAquatic</label><input type="checkbox" id="allowAquatic"></p> <p><label>allowUnderground</label><input type="checkbox" id="allowUnderground"></p> <p><label>allowEthereal</label><input type="checkbox" id="allowEthereal"></p> </div></div>';
        //document.getElementById('allowFlying').addEventListener('change', function () { gameEngine.client.eventDispatcher.emitEvent('planechange'); });
        //document.getElementById('allowTerrestrial').addEventListener('change', function () { gameEngine.client.eventDispatcher.emitEvent('planechange'); });
        //document.getElementById('allowAquatic').addEventListener('change', function () { gameEngine.client.eventDispatcher.emitEvent('planechange'); });
        //document.getElementById('allowUnderground').addEventListener('change', function () { gameEngine.client.eventDispatcher.emitEvent('planechange'); });
        //document.getElementById('allowEthereal').addEventListener('change', function () { gameEngine.client.eventDispatcher.emitEvent('planechange'); });
        gameEngine.client.eventDispatcher.emitEvent('requestRenderFullEngine');
        gameEngine.client.uiBuilder.centerCrawlPanel();
    }, false);
    window.addEventListener('moveHero', function (e) {
        const currentPos = gameEngine.heros[0].position;
        const newX = currentPos.x + e.detail.x;
        const newY = currentPos.y + e.detail.y;
        gameEngine.heros[0].move(newX, newY);
        gameEngine.client.eventDispatcher.emitEvent('requestRenderPartialEngine');
    }, false);
    
    gameEngine.client.eventDispatcher.emitEvent('requestTileset');
};