declare var $, Vue, map_json, on_map_json;

/// <reference types="./ground_base"; />

/// <reference types="./IMAGE_BASE"; />
/// <reference types="./_object_base"; />
/// <reference types="./_npc_base"; />
var item_base, players, pets;
declare var object_base, ground_base, npc_base, IMAGE_BASE, BODY_PARTS, NO_HEAD_HELMETS, GENDER, GENDER_HEADS;

var BASE_TYPE = {
    OBJECT: "1",
    1: object_base,
    GROUND: "2",
    2: ground_base,
    ITEM: "3",
    3: item_base,
    NPC: "4",
    4: npc_base,
    PLAYER: "5",
    5: players,
    PET: "6",
    6: pets
}, OBJECT_TYPE = {
    DUMMY: 0,
    TREE: 1,
    STONE: 2,
    ENEMY: 3,
    SHOP: 4,
    FISH: 5,
    COOKING: 6,
    FARMING: 7
};

console.log(IMAGE_BASE);
for (var key in IMAGE_BASE) {
    //THIS SHOULD INITIALIZE GUILDS
    if (typeof IMAGE_BASE[key].sprite != "undefined") {
        for (var building in IMAGE_BASE[key].sprite.imgs) {
            IMAGE_BASE[key].sprite.imgs[building].img = new Image()
            IMAGE_BASE[key].sprite.imgs[building].img.src = IMAGE_BASE[key].sprite.spriteSheetLocation;

        }
    }
    if (typeof key == 'undefined' || typeof (IMAGE_BASE[key]) == "string" || typeof IMAGE_BASE[key].url == 'undefined') {
        continue;
    }
    IMAGE_BASE[key].img = new Image();
    IMAGE_BASE[key].img.src = IMAGE_BASE[key].url;
}
var map;
window.onload = () => {
    map = new RpgMap();
    setTimeout(() => { map.render(0) }, 500)
}

class RpgMap {
    constructor() {
        this.LoadMaps();
        this.InitializeMousePanning();
        this.RenderNavigation();
    }
    //Map container Scrolling
    private InitializeMousePanning() {
        var $maps = $("#Maps");
        var clicked = false, clickY, clickX;
        var clickOldY = 0, clickOldX = 0;

        $maps.on({
            'mousemove': function (e) {
                clicked && updateScrollPos(e);
            },
            'mousedown': function (e) {
                clicked = true;
                clickY = e.pageY + clickOldY;
                clickX = e.pageX + clickOldX;
            },
            'mouseup': function () {
                clicked = false;
                $maps.css('cursor', 'auto');
            }
        });

        var updateScrollPos = function (e) {
            $maps.css('cursor', 'row-resize');
            $maps.scrollTop((clickY - e.pageY));
            $maps.scrollLeft((clickX - e.pageX));
            clickOldY = $maps.scrollTop();
            clickOldX = $maps.scrollLeft();
        };
    }

    public mapNames = ["Dorpat", "Dungeon I", "Narwa", "Whiland", "Reval", "Rakblood", "Blood River", "Hell", "Clouds", "Heaven", "Cesis", "Walco", "Tutorial Island",
        "Pernau", "Fellin", "Dragon's Lair", "No Man's Land", "Ancient Dungeon", "Lost Woods", "Minigames", "Broceliande Forest", "Devil's Triangle",
        "Cathedral", "Illusion Guild", "Every Man's Land", "Moche I", "Wittensten", "Dungeon II", "Dungeon III", "Dungeon IV", "Moche II", "Void I",
        "Nature Tower", "Ice Tower", "Fire Tower", "Witches I", "Witches II", "Star Of Knowledge", "Core Of Knowledge", "No Man's Dungeon", "Tavern"];

    public RenderNavigation() {
        new Vue({
            el: '#v_dropdown',
            data: {
                selected: 'Dorpat',
                options: this.mapNames
            },
            methods: {
                onChange: () => {
                    var selectedIndex = map.mapNames.indexOf((<any>document.getElementById("v_dropdown")).value);
                    console.log("map.render")
                    map.render(selectedIndex);
                }
            }
        });
    }

