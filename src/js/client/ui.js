'use strict';

murmures.UiBuilder = function () {
    // #region templates
    this.template = {
        logHeader : '<header><button id="skipTuto" class="skipTutoButton">Skip tutorial</button> \
<h3 id="h1Txt"></h3> \
<div id="h3Txt"></div> \
</header>', 
        debugDiv : '<div style="position:fixed; bottom:0; left:0; z-index:9999"> \
<div id="debugDiv"></div> \
</div>',
        progressBar : '<div id="tilesetLoadBg" class="tilesetLoad"> \
<div id="tilesetLoadProgress"></div> \
</div>',
        mainWindow : '<div id="mainWindow" class="fullScreen"><table><tbody><tr> \
</tr></tbody></table></div>',
        leftCharacterPanel : '<td style="vertical-align: top;"><div id="leftCharacters" class="zUI" style="float:left"> \
</div></td>',
        rightCharacterPanel : '<td style="vertical-align: top;"><div id="rightCharacters" class="zUI" style="float:right"> \
</div></td>',
        crawlPanel : '<td style="vertical-align: top;"><div id="corridor" class="corridor"> \
<div id="crawl" style="position:relative;"> \
<canvas id="tilesLayer" width="1400" height="840" style="z-index: 15"></canvas> \
<canvas id="fogOfWarLayer" width="1400" height="840" style="z-index: 25; opacity:0.5"></canvas> \
<canvas id="trailLayer" width="1400" height="840" style="z-index: 30"></canvas> \
<canvas id="characterLayer" width="1400" height="840" style="z-index: 35"></canvas> \
<canvas id="projectileLayer" width="1400" height="840" style="z-index: 40"></canvas> \
<canvas id="topLayer" width="1400" height="840" style="z-index: 99"></canvas> \
</div> \
</div></td>',
        deathWindow : '<div id="deathWindow" class="deathWindow" style="display:none;"> \
<p style="position:absolute;left:150px;font-size:200%;" id="deathWindowTitle"></p> \
<p style="position:absolute;left:150px;top:200px;font-size:200%;"><a href="#" onclick="gameEngine.client.ws.send(JSON.stringify({ service: \'restart\' }));" id="deathWindowRestartButton"></a></p> \
</div>',
        characterTemplate : '<div id="template-box" class="characterBox bgColorMob" data-order=""> \
<div> \
<div id="template-icon" class="uiIcon"> \
</div> \
<div id="template-charname" class="characterName"> \
<div id="template-name">Chauve-souris</div> \
</div> \
<div id="template-fullLife" class="newLine characterLife"> \
<div id="template-life"></div> \
<div id="template-hptooltip" class="tooltip">?/?</div> \
</div> \
<div id="template-skill1" class="newLine uiIcon"></div> \
<div id="template-skill2" class="uiIcon"></div> \
<div id="template-skill3" class="uiIcon"></div> \
<div id="template-skill4" class="uiIcon"></div> \
<div id="template-skill5" class="uiIcon"></div> \
<div id="template-skill6" class="newLine uiIcon"></div> \
<div id="template-skill7" class="uiIcon"></div> \
<div id="template-skill8" class="uiIcon"></div> \
<div id="template-skill9" class="uiIcon"></div> \
<div id="template-skill10" class="uiIcon"></div> \
</div> \
</div>',
        tileUiTemplate : '<div id="template-tileContainer" style="float:left"> \
<div id="template-icon" class="uiIcon"> \
</div> \
</div>',

    };
    // #endregion

    this.crawlUiMobCount = 0;
    this.timelineComponent = {};
}

murmures.UiBuilder.prototype = {
    init : function () {
        const instance = this;
        window.addEventListener('requestTileset', function () {
            instance.drawProgressBar();
        }, false);
        window.addEventListener('requestDevTools', function () {
            instance.drawFullLogHeader();
        }, false);
        window.addEventListener('tilesetLoadProgress', function (e) {
            instance.updateProgressBar(e.detail);
        }, false);
        window.addEventListener('grayscaleTilesetReady', function () {
            instance.hideProgressBar();
        }, false);
        window.addEventListener('requestCrawlUi', function () {
            instance.drawCrawlUi();
        }, false);
        window.addEventListener('requestTimeline', function () {
            instance.timelineComponent = new murmures.UiTimelineComponent();
            instance.timelineComponent.init(instance);
        }, false);
        window.addEventListener('requestEditorUi', function () {
            instance.drawEditorUi();
        }, false);
        window.addEventListener('requestRefreshCrawlUi', function () {
            instance.clearAllCharacters();
            instance.updateUI();
        }, false);
    },
    
    createElementFromTemplate : function (txt) {
        let div = document.createElement('div');
        div.innerHTML = txt;
        return div.firstChild;
    },
    
    // #region logs
    getLog : function () {
        return document.getElementById('screenLog');
    },
    
    hasLog : function () {
        return this.getLog() !== null;
    },
    
    drawFullLogHeader : function () {
        document.body.appendChild(this.createElementFromTemplate(this.template.logHeader));

        document.getElementById('skipTuto').addEventListener('mouseup', function (e) {
            e.preventDefault();
            const exit = gameEngine.level.getExit();
            gameEngine.heros[0].move(exit.x, exit.y);
            gameEngine.activeLevel = 8;
            gameEngine.heros[0].powerCharge = 11;
            gameEngine.client.eventDispatcher.emitEvent('moveHero', { x: 0, y: 0 });
        }, false);

        document.body.appendChild(this.createElementFromTemplate(this.template.debugDiv));
        window.addEventListener('tileEnter', function (e) {
            let hoveredTile = e.detail;
            document.getElementById('debugDiv').innerHTML = '[ ' + hoveredTile.x + ' , ' + hoveredTile.y + ' ]';
        }, false);
    },
    
    log : function (txt, channel) {
        if (this.hasLog()) {
            const now = new Date();
            this.getLog().insertAdjacentHTML('afterbegin',
            '<span class="channel-debug"><span style="color:#ffa">' + now.toLocaleTimeString() + '.' + ('00' + now.getMilliseconds().toString()).substr(-3) + '</span> ' + txt + '<br></span>');
        }
    },
    // #endregion
    
    // #region progress bar
    getProgressBar : function () {
        return document.getElementById('tilesetLoadBg');
    },
    
    hasProgressBar : function () {
        return this.getProgressBar() !== null;
    },
    
    drawProgressBar : function () {
        if (!this.hasProgressBar()) {
            document.body.appendChild(this.createElementFromTemplate(this.template.progressBar));
        }
    },
    
    updateProgressBar : function (percentComplete) {
        if (this.hasProgressBar()) {
            document.getElementById('tilesetLoadProgress').style.width = percentComplete + '%';
        }
    },
    
    hideProgressBar : function () {
        if (this.hasProgressBar()) {
            this.getProgressBar().style.display = 'none';
        }
    },
    // #endregion
    
    // #region dev tools
    loadDevTools : function (ge) {
        if (document.getElementById('levelSelect') !== null) {
            document.getElementById('levelSelect').innerHTML = '';
            ge.levelIds.forEach(function (levelId) {
                let opt = document.createElement("option");
                opt.value = levelId;
                opt.text = levelId.replace('.json', '');
                document.getElementById('levelSelect').add(opt);
            }, this);
        }
    },
    // #endregion
    
    // #region draw main UI elements
    centerCrawlPanel : function () {
        //const heroesAvgX = gameEngine.level.width / 2;
        //const heroesAvgY = gameEngine.level.height / 2;
        //const allStyles = window.getComputedStyle(document.getElementById('corridor'));
        //const midWidth = parseInt(allStyles.width, 10) / 2;
        //const hero0w = gameEngine.tileSize * (heroesAvgX + 0.5);
        //document.getElementById('crawl').style.left = (midWidth - hero0w).toString() + 'px';
        //const midHeight = parseInt(allStyles.height, 10) / 2;
        //const hero0h = gameEngine.tileSize * (heroesAvgY + 0.5);
        //document.getElementById('crawl').style.top = (midHeight - hero0h).toString() + 'px';
    },
    
    getMainWindows : function () {
        return document.getElementById('mainWindow');
    },
    
    hasMainWindows : function () {
        return this.getMainWindows() !== null;
    },
    
    drawCrawlUi : function () {
        if (!this.hasMainWindows()) {
            this.drawDeathWindow();
            this.drawMainWindow();
            //this.drawLeftCharacterPanel();
            //this.drawCrawlPanel();
            //this.drawRightCharacterPanel();
            window.addEventListener('resize', this.centerCrawlPanel);
        }
        gameEngine.client.eventDispatcher.emitEvent('mainWindowReady');
    },
    
    drawEditorUi : function () {
        if (!this.hasMainWindows()) {
            this.drawMainWindow();
            this.drawEditorPanel();
            this.drawCrawlPanel();
            this.fillLeftPanelLevelEditor();
        }
        gameEngine.client.eventDispatcher.emitEvent('mainWindowReady');
    },
    
    drawMainWindow : function () {
        document.body.appendChild(this.createElementFromTemplate(this.template.mainWindow));
        this.getMainWindows().firstChild.firstChild.firstChild.innerHTML = this.template.leftCharacterPanel + this.template.crawlPanel + this.template.rightCharacterPanel;
    },
    
    drawLeftCharacterPanel : function () {
        this.getMainWindows().firstChild.firstChild.firstChild.appendChild(this.createElementFromTemplate(this.template.leftCharacterPanel));
    },
    
    drawRightCharacterPanel : function () {
        this.getMainWindows().firstChild.firstChild.firstChild.appendChild(this.createElementFromTemplate(this.template.rightCharacterPanel));
    },
    
    drawEditorPanel : function () {
        this.getMainWindows().innerHTML = this.template.editorPanel;
    },
    
    drawCrawlPanel : function () {
        this.getMainWindows().firstChild.firstChild.firstChild.appendChild(this.createElementFromTemplate(this.template.crawlPanel));
    },
    
    drawDeathWindow : function () {
        document.body.appendChild(this.createElementFromTemplate(this.template.deathWindow));
    },
    // #endregion
    
    // #region update ui
    clearAllCharacters : function () {
        if (this.hasMainWindows()) {
            this.crawlUiMobCount = 0;
        }
    },
    
    updateUI : function () {
        if (gameEngine.state === murmures.C.STATE_ENGINE_DEATH) {
            document.getElementById('deathWindowTitle').innerHTML = gameEngine.locale.en.ui['death_window_title'];
            document.getElementById('deathWindowRestartButton').innerHTML = gameEngine.locale.en.ui['death_window_restart'];
            document.getElementById('deathWindow').style.display = "block";
        } else {
            document.getElementById('deathWindow').style.display = "none";
        }
        
        document.getElementById('h1Txt').innerHTML = gameEngine.level.h1;
        document.getElementById('h3Txt').innerHTML = gameEngine.level.h2;
        if (gameEngine.activeLevel > 8) {
            document.getElementById('skipTuto').style.display = "none";
        }
        
        document.getElementById('leftCharacters').innerHTML = '';
        if (gameEngine.level.hasHP) {
            const tilesetRank = 8553;
            const tilesetX = tilesetRank % 64;
            const tilesetY = (tilesetRank - tilesetX) / 64;
            for (let i = 0; i < gameEngine.heros[0].hitPoints; i++) {
                document.getElementById('leftCharacters').insertAdjacentHTML('beforeend', '<div id="heart' + i + '" class="uiIcon"></div>');
                document.getElementById('heart' + i).style.backgroundImage = "url('" + gameEngine.client.renderer.tileset.color.blobUrl + "')";
                document.getElementById('heart' + i).style.backgroundPosition = '-' + gameEngine.tileSize * tilesetX + 'px -' + gameEngine.tileSize * tilesetY + 'px';
            }
        }
        
        document.getElementById('rightCharacters').innerHTML = '';
        if (true) {
            const tilesetRank = 8203;
            const tilesetX = tilesetRank % 64;
            const tilesetY = (tilesetRank - tilesetX) / 64;
            for (let i = 0; i < gameEngine.heros[0].powerCharge; i++) {
                if (i === 10) {
                    document.getElementById('rightCharacters').insertAdjacentHTML('beforeend', '<div id="crystal' + i + '" class="txtYellow">+ ' + (gameEngine.heros[0].powerCharge - 10) + '</div>');
                    break;
                } else {
                    document.getElementById('rightCharacters').insertAdjacentHTML('beforeend', '<div id="crystal' + i + '" class="uiIcon crystalIcon"></div>');
                    document.getElementById('crystal' + i).style.backgroundImage = "url('" + gameEngine.client.renderer.tileset.color.blobUrl + "')";
                    document.getElementById('crystal' + i).style.backgroundPosition = '-' + gameEngine.tileSize * tilesetX + 'px -' + gameEngine.tileSize * tilesetY + 'px';
                }                
            }
        }
        
        
        //for (let i = 0; i < gameEngine.heros.length; i++) {
        //    let winHero = document.getElementById('hero' + gameEngine.heros[i].guid + '-box');
        //    if (typeof winHero === 'undefined' || winHero === null) {
        //        let characterUiTemplate = this.template.characterTemplate;
        //        let templateStr = /template/g;
        //        document.getElementById('leftCharacters').insertAdjacentHTML('beforeend', characterUiTemplate.replace(templateStr, ('hero' + gameEngine.heros[i].guid)).replace('bgColorMob', 'bgColorHero'));
        //        document.getElementById('hero' + gameEngine.heros[i].guid + '-box').addEventListener('mouseenter', function (e) {
        //            //herobox_onMouseEnter(e);
        //        }, false);
        //        document.getElementById('hero' + gameEngine.heros[i].guid + '-box').addEventListener('mouseleave', function (e) {
        //            //herobox_onMouseLeave(e);
        //        }, false);
        //        document.getElementById('hero' + gameEngine.heros[i].guid + '-fullLife').addEventListener('mousemove', function (e) {
        //            document.getElementById('hero' + gameEngine.heros[i].guid + '-hptooltip').innerHTML = gameEngine.heros[i].hitPoints + '/' + gameEngine.heros[i].hitPointsMax;
        //        }, false);
        //    }
        //    const winChar = document.getElementById('hero' + gameEngine.heros[i].guid + '-charname');
        //    let color = "#222";
        //    if (gameEngine.heros[i].guid === gameEngine.getCurrentHero().guid) color = "#080";
        //    winChar.style.borderColor = color;
        
        //    const ref = gameEngine.bodies[gameEngine.heros[i].mobTemplate];
        //    const locale = gameEngine.locale.fr.assets[gameEngine.heros[i].mobTemplate];
        //    const tilesetRank = ref.rank;
        //    const tilesetX = tilesetRank % 64;
        //    const tilesetY = (tilesetRank - tilesetX) / 64;
        //    document.getElementById('hero' + gameEngine.heros[i].guid + '-icon').style.backgroundImage = "url('" + gameEngine.client.renderer.tileset.color.blobUrl + "')";
        //    document.getElementById('hero' + gameEngine.heros[i].guid + '-icon').style.backgroundPosition = '-' + gameEngine.tileSize * tilesetX + 'px -' + gameEngine.tileSize * tilesetY + 'px';
        //    const namediv = document.getElementById('hero' + gameEngine.heros[i].guid + '-name');
        //    const namedivwidth = window.getComputedStyle(namediv, null).width;
        //    namediv.innerHTML = locale || 'Name Error';
        //    let namefontsize = 100;
        //    while (window.getComputedStyle(namediv, null).width !== namedivwidth) {
        //        namefontsize--;
        //        namediv.style.fontSize = namefontsize.toString() + '%';
        //    }
        //    const missingLife = parseFloat(gameEngine.heros[i].hitPoints) / parseFloat(gameEngine.heros[i].hitPointsMax) * 100.0;
        //    document.getElementById('hero' + gameEngine.heros[i].guid + '-life').style.width = Math.round(missingLife).toString() + '%';
        //    this.drawSkill(gameEngine.heros[i]);
        //}
        this.centerCrawlPanel();
    },
    
    updateEditor : function () {
    },
    
    // #endregion
    
};
