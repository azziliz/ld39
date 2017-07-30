'use strict';

murmures.UiBuilder = function () {
    // #region templates
    this.template = {
        logHeader : '<header> \
<h3 id="h1Txt"></h3> \
<div id="h3Txt"></div> \
</header>', 
        debugDiv : '<div style="position:fixed; bottom:0; left:0; z-index:9999"> \
<div id="debugDiv"></div> \
</div>',
        progressBar : '<div id="tilesetLoadBg" class="tilesetLoad"> \
<div id="tilesetLoadProgress"></div> \
</div>',
        mainWindow : '<div id="mainWindow" class="fullScreen"> \
</div>',
        leftCharacterPanel : '<div id="leftCharacters" class="zUI" style="float:left"> \
</div>',
        rightCharacterPanel : '<div id="rightCharacters" class="zUI" style="float:right"> \
</div>',
        crawlPanel : '<div id="corridor" class="corridor"> \
<div id="crawl" style="position:relative;"> \
<canvas id="tilesLayer" width="1400" height="840" style="z-index: 15"></canvas> \
<canvas id="fogOfWarLayer" width="1400" height="840" style="z-index: 25; opacity:0.5"></canvas> \
<canvas id="trailLayer" width="1400" height="840" style="z-index: 30"></canvas> \
<canvas id="characterLayer" width="1400" height="840" style="z-index: 35"></canvas> \
<canvas id="projectileLayer" width="1400" height="840" style="z-index: 40"></canvas> \
<canvas id="topLayer" width="1400" height="840" style="z-index: 99"></canvas> \
</div> \
</div>',
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
            this.drawLeftCharacterPanel();
            this.drawRightCharacterPanel();
            this.drawCrawlPanel();
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
    },
    
    drawLeftCharacterPanel : function () {
        this.getMainWindows().appendChild(this.createElementFromTemplate(this.template.leftCharacterPanel));
    },
    
    drawRightCharacterPanel : function () {
        this.getMainWindows().appendChild(this.createElementFromTemplate(this.template.rightCharacterPanel));
    },
    
    drawEditorPanel : function () {
        this.getMainWindows().innerHTML = this.template.editorPanel;
    },
    
    drawCrawlPanel : function () {
        this.getMainWindows().appendChild(this.createElementFromTemplate(this.template.crawlPanel));
    },
    
    drawDeathWindow : function () {
        document.body.appendChild(this.createElementFromTemplate(this.template.deathWindow));
    },
    // #endregion
    
    // #region update ui
    clearAllCharacters : function () {
        if (this.hasMainWindows()) {
            document.getElementById('rightCharacters').innerHTML = '';
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
    
    drawSkill : function (hero) {
        let nbSkill = 1;
        const instance = this;
        Object.keys(hero.skills).forEach(function (itSkill) {
            const skill = hero.skills[itSkill];
            const ref = gameEngine.bodies[skill.asset];
            const tilesetRank = ref.rank;
            const tilesetX = tilesetRank % 64;
            const tilesetY = (tilesetRank - tilesetX) / 64;
            const skillWindow = document.getElementById('hero' + hero.guid + '-skill' + nbSkill);
            // hack ! TODO : do something clean (draw only once)
            if (skillWindow.style.backgroundPosition === '') {
                skillWindow.addEventListener("click", function () { instance.activateSkill(hero.guid, skill.name); });
            }
            skillWindow.style.backgroundImage = "url('" + gameEngine.client.renderer.tileset.color.blobUrl + "')";
            skillWindow.style.backgroundPosition = '-' + gameEngine.tileSize * tilesetX + 'px -' + gameEngine.tileSize * tilesetY + 'px';
            if (skillWindow.className.indexOf(' skillIcon') === -1) {
                skillWindow.className += ' skillIcon';
            }
            // TODO : change to css behavior
            if (hero.activeSkill === skill.name) {
                skillWindow.style.borderColor = "#4d4";
            } else {
                skillWindow.style.borderColor = "#666";
            }
            nbSkill++;
        });
    },
    
    activateSkill : function (heroGuid, skillId) {
        gameEngine.heros.forEach(function (hero) {
            if (hero.guid === heroGuid) {
                hero.activeSkill = skillId;
                this.drawSkill(hero);
            }
        }, this);
    },
    
    paintIcons : function (title, layerId) {
        let tileUiTemplate = this.template.tileUiTemplate;
        let templateStr = /template/g;
        document.getElementById('leftCharacters').insertAdjacentHTML('beforeend', '<div class="collapsible">' + title + '</div>');
        document.getElementById('leftCharacters').insertAdjacentHTML('beforeend', '<div class="collapsiblepanel" id="subpanel.' + layerId[0] + '"></div>');
        Object.keys(gameEngine.bodies).forEach(function (groundId) {
            const ref = gameEngine.bodies[groundId];
            if (layerId.indexOf(ref.layerId) >= 0) {
                const tilesetRank = ref.rank;
                const tilesetX = tilesetRank % 64;
                const tilesetY = (tilesetRank - tilesetX) / 64;
                const groundCopy = groundId;
                document.getElementById('subpanel.' + layerId[0]).insertAdjacentHTML('beforeend', tileUiTemplate.replace(templateStr, groundId));
                document.getElementById(groundId + '-icon').style.backgroundImage = "url('" + gameEngine.client.renderer.tileset.color.blobUrl + "')";
                document.getElementById(groundId + '-icon').style.backgroundPosition = '-' + gameEngine.tileSize * tilesetX + 'px -' + gameEngine.tileSize * tilesetY + 'px';
                document.getElementById(groundId + '-icon').addEventListener("mousedown", function (e) {
                    e.preventDefault();
                    if (e.button === 2) {
                        for (let key in gameEngine.bodies) {
                            if (gameEngine.bodies[key].rank === tilesetRank) {
                                const body = gameEngine.bodies[key];
                                document.getElementById('uniqueId').value = key;
                                document.getElementById('layerId').value = body.layerId;
                                document.getElementById('rank').value = body.rank;
                                document.getElementById('hasPhysics').checked = body.hasPhysics;
                                document.getElementById('allowFlying').checked = body.allowFlying;
                                document.getElementById('allowTerrestrial').checked = body.allowTerrestrial;
                                document.getElementById('allowAquatic').checked = body.allowAquatic;
                                document.getElementById('allowUnderground').checked = body.allowUnderground;
                                document.getElementById('allowEthereal').checked = body.allowEthereal;
                                document.getElementById('behavior').value = typeof body.behavior === 'undefined' ? '{}' : JSON.stringify(body.behavior);
                            }
                        }
                    } else {
                        gameEngine.client.editor.selectedBrush.id = groundCopy;
                        gameEngine.client.editor.selectedBrush.layerId = ref.layerId;
                        document.getElementById('selectedBrush' + '-icon').style.backgroundPosition = '-' + gameEngine.tileSize * tilesetX + 'px -' + gameEngine.tileSize * tilesetY + 'px';
                        document.getElementById("leftCharacters").style.display = "none";
                        document.getElementById("rightCharacters").style.display = "none";
                    }
                }, false);
                document.getElementById(groundId + '-icon').addEventListener("contextmenu", function (e) { // mouse right click
                    e.preventDefault();
                }, false);
            }
        });
    },
    // #endregion
    
};