    public LoadMaps() {
        this.mapNames.forEach((value, index) => {

            var mapFile: any = document.createElement('script');

            mapFile.setAttribute("type", "text/javascript");
            mapFile.setAttribute("src", "https://1239889624.rsc.cdn77.org/maps/map" + index + ".js");

            document.getElementsByTagName("head")[0].appendChild(mapFile);

        });
    }



    //Use <HTMLCanvasElement> or var groundTilesCanvas : any = document.getElementById("groundTilesCanvas");
    //Render Map tiles
    public groundTilesCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("groundTilesCanvas");
    public ctxGround: CanvasRenderingContext2D = this.groundTilesCanvas.getContext('2d');

    public topTilesCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("topTilesCanvas");
    public ctxTop: CanvasRenderingContext2D = this.topTilesCanvas.getContext('2d');


    public render(map_id) {
        this.ctxGround.clearRect(0, 0, this.groundTilesCanvas.width, this.groundTilesCanvas.height);
        this.ctxTop.clearRect(0, 0, this.topTilesCanvas.width, this.topTilesCanvas.height);

        var offsetX = 0, offsetY = 0, tile;
        var map_id = map_id || 0;
        var maps = map_json[map_id];
        var mapsTop = on_map_json[map_id];

        //Rendres from top
        for (var xx = 100; xx <= 10000; xx += 100) {
            for (var yx = 1; yx <= 100; yx++) {
                tile = xx - yx;
                offsetX = 2700 - 27 + 27 * (maps[tile].i);
                offsetX -= 27 * (99 - (maps[tile].j));
                offsetY = 0 + 14 * (99 - maps[tile].j);
                offsetY += 14 * ((maps[tile].i));
                this.ctxGround.drawImage(IMAGE_BASE[ground_base[maps[tile].b_i].img.sheet].img, ground_base[maps[tile].b_i].img.x * 54, ground_base[maps[tile].b_i].img.y * 34, 54, 34, offsetX, offsetY, 54, 34);
            }
        }

        //THIS IS KINDA UNNECESSARY BUT OK W/E
        var sorted_on_tiles: Array<Array<Object>> = [];
        for (var i = 0; i < 100; i++) {
            sorted_on_tiles[i] = [];
        }

        var on_tile, tile;
        for (tile in mapsTop) {
            sorted_on_tiles[mapsTop[tile].i][mapsTop[tile].j] = mapsTop[tile];
        }
        //Top corner is 0, 100, right corner is 100, 100
        //Renders non actions and mobs, but mobs incorrectly
        // b_t = 4 mob, 
        for (var x = 0; x < 100; x++) {
            for (var y = 99; y >= 0; y--) {
                on_tile = sorted_on_tiles[x][y];
                if (typeof on_tile == "undefined") continue;
                //console.log(x, y, on_tile, mapsTop[on_tile])

                offsetX = 28 + 27 * (on_tile.i);
                offsetX += 27 * ((on_tile.j));
                offsetY = 1350 + 36 - 14 * (on_tile.j);
                offsetY += 14 * ((on_tile.i));
                var obj = BASE_TYPE[on_tile.b_t][on_tile.b_i];
                if (on_tile.b_t == '4') {
                    if (typeof obj.img.hash != "undefined") {
                        this.ctxTop.drawImage(drawBody(obj.img.hash), 0, 0, 64, 54, offsetX - 27, offsetY - 23, 64, 54)

                        continue;
                    }
                    this.ctxTop.drawImage(IMAGE_BASE[obj.img.sheet].img, <number>(obj.img.x) * 32, <number>(obj.img.y) * 32, 32, 32, offsetX - IMAGE_BASE[obj.img.sheet].tile_half_width_floor, offsetY - IMAGE_BASE[obj.img.sheet].tile_half_height_floor, 32, 32);
                    continue;
                }

                // if(typeof BASE_TYPE[on_tile.b_t][on_tile.b_i] != "undefined"){
                    var tempImg = IMAGE_BASE[obj.img.sheet];
                    var random_x_offset = typeof obj.img.x == "object" ? obj.img.x[Math.floor(Math.random() * obj.img.x.length)]: obj.img.x;
                    this.ctxTop.drawImage(tempImg.img, random_x_offset  * tempImg.tile_width, obj.img.y * tempImg.tile_height,
                        tempImg.tile_width, tempImg.tile_height, offsetX - tempImg.tile_half_width_floor, offsetY - tempImg.tile_half_height_floor, tempImg.tile_width, tempImg.tile_height);
                    continue;        
                // }
                // console.log("DIFFERENT BASE TYPE")
                //  this.ctxTop.drawImage(IMAGE_BASE[obj.img.sheet].img, obj.img.x * IMAGE_BASE[obj.img.sheet].tile_width, obj.img.y * IMAGE_BASE[obj.img.sheet].tile_height,
                    //  IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height, offsetX - IMAGE_BASE[obj.img.sheet].tile_half_width_floor, offsetY - IMAGE_BASE[obj.img.sheet].tile_half_height_floor, IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height);
            }
        }

        // console.log("sorted_on_tiles", sorted_on_tiles);
        // for (tile in sorted_on_tiles) {
        //     on_tile = mapsTop.length - tile - 1;
        //     console.log(on_tile)

        //     //                ctxTop.drawImage(imgGroundTop, 7*54, 7*34, 54, 34, offsetX, offsetY, 54, 34);
        //     offsetX = ;
        //     offsetX += 27 * ((mapsTop[on_tile].j));
        //     offsetY = 1400 - 38 - 14 * (mapsTop[on_tile].j);
        //     offsetY += 14 * ((mapsTop[on_tile].i));
        //     // if (mapsTop[on_tile].b_i < ground_base.length) {
        //     //image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        //     console.log("object_base[mapsTop[on_tile].b_i]", object_base[mapsTop[on_tile].b_i])
        //     //} else {
        //     //ctxTop.drawImage(imgGroundTop, 54, 50, 54, 50, offsetX, offsetY, 54, 50);
        //     // }

        // }

    }
}









/*
function drawBody(a) {
    //Split hash using space as separator
    var hash = a.split(" ");
    //Turn strings into numbers
    for (var i = 0; 13 > i; i++) {
        hash[i] <<= 0;
    }
 
    //BODY_PARTS.HEADS[d];
    var d = hash[0],
        //BODY_PARTS.FACIAL_HAIR[e];
        e = hash[1],
        //BODY_PARTS.BODIES[f];
        f = hash[2],
        //BODY_PARTS.PANTS[g];
        g = hash[3],
        //BODY_PARTS.CAPES[h];
        h = hash[4],
        //BODY_PARTS.LEFT_HANDS[l];
        l = hash[5],
        //BODY_PARTS.RIGHT_HANDS[m];
        m = hash[6],
        //BODY_PARTS.SHIELDS[a];
        a = hash[7],
        //BODY_PARTS.WEAPONS[k];
        k = hash[8],
        //BODY_PARTS.HELMETS[q];
        q = hash[9],
        //BODY_PARTS.BOOTS[r];
        r = hash[10],
        u = hash[11],
        //BODY_PARTS.GROUND_EFFECT[n];
        n = hash[12];
            
}
*/



////////GAME FUNCTIONS SLIGHTLY MODIFIED CARE!!!!!///////////

function deepObjCopy(a) {
    var b = {};
    if ("object" == typeof a && null != a) {
        "undefined" != typeof a.length && (b = []);
        for (var d in a)
            "object" == typeof a[d] ? b[d] = deepObjCopy(a[d]) : "string" == typeof a[d] ? b[d] = a[d] : "number" == typeof a[d] ? b[d] = a[d] : "boolean" == typeof a[d] && (1 == a[d] ? b[d] = !0 : b[d] = !1)
    }
    return b
}

function createCanvas(a, b) {
    var canvas = document.createElement("canvas");
    canvas.width = a;
    canvas.height = b;
    return canvas;
}


