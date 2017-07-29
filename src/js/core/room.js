'use strict';

murmures.Room = function () {
    /** @type {string} */
    this.guid = '';
    /** @type {string} */
    this.id = '';
    
    /** @type {number} */
    this.width = 0;
    /** @type {number} */
    this.height = 0;
    /** @type {Array.<Array.<murmures.Tile>>} */
    this.tiles = [];
    /** @type {Array.<murmures.Character>} */
    this.x = 0;
    this.y = 0;
    this.type=0; // 1 : startpoint, 2: endpoint

};

murmures.Room.prototype = {
    build : function(){
        for(let i=0;i<this.height;i++){
            for(let j=0;j<this.height;j++){
                let t = new murmures.Tile();
                t.x = this.x + i;
                t.y = this.y + j;
                t.groundId = "_b1_01_floor_of_a_room.rl1";
                if(this.type == 1 && i==0 & j==0) t.propId = "_b1_11_dngn_rock_stairs_up.conv";
                if(this.type == 2 && i==(this.height-1) && (j==(this.height-1))) t.propId = "_b1_11_dngn_rock_stairs_down.conv";
                t.state = murmures.C.TILE_HIGHLIGHTED;
                this.tiles.push(t);
            }
        }
    },

    buildWall:function(){
        for(let i=-1;i<=this.height;i++){
            for(let j=-1;j<=this.height;j++){
                var foundTiles = false;
                for(let itTiles=0;itTiles<this.tiles.length;itTiles++){
                    if(this.tiles[itTiles].x == (this.x+i) && this.tiles[itTiles].y == (this.y+j)){
                        foundTiles = true;
                        break;
                    }                 
                }
                if (foundTiles == false){
                    let t = new murmures.Tile();
                    t.x = this.x + i;
                    t.y = this.y + j; 
                    t.charId = this.id;                      
                    t.groundId = "_b1_06_dngn_stone_wall.rl1.rl1";
                    t.state = murmures.C.TILE_HIGHLIGHTED;
                    this.tiles.push(t);
                 }
            }
        }
    }
};