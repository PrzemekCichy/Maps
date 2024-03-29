var item_base, players, pets;
var map_json = {};
var on_map_json = {};
var map, d3Helper;
// window.onload = () => {
// }
console.log("test");
var version, cache;
var D3Helper = /** @class */ (function () {
    function D3Helper() {
        this.svg = d3.select("#highlights_svg");
        this.textSvg = d3.select("#text_svg");
        //Order Matters
        this.svgGroups = {
            groundOverlay: this.svg.append("g").attr("class", "groundOverlay"),
            gridLines: this.svg.append("g").attr("class", "gridLines"),
            monsterTilesHighlight: this.svg.append("g").attr("class", "monsterTilesHighlight"),
            clickableTilesHighlight: this.svg.append("g").attr("class", "clickableTilesHighlight"),
            npcTilesHighlight: this.svg.append("g").attr("class", "npcTilesHighlight"),
            treeTilesHighlight: this.svg.append("g").attr("class", "treeTilesHighlight"),
            mobsGroups: this.textSvg.append("g").attr("class", "mobsGroups")
        };
        this.drawPolygon = function (svg, points, strokeColour, strokeWidth, fillColour, fillOpacity) {
            svg.append("polygon")
                .data([points])
                .attr("points", function (d) {
                return d.map(function (d) {
                    return [d.x, d.y].join(",");
                }).join(" ");
            })
                .attr("stroke", strokeColour)
                .attr("stroke-width", strokeWidth)
                .attr("fill", fillColour)
                .attr("fill-opacity", fillOpacity);
        };
        this.drawText = function (svg, text, x, y) {
            return svg.append("text")
                .attr("x", x)
                .attr("y", y)
                .text(text)
                .attr("class", "monster-text")
                .attr("font-weight", "700")
                .attr("font-size", "26px")
                .attr("font-family", "Arial,Helvetica")
                .attr("fill", "black")
                .attr("text-anchor", "middle")
                .attr("stroke", "white")
                .attr("stroke-width", "1");
        };
        this.drawLine = function (svg, startX, startY, endX, endY, strokeWidth, strokeColour, fill) {
            svg.append("line")
                .attr("x1", startX) //<<== change your code here
                .attr("y1", startY)
                .attr("x2", endX) //<<== and here
                .attr("y2", endY)
                .attr("stroke-width", strokeWidth)
                .attr("stroke", strokeColour)
                .attr("fill", fill);
        };
    }
    D3Helper.prototype.drawGridAndGroundMask = function () {
        this.drawPolygon(this.svgGroups.groundOverlay, [{ "x": 0, "y": 1400 },
            { "x": 2700, "y": 0 },
            { "x": 5400, "y": 1400 },
            { "x": 2700, "y": 2800 }], "313335", "2", "#ffffff", "0.3");
        var offsetX = 27;
        var offsetY = 14;
        for (var i = 0; i <= 100; i++) {
            var tempOffsetX = offsetX * i;
            var tempOffsetY = offsetY * i;
            this.drawLine(this.svgGroups.gridLines, tempOffsetX, 1400 - tempOffsetY, 2700 + tempOffsetX, 2800 - tempOffsetY, 1, "#313335", "none"); //x
            this.drawLine(this.svgGroups.gridLines, tempOffsetX, 1400 + tempOffsetY, 2700 + tempOffsetX, 0 + tempOffsetY, 1, "#313335", "none"); //y
            // drawLine(tempOffsetX, 1400 + tempOffsetY, 2700 + tempOffsetX, -1400 + tempOffsetY, 3, "63666A", "none")//x
        }
    };
    return D3Helper;
}());
var RpgMap = /** @class */ (function () {
    function RpgMap() {
        this.clickOldY = 0;
        this.clickOldX = 0;
        this.mapNames = ["Dorpat", "Dungeon I", "Narwa", "Whiland", "Reval", "Rakblood", "Blood River", "Hell", "Clouds", "Heaven", "Cesis", "Walco", "Tutorial Island", "Pernau", "Fellin", "Dragon's Lair", "No Man's Land", "Ancient Dungeon", "Lost Woods", "Minigames", "Broceliande Forest", "Devil's Triangle", "Cathedral", "Illusion Guild", "Every Man's Land", "Moche I", "Wittensten", "Dungeon II", "Dungeon III", "Dungeon IV", "Moche II", "Void I", "Nature Tower", "Ice Tower", "Fire Tower", "Witches I", "Witches II", "Star Of Knowledge", "Core Of Knowledge", "No Man's Dungeon", "Tavern", "Lost Relic"];
        //Use <HTMLCanvasElement> or var groundTilesCanvas : any = document.getElementById("groundTilesCanvas");
        //Render Map tiles
        this.groundTilesCanvas = document.getElementById("groundTilesCanvas");
        this.ctxGround = this.groundTilesCanvas.getContext('2d');
        this.topTilesCanvas = document.getElementById("topTilesCanvas");
        this.ctxTop = this.topTilesCanvas.getContext('2d');
        this.InitializeMousePanning();
        this.RenderNavigation();
    }
    //Map container Scrolling
    RpgMap.prototype.InitializeMousePanning = function () {
        var _this = this;
        var $maps = $("#Maps");
        var clicked = false, clickY, clickX;
        $maps.on({
            'mousemove': function (e) {
                clicked && updateScrollPos(e);
            },
            'mousedown': function (e) {
                clicked = true;
                clickY = e.pageY + _this.clickOldY;
                clickX = e.pageX + _this.clickOldX;
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
            _this.clickOldY = $maps.scrollTop();
            _this.clickOldX = $maps.scrollLeft();
        };
    };
    RpgMap.prototype.RenderNavigation = function () {
        new Vue({
            el: '#v_dropdown',
            data: {
                selected: 'Dorpat',
                options: this.mapNames
            },
            methods: {
                onChange: function () {
                    var selectedIndex = map.mapNames.indexOf(document.getElementById("v_dropdown").value);
                    console.log("map.render");
                    map.render(selectedIndex);
                }
            }
        });
        // The raw data to observe
        var renderOptions = [
            {
                title: "Grid Lines",
                groupId: "gridLines",
                drawEnabled: true,
                drawEnabledValue: true,
                drawEnabledDescription: "Draw Grid Lines",
                strokeEnabled: true,
                strokeColour: "#313335",
                strokeColourBoxName: "Select stroke colour",
                strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
                fillEnabled: false,
                fillColour: "#2D5593",
                fillColourBoxName: "Select fill colour",
                fillSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 1, step: 0.1 } }
            }, {
                title: "Ground Overlay",
                groupId: "groundOverlay",
                drawEnabled: true,
                drawEnabledValue: true,
                drawEnabledDescription: "Draw Lines",
                strokeEnabled: true,
                strokeColour: "#313335",
                strokeColourBoxName: "Select stroke colour",
                strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
                fillEnabled: true,
                fillColour: "#ffffff",
                fillColourBoxName: "Select fill colour",
                fillSlider: { label: 'Fill Opacity', value: 0.2, range: { min: 0, max: 1, step: 0.1 } }
            }, {
                title: "NPC Tiles Highlight",
                groupId: "npcTilesHighlight",
                drawEnabled: true,
                drawEnabledValue: true,
                drawEnabledDescription: "Draw Highlight tile under NPCs",
                strokeEnabled: true,
                strokeColourBoxName: "Select stroke colour",
                strokeColour: "#313335",
                strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
                fillEnabled: true,
                fillColour: "#00B8DE",
                fillColourBoxName: "Select fill colour",
                fillSlider: { label: 'Fill Opacity', value: 0.2, range: { min: 0, max: 1, step: 0.1 } }
            }, {
                title: "Clickable Tiles Highlight",
                groupId: "clickableTilesHighlight",
                drawEnabled: true,
                drawEnabledValue: true,
                drawEnabledDescription: "Draw highlight tile under clickable tiles",
                strokeEnabled: true,
                strokeColourBoxName: "Select stroke colour",
                strokeColour: "#313335",
                strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
                fillEnabled: true,
                fillColour: "#FFCD00",
                fillColourBoxName: "Select fill colour",
                fillSlider: { label: 'Fill Opacity', value: 0.2, range: { min: 0, max: 1, step: 0.1 } }
            }, {
                title: "Monster Tiles Highlight",
                groupId: "monsterTilesHighlight",
                drawEnabled: true,
                drawEnabledValue: true,
                drawEnabledDescription: "Draw highlight tile under monsters",
                strokeEnabled: true,
                strokeColour: "#313335",
                strokeColourBoxName: "Select stroke colour",
                strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
                fillEnabled: true,
                fillColour: "#AB2328",
                fillColourBoxName: "Select fill colour",
                fillSlider: { label: 'Fill Opacity', value: 0.2, range: { min: 0, max: 1, step: 0.1 } }
            }, {
                title: "Tree Tiles Highlight",
                groupId: "treeTilesHighlight",
                drawEnabled: true,
                drawEnabledValue: true,
                drawEnabledDescription: "Draw highlight tile under chopable trees",
                strokeEnabled: true,
                strokeColour: "#313335",
                strokeColourBoxName: "Select stroke colour",
                strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
                fillEnabled: true,
                fillColour: "#00482B",
                fillColourBoxName: "Select fill colour",
                fillSlider: { label: 'Fill Opacity', value: 0.2, range: { min: 0, max: 1, step: 0.1 } }
            },
            // {
            //     title: "Monster Group Highlight",
            //     groupId: "mobsGroups",
            //     drawEnabled: true,
            //     drawEnabledValue: true,
            //     drawEnabledDescription: "Draw highlight tile under chopable trees",
            //     strokeEnabled: true,
            //     strokeColour: "#313335",
            //     strokeColourBoxName: "Select stroke colour",
            //     strokeSlider: { label: 'Stroke Width', value: 1, range: { min: 0, max: 3, step: 1 } },
            //     fillEnabled: true,
            //     fillColour: "#5F4B8B",
            //     fillColourBoxName: "Select fill colour",
            //     fillSlider: { label: 'Fill Opacity', value: 1, range: { min: 0, max: 1, step: 0.1 } },
            // }
        ];
        // // bootstrap the demo
        // new Vue({
        //     template: "sliders-template",
        // })
        // register modal component
        var b = Vue.component('modal', {
            template: '#modal-template',
            data: function () {
                return {
                    showModal: false,
                    newLabel: '',
                    renderOptions: renderOptions
                };
            },
            methods: {
                test: function (property, index) {
                    // //If property comes with a ., it means its nestedm so unwrap it
                    // var propertyArr = property.split(".");
                    // var obj = renderOptions[index];
                    // propertyArr.forEach((_prop) => {
                    //     obj = obj[_prop]
                    // })
                    // console.log("type, value", property, index, renderOptions[index], obj);
                    if (property == "drawEnabledValue") {
                        var prop = renderOptions[index]["drawEnabledValue"];
                        var list1 = d3.selectAll("g").filter("." + renderOptions[index].groupId)
                            .style('display', prop != true ? "block" : "none");
                        console.log(list1);
                    }
                    else if (property == "strokeSlider") {
                        var list1 = d3.selectAll("g").filter("." + renderOptions[index].groupId)
                            .selectAll("polygon,line").attr("stroke-width", renderOptions[index].strokeSlider.value.toString());
                    }
                    else if (property == "fillSlider") {
                        var list1 = d3.selectAll("g").filter("." + renderOptions[index].groupId)
                            .selectAll("polygon,line").attr("fill-opacity", renderOptions[index].fillSlider.value);
                    }
                    else if (property == "strokeColourBoxName") {
                        console.log("strokeColour", property, index, renderOptions[index]);
                        var list1 = d3.selectAll("g").filter("." + renderOptions[index].groupId)
                            .selectAll("polygon,line").attr("stroke", renderOptions[index].strokeColour);
                    }
                    else if (property == "fillColourBoxName") {
                        console.log("fillColour", property, index, renderOptions[index], renderOptions[index].fillColour);
                        var list1 = d3.selectAll("g").filter("." + renderOptions[index].groupId)
                            .selectAll("polygon,line").attr("fill", renderOptions[index].fillColour);
                    }
                    else {
                    }
                    //d3Helper.svg;
                }
            }
        });
        // b.renderOptions = renderOptions;
        // start app
        var a = new Vue({
            el: '#options',
            data: {
                showModal: false,
                newLabel: '',
                renderOptions: renderOptions
            }
        });
        // var a = new Vue({
        //     el: '#demo_svg',
        //     data: {
        //         showModal: false,
        //         newLabel: '',
        //         renderOptions: renderOptions
        //     }
        // });
    };
    RpgMap.prototype.render = function (map_id, preserveSvg) {
        if (!preserveSvg) {
            d3Helper.svg.selectAll("g").selectAll("*").remove();
            d3Helper.textSvg.selectAll("g").selectAll("*").remove();
            d3Helper.drawGridAndGroundMask();
            $("#groupSidebar")[0].innerHTML = "";
        }
        d3Helper.drawText(d3Helper.textSvg, "Use right click to drag the map...", 30, 30)
            .attr("text-anchor", "left")
            .attr("fill", "black")
            .attr("stroke", "")
            .attr("stroke-width", 0);
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
                var tempImg = ground_base[maps[tile].b_i].img;
                this.ctxGround.drawImage(IMAGE_BASE[tempImg.sheet].img, tempImg.x * 54, tempImg.y * 34, 54, 34, offsetX, offsetY, 54, 34);
                if (typeof ground_base[maps[tile].b_i].top == "object") {
                    tempImg = ground_base[maps[tile].b_i].top;
                    this.ctxGround.drawImage(IMAGE_BASE[tempImg.sheet].img, tempImg.x * IMAGE_BASE[tempImg.sheet].tile_width, tempImg.y * 49, 54, 49, offsetX, offsetY - 22, 54, 49);
                }
            }
        }
        //THIS IS KINDA UNNECESSARY AND BAD MEMORY/PERFORMANCE BUT OK W/E
        var sorted_on_tiles = [];
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
        var npcs = [];
        for (var x = 0; x < 100; x++) {
            for (var y = 99; y >= 0; y--) {
                on_tile = sorted_on_tiles[x][y];
                if (typeof on_tile == "undefined")
                    continue;
                //console.log(x, y, on_tile, mapsTop[on_tile])
                offsetX = 28 + 27 * (on_tile.i);
                offsetX += 27 * ((on_tile.j));
                offsetY = 1350 + 36 - 14 * (on_tile.j);
                offsetY += 14 * ((on_tile.i));
                var obj = BASE_TYPE[on_tile.b_t][on_tile.b_i];
                if (typeof (obj) == "undefined") {
                    console.log(on_tile.b_t, on_tile.b_i, "Undefined");
                    continue;
                }
                if (on_tile.b_t == '4') {
                    if (obj.type == "4") {
                        npcs.push(obj);
                        d3Helper.drawPolygon(d3Helper.svgGroups.npcTilesHighlight, [{ "x": offsetX - 27, "y": offsetY + 14 },
                            { "x": offsetX + 0, "y": offsetY + 28 },
                            { "x": offsetX + 27, "y": offsetY + 14 },
                            { "x": offsetX + 0, "y": offsetY + 0 }], "#313335", "1", "#2D5593", "0.2");
                    }
                    else if (obj.activities.indexOf("Attack") != "-1") {
                        d3Helper.drawPolygon(d3Helper.svgGroups.monsterTilesHighlight, [{ "x": offsetX - 27, "y": offsetY + 14 },
                            { "x": offsetX + 0, "y": offsetY + 28 },
                            { "x": offsetX + 27, "y": offsetY + 14 },
                            { "x": offsetX + 0, "y": offsetY + 0 }], "#313335", "1", "#AB2328", "0.3");
                    }
                    if (typeof obj.img.hash != "undefined") {
                        this.ctxTop.drawImage(drawBody(obj.img.hash), 0, 0, 64, 54, offsetX - 27, offsetY - 23, 64, 54);
                        continue;
                    }
                    this.ctxTop.drawImage(IMAGE_BASE[obj.img.sheet].img, (obj.img.x) * IMAGE_BASE[obj.img.sheet].tile_width, (obj.img.y) * IMAGE_BASE[obj.img.sheet].tile_height, IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height, offsetX - IMAGE_BASE[obj.img.sheet].tile_half_width_floor, offsetY - IMAGE_BASE[obj.img.sheet].tile_half_height_floor, IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height);
                    continue;
                }
                if (obj.activities.indexOf("Chop") != "-1") {
                    d3Helper.drawPolygon(d3Helper.svgGroups.treeTilesHighlight, [{ "x": offsetX - 27, "y": offsetY + 14 },
                        { "x": offsetX + 0, "y": offsetY + 28 },
                        { "x": offsetX + 27, "y": offsetY + 14 },
                        { "x": offsetX + 0, "y": offsetY + 0 }], "#313335", "1", "#00482B", "0.3");
                }
                else if (obj.activities.indexOf("Use") != "-1") {
                    d3Helper.drawPolygon(d3Helper.svgGroups.clickableTilesHighlight, [{ "x": offsetX - 27, "y": offsetY + 14 },
                        { "x": offsetX + 0, "y": offsetY + 28 },
                        { "x": offsetX + 27, "y": offsetY + 14 },
                        { "x": offsetX + 0, "y": offsetY + 0 }], "#313335", "1", "#FFCD00", "0.5");
                }
                var tempImg = IMAGE_BASE[obj.img.sheet];
                if (typeof obj.img.file == "string") {
                    tempImg = IMAGE_BASE[obj.img.sheet].sprite.img[obj.img.file];
                    this.ctxTop.drawImage(tempImg.img, random_x_offset * tempImg.tile_width, obj.img.y * tempImg.tile_height, tempImg.tile_width, tempImg.tile_height, offsetX - tempImg.tile_half_width_floor, offsetY - tempImg.tile_half_height_floor, tempImg.tile_width, tempImg.tile_height);
                    continue;
                }
                // if(typeof BASE_TYPE[on_tile.b_t][on_tile.b_i] != "undefined"){
                var random_x_offset = typeof obj.img.x == "object" ? obj.img.x[Math.floor(Math.random() * obj.img.x.length)] : obj.img.x;
                //console.log(obj, tempImg)
                this.ctxTop.drawImage(tempImg.img, random_x_offset * tempImg.tile_width, obj.img.y * tempImg.tile_height, tempImg.tile_width, tempImg.tile_height, offsetX - tempImg.tile_half_width_floor, offsetY - tempImg.tile_half_height_floor, tempImg.tile_width, tempImg.tile_height);
                continue;
                // }
                // console.log("DIFFERENT BASE TYPE")
                //  this.ctxTop.drawImage(IMAGE_BASE[obj.img.sheet].img, obj.img.x * IMAGE_BASE[obj.img.sheet].tile_width, obj.img.y * IMAGE_BASE[obj.img.sheet].tile_height,
                //  IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height, offsetX - IMAGE_BASE[obj.img.sheet].tile_half_width_floor, offsetY - IMAGE_BASE[obj.img.sheet].tile_half_height_floor, IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height);
            }
        }
        (function () {
            var canvasHolder = document.getElementById("groupSidebar");
            computed_mob_locations[map_id].forEach(function (center, index) {
                offsetX = 28 + 27 * (center.x);
                offsetX += 27 * (center.y);
                offsetY = 1350 + 36 - 14 * (center.y);
                offsetY += 14 * (center.x);
                d3Helper.drawPolygon(d3Helper.svgGroups.npcTilesHighlight, [{ "x": offsetX - 27, "y": offsetY + 14 },
                    { "x": offsetX + 0, "y": offsetY + 28 },
                    { "x": offsetX + 27, "y": offsetY + 14 },
                    { "x": offsetX + 0, "y": offsetY + 0 }], "#313335", "1", "#5F4B8B", "1");
                d3Helper.drawText(d3Helper.svgGroups.mobsGroups, npc_base[center.b_i].name, offsetX, offsetY - 30);
                var canvas = document.createElement('canvas');
                canvas.id = center.x + "," + center.y;
                canvas.width = 64;
                canvas.height = 54;
                canvas.style.border = "1px solid";
                canvas.style.position = "relative";
                var $maps = $("#Maps");
                var jumpToGroup = function (a) {
                    var coords = a.srcElement.id.split(",");
                    var x = parseFloat(coords[0]);
                    var y = parseFloat(coords[1]);
                    var _offsetX = 27;
                    var _offsetY = 14;
                    _offsetX = 28 + 27 * (x);
                    _offsetX += 27 * (y);
                    _offsetY = 1400 - 14 * (y);
                    _offsetY += 14 * (x);
                    console.log(coords, _offsetX, _offsetY, a.pageX, a.pageY);
                    //$maps.scrollBy(_offsetX, _offsetY);
                    $maps.scrollTop(_offsetY - $(window).height() / 2);
                    $maps.scrollLeft(_offsetX - a.pageX + $(window).width() / 2);
                    ////TODO
                    /*
                    _offsetX = 27 + 27 * (x);
                    _offsetX += 27 * (y);
                    _offsetY = 1400 - 14.5 * (y);
                    _offsetY += 14.5 * (x);

                    console.log(coords, _offsetX, _offsetY, a.pageX, a.pageY)
                    */
                    //$maps.scrollBy(_offsetX, _offsetY);
                    /* $maps.scrollTop((_offsetY - $(window).height() / 2) * scale - $(window).height() / 2);
                     $maps.scrollLeft((_offsetX + $(window).width() / 2) * scale - (a.pageX + $(window).width()/2 ) * scale);
                     */
                    //document.getElementById("Maps").scrollTo(_offsetX, _offsetY);
                    // this.clickOldY = $maps.scrollTop();
                    // this.clickOldX = $maps.scrollLeft();
                };
                canvas.addEventListener('click', jumpToGroup);
                canvasHolder.appendChild(canvas);
                var ctx = canvas.getContext("2d");
                var obj = npc_base[center.b_i];
                if (typeof npc_base[center.b_i].img.hash != "undefined") {
                    ctx.drawImage(drawBody(obj.img.hash), 0, 0, 64, 54, 0, 0, 64, 54);
                }
                else {
                    ctx.drawImage(IMAGE_BASE[obj.img.sheet].img, obj.img.x * IMAGE_BASE[obj.img.sheet].tile_width, obj.img.y * IMAGE_BASE[obj.img.sheet].tile_height, IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height, IMAGE_BASE[obj.img.sheet].tile_width / 4, IMAGE_BASE[obj.img.sheet].tile_height / 4, IMAGE_BASE[obj.img.sheet].tile_width, IMAGE_BASE[obj.img.sheet].tile_height);
                }
            });
        })();
        console.log(npcs);
    };
    return RpgMap;
}());
////////GAME FUNCTIONS SLIGHTLY MODIFIED CARE!!!!!///////////
function deepObjCopy(a) {
    var b = {};
    if ("object" == typeof a && null != a) {
        "undefined" != typeof a.length && (b = []);
        for (var d in a)
            "object" == typeof a[d] ? b[d] = deepObjCopy(a[d]) : "string" == typeof a[d] ? b[d] = a[d] : "number" == typeof a[d] ? b[d] = a[d] : "boolean" == typeof a[d] && (1 == a[d] ? b[d] = !0 : b[d] = !1);
    }
    return b;
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
    var g = e[0], h = e[1], k = e[2], m = e[3], n = e[4], l = e[5], q = e[6];
    a = e[7];
    var r = e[8], v = e[9], w = e[10], x = e[11], y = e[12], e = 1 == e[13] ? "f" : "", A = createCanvas(64, 54), B = A.getContext("2d");
    B.clearRect(0, 0, B.canvas.width, B.canvas.height);
    b = BODY_PARTS.GROUND_EFFECT[y];
    var u = b.img, D = !0, p, C, E;
    if ("undefined" != typeof u.sheet_file) {
        p = IMAGE_BASE[u.sheet_file].sprite.img[u.file];
        if ("undefined" == typeof p)
            return A;
        B.drawImage(p.img, u.pos && u.pos._x || 0, u.pos && u.pos._y || 0);
    }
    else
        p = IMAGE_BASE[u.sheet],
            b = u.pos._x || 0,
            d = u.pos._y || 0,
            C = IMAGE_BASE[u.sheet].tile_width * u.x,
            E = IMAGE_BASE[u.sheet].tile_height * u.y;
    // B.drawImage(IMAGE_BASE[u.sheet].img, C, E, p.tile_width, p.tile_height, b, d, p.tile_width, p.tile_height);
    b = BODY_PARTS.CAPES[n + e] || BODY_PARTS.CAPES[n];
    u = b.img;
    if ("undefined" != typeof u.sheet_file) {
        p = IMAGE_BASE[u.sheet_file].sprite.img[u.file];
        if ("undefined" == typeof p)
            return A;
        //B.drawImage(p.img, u.pos && u.pos._x || 0, u.pos && u.pos._y || 0)
    }
    else
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
    return A;
}
for (var key in IMAGE_BASE) {
    //THIS SHOULD INITIALIZE GUILDS
    if (typeof IMAGE_BASE[key].sprite != "undefined") {
        IMAGE_BASE[key].sprite.img = {};
        for (var building in IMAGE_BASE[key].sprite.imgs) {
            IMAGE_BASE[key].sprite.img[building] = {};
            IMAGE_BASE[key].sprite.img[building].img = new Image();
            IMAGE_BASE[key].sprite.img[building].img.src = IMAGE_BASE[key].sprite.spriteSheetLocation;
        }
        console.log(IMAGE_BASE[key]);
    }
    if (typeof key == 'undefined' || typeof (IMAGE_BASE[key]) == "string" || typeof IMAGE_BASE[key].url == 'undefined') {
        continue;
    }
    IMAGE_BASE[key].img = new Image();
    if (!IMAGE_BASE[key].url.includes("https://data.mo.ee/")) {
        IMAGE_BASE[key].url = "https://data.mo.ee/" + IMAGE_BASE[key].url;
    }
    else {
        console.log(IMAGE_BASE[key].url);
    }
    IMAGE_BASE[key].img.src = IMAGE_BASE[key].url;
}
$.getJSON('https://rpg.mo.ee/version.js', function (data) {
    version = data.v;
    cache = data.c;
    map = new RpgMap();
    d3Helper = new D3Helper();
    d3Helper.drawGridAndGroundMask();
    function myLoop() {
        setTimeout(function () {
            if (typeof on_map_json[0] != "undefined") {
                map.render(0, true);
                console.log("Render");
                return;
            }
            myLoop();
        }, 30);
    }
    myLoop();
    //Retrieve JSONS from map
    map.mapNames.forEach(function (value, index) {
        var mapFile = document.createElement('script');
        mapFile.setAttribute("async", "");
        mapFile.setAttribute("defer", "");
        mapFile.setAttribute("type", "text/javascript");
        mapFile.setAttribute("src", "https://data.mo.ee/maps/map" + index + ".js?" + cache);
        document.getElementsByTagName("head")[0].appendChild(mapFile);
    });
    console.log("Window on load finished");
});
// var scale = 1
function ScrollZoom(container, max_scale, factor) {
    var target = container.children().first();
    var size = { w: target.width(), h: target.height() };
    var pos = { x: 0, y: 0 };
    var zoom_target = { x: 0, y: 0 };
    var zoom_point = { x: 0, y: 0 };
    var scale = 1;
    target.css('transform-origin', '0 0');
    target.on("mousewheel DOMMouseScroll", scrolled);
    function scrolled(e) {
        var offset = container.offset();
        zoom_point.x = e.pageX - offset.left;
        zoom_point.y = e.pageY - offset.top;
        console.log(zoom_point.x, zoom_point.y);
        e.preventDefault();
        var delta = e.delta || e.originalEvent.wheelDelta;
        if (delta === undefined) {
            //we are on firefox
            delta = e.originalEvent.detail;
        }
        delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency
        // determine the point on where the slide is zoomed in
        zoom_target.x = (zoom_point.x - pos.x) / scale;
        zoom_target.y = (zoom_point.y - pos.y) / scale;
        // apply zoom
        scale += delta * factor * scale;
        scale = Math.max(1, Math.min(max_scale, scale));
        // calculate x and y based on zoom
        pos.x = -zoom_target.x * scale + zoom_point.x;
        pos.y = -zoom_target.y * scale + zoom_point.y;
        // $maps.scrollTop();
        // $maps.scrollLeft();
        // Make sure the slide stays in its container area when zooming out
        if (pos.x > 0)
            pos.x = 0;
        if (pos.x + size.w * scale < size.w)
            pos.x = -size.w * (scale - 1);
        if (pos.y > 0)
            pos.y = 0;
        if (pos.y + size.h * scale < size.h)
            pos.y = -size.h * (scale - 1);
        // if(scale < 1)
        // pos.x = 0;
        update();
    }
    function update() {
        // var $maps = $("#Maps");
        target.css('transform', 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px) scale(' + scale + ',' + scale + ')');
    }
}
new ScrollZoom($('#mapsContainer'), 4, 0.1);
console.log("Window on load finished");