function drawBody(a) {
    var b, d, e = a.split(" ");
    for (a = 0; 13 > a; a++)
        e[a] <<= 0;
    var g = e[0]
        , h = e[1]
        , k = e[2]
        , m = e[3]
        , n = e[4]
        , l = e[5]
        , q = e[6];
    a = e[7];
    var r = e[8]
        , v = e[9]
        , w = e[10]
        , x = e[11]
        , y = e[12]
        , e = 1 == e[13] ? <any>"f" : ""
        , A = createCanvas(64, 54)
        , B = A.getContext("2d");
    B.clearRect(0, 0, B.canvas.width, B.canvas.height);
    b = BODY_PARTS.GROUND_EFFECT[y];
    var u = b.img, D = !0, p, C, E;
    if ("undefined" != typeof u.sheet_file) {
        p = IMAGE_BASE[u.sheet_file].sprite.imgs[u.file];
        if ("undefined" == typeof p)
            return A;
        console.log(p, IMAGE_BASE[u.sheet_file].sprite, u.file)
        B.drawImage(p.img, u.pos && u.pos._x || 0, u.pos && u.pos._y || 0)
    } else
        p = IMAGE_BASE[u.sheet],
            b = u.pos._x || 0,
            d = u.pos._y || 0,
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y;
    //B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, b, d, p.tile_width, p.tile_height);
    b = BODY_PARTS.CAPES[n + e] || BODY_PARTS.CAPES[n];
    u = b.img;
    if ("undefined" != typeof u.sheet_file) {
        p = IMAGE_BASE[u.sheet_file].sprite.imgs[u.file];
        if ("undefined" == typeof p)
            return A;
        //B.drawImage(p.img, u.pos && u.pos._x || 0, u.pos && u.pos._y || 0)
    } else
        p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, -5, -6, p.tile_width, p.tile_height);
    4 == y && (b = BODY_PARTS.GROUND_EFFECT[y],
        u = b.img,
        p = IMAGE_BASE[u.sheet],
        b = u.pos.x || 0,
        d = u.pos.y || 0,
        C = IMAGE_BASE[u.sheet].tile_width * u.x,
        E = IMAGE_BASE[u.sheet].tile_height * u.y,
        B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, b, d, p.tile_width, p.tile_height));
    n = -1 < GENDER_HEADS[GENDER.FEMALE].indexOf(g);
    if (b = BODY_PARTS.PANTS[m + e] || BODY_PARTS.PANTS[m])
        u = b.img,
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height),
            b.no_boots && (D = !1);
    (b = BODY_PARTS.BOOTS[w + e] || BODY_PARTS.BOOTS[w]) && D && (u = b.img,
        p = IMAGE_BASE[u.sheet],
        C = IMAGE_BASE[u.sheet].tile_width * u.x,
        E = IMAGE_BASE[u.sheet].tile_height * u.y,
        B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height));
    if (b = BODY_PARTS.LEFT_HANDS[l])
        u = deepObjCopy(b.img),
            n && (u.sheet = IMAGE_BASE.LEFT_HANDS_FEMALE),
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E + x * IMAGE_BASE[u.sheet].tile_height, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height);
    if (b = BODY_PARTS.RIGHT_HANDS[q])
        u = deepObjCopy(b.img),
            n && (u.sheet = IMAGE_BASE.RIGHT_HANDS_FEMALE),
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E + x * IMAGE_BASE[u.sheet].tile_height, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height);
    if (b = BODY_PARTS.BODIES[k + e] || BODY_PARTS.BODIES[k])
        u = b.img,
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height);
    (b = BODY_PARTS.HEADS[g]) && -1 == NO_HEAD_HELMETS.indexOf(v) && (u = b.img,
        p = IMAGE_BASE[u.sheet],
        C = IMAGE_BASE[u.sheet].tile_width * u.x,
        E = IMAGE_BASE[u.sheet].tile_height * u.y,
        B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height));
    (b = BODY_PARTS.FACIAL_HAIR[h]) && -1 == NO_HEAD_HELMETS.indexOf(v) && (u = b.img,
        p = IMAGE_BASE[u.sheet],
        C = IMAGE_BASE[u.sheet].tile_width * u.x,
        E = IMAGE_BASE[u.sheet].tile_height * u.y,
        B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height));
    g = 0;
    n == GENDER.FEMALE && -1 == NO_HEAD_HELMETS.indexOf(v) && (g = -1);
    if (b = BODY_PARTS.HELMETS[v + e] || BODY_PARTS.HELMETS[v])
        u = b.img,
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11 + g, p.tile_width, p.tile_height);
    if (b = BODY_PARTS.SHIELDS[a])
        u = b.img,
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11, 11, p.tile_width, p.tile_height);
    if (b = BODY_PARTS.WEAPONS[r])
        u = b.img,
            b = u.pos._x,
            d = u.pos._y,
            p = IMAGE_BASE[u.sheet],
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y,
            B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, 11 + b, 11 + d, p.tile_width, p.tile_height);
    return A
}