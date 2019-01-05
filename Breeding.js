var current_map = 300;
var on_map = [];
var BreedingMod;
(function (BreedingMod) {
    var Controller = /** @class */ (function () {
        function Controller() {
            this.nests = ["Empty"];
            this.selectedNest = 0;
            this.initializeDom();
            this.removeOldListeners();
            this.findNests();
            this.createPairs();
            this.insertPetHTML();
            this.addListeners();
            this.setUpInterval();
            this.initializeListeners();
        }
        ;
        Controller.prototype.findNests = function () {
            var tempNests = [];
            for (var x in on_map[300]) {
                if (on_map[300][x] != undefined) {
                    for (var j in on_map[300][x]) {
                        if (on_map[300][x][j] != undefined && on_map[300][x][j].params != undefined && on_map[300][x][j].b_i == 479) {
                            tempNests.push({
                                "x": on_map[300][x][j].i,
                                "y": on_map[300][x][j].j
                            });
                        }
                    }
                }
            }
            if (JSON.stringify(tempNests) === JSON.stringify(this.nests)) {
                return;
            }
            this.nests = tempNests;
        };
        ;
        Controller.prototype.createPairs = function () {
            this.nestPair = [];
            var tempPetPair = [];
            //loop goes through each nests and finds a pair nest
            for (var nest in this.nests) {
                console.log("Nest in loop", nest, this.nests);
                var currentlySelected = on_map[300][this.nests[nest].x][this.nests[nest].y];
                if (currentlySelected.params.other_nest == undefined) {
                    return;
                }
                var other_nest_x = currentlySelected.params.other_nest.i + 10;
                var other_nest_y = currentlySelected.params.other_nest.j + 10;
                console.log("Nest before parse int", nest);
                for (var z = parseInt(nest); z < this.nests.length; z++) {
                    tempPetPair = [];
                    //pair nests are pushed together as a Pair array ( tempPetPair[] ) and then into array storing all arrays ( nestPair[] ).
                    if (other_nest_x == this.nests[z].x && other_nest_y == this.nests[z].y) {
                        tempPetPair.push(on_map[300][this.nests[nest].x][this.nests[nest].y]);
                        tempPetPair.push(on_map[300][this.nests[z].x][this.nests[z].y]);
                        this.nestPair.push(tempPetPair);
                    }
                }
            }
            console.log(this);
        };
        ;
        Controller.prototype.initializeDom = function () {
            var link = document.createElement("link");
            link.href = "https://dl.dropboxusercontent.com/s/6hn85tw23v73zb1/breeding_mod.css";
            link.type = "text/css";
            link.rel = "stylesheet";
            $("head").appendChild(link);
            var str = "<div id='breeding_pets'>\
                    <div class='breeding_menu'>\
                        <div id='breeding_menu_close' class='breeding_menu_options'>\
                            Close\
                        </div>\
                        <div id= 'breeding_menu_refresh' class='breeding_menu_options'>\
                            Refresh\
                        </div>\
                        <div class='breeding_menu_options breeding_header'>\
                            Breeding Helper Mod v0.8.0\
                        </div>\
                    </div>\
                </div>";
            document.getElementsByTagName("body")[0].insertAdjacentHTML('beforeend', str);
        };
        Controller.prototype.openNest = function (elem) {
            if (current_map !== 300) {
                return;
            }
            console.log(this);
            var i = elem.toElement.id.match(/\d+/)[0];
            this.selectedNest = i;
            pet_nest = on_map[300][this.nests[i].x][this.nests[i].y];
            Breeding.open_nest();
        };
        Controller.prototype.nextNest = function () {
            console.log("Hotkey");
            if (current_map !== 300) {
                return;
            }
            pet_nest = on_map[300][this.nests[this.selectedNest].x][this.nests[this.selectedNest].y];
            Breeding.open_nest();
            this.selectedNest++;
            if (this.selectedNest == this.nests.length) {
                this.selectedNest = 0;
            }
        };
        Controller.prototype.setUpInterval = function () {
            var _this = this;
            var wait = false;
            var audio;
            audio = new Audio('https://dl.dropboxusercontent.com/s/t3xqbmi7jw5vy8v/glass_ping-Go445-1207030150.mp3');
            audio.volume = 0.2;
            this.update = setInterval(function () {
                var nestId = 0;
                _this.nests.forEach(function (nest) {
                    if (wait == false && Breeding.get_pet_hunger(on_map[300][nest.x][nest.y], on_map[300][nest.x][nest.y]) >= 75 && Breeding.get_pet_hunger(on_map[300][nest.x][nest.y], on_map[300][nest.x][nest.y]) !== 100) {
                        audio.play();
                        wait = true;
                    }
                    var $happiness = document.getElementById("pet_" + nestId + "_happiness");
                    var $hunger = document.getElementById("pet_" + nestId + "_hunger");
                    if (on_map[300][nest.x][nest.y].params.pet_id != null) {
                        $happiness.style.width = Breeding.get_pet_happiness(on_map[300][nest.x][nest.y], on_map[300][nest.x][nest.y]) + "%";
                        $happiness.innerHTML = Breeding.get_pet_happiness(on_map[300][nest.x][nest.y], on_map[300][nest.x][nest.y]) + "%";
                        $hunger.style.width = Breeding.get_pet_hunger(on_map[300][nest.x][nest.y], on_map[300][nest.x][nest.y]) + "%";
                        $hunger.innerHTML = Breeding.get_pet_hunger(on_map[300][nest.x][nest.y], on_map[300][nest.x][nest.y]) + "%";
                    }
                    else {
                        $happiness.style.width = "0%";
                        $happiness.innerHTML = "Add";
                        $hunger.style.width = "0%";
                        $hunger.innerHTML = "Pet";
                    }
                    nestId++;
                });
                wait = false;
            }, 1000);
        };
        Controller.prototype.insertPetHTML = function () {
            var _this = this;
            var nestId = 0;
            var petId = 0;
            var $holder = document.getElementById("breeding_pets");
            this.nestPair.forEach(function (nests) {
                $holder.insertAdjacentHTML('beforeend', "<div id='breeding_nest_" + nestId + "' class='breeding_nests'></div>");
                var $nest = document.getElementById("breeding_nest_" + nestId);
                nests.forEach(function (nest) {
                    //if (on_map[300][nest.i][nest.j].params.pet_id != null) {
                    $nest.insertAdjacentHTML('beforeend', _this.constructPetHTML(petId));
                    //} else {
                    //    $nest.insertAdjacentHTML('beforeend', this.constructEmptyPetHTML(petId));
                    //}
                    petId++;
                });
                nestId++;
            });
        };
        Controller.prototype.constructEmptyPetHTML = function (nestId) {
            return "<div id='breeding_pet_" + nestId + "' class='breeding_pair'>\
                <div id='pet_" + nestId + "_pic' class='breeding_pic breeding_empty_pic'></div>\
                <div class='breeding_progress_bar breeding_empty'>Add pet.</div>\
            </div>";
        };
        Controller.prototype.constructPetHTML = function (nestId) {
            return "<div id= 'breeding_pet_" + nestId + "' class='breeding_pair'>\
                    <div id='pet_" + nestId + "_pic' class='breeding_pic'></div>\
                    <div class='breeding_bars_container'>\
                        <div class='breeding_progress_bar'>\
                            <div id= 'pet_" + nestId + "_happiness' class='breeding_bar_happiness'></div>\
                        </div>\
                        <div class='breeding_progress_bar' >\
                            <div id='pet_" + nestId + "_hunger'  class='breeding_bar_hunger'></div>\
                        </div>\
                    </div>\
                </div>";
        };
        Controller.prototype.addListeners = function () {
            for (var i in this.nests) {
                console.log("Added", i);
                document.getElementById("breeding_pet_" + i).addEventListener("click", this.openNest.bind(this), false);
            }
            ;
        };
        Controller.prototype.removeOldListeners = function () {
            if (this.nests != null) {
                for (var i in this.nests) {
                    console.log("removed", i);
                    var $elem = document.getElementById("breeding_pet_" + i);
                    if ($elem != null) {
                        $elem.removeEventListener("click", this.openNest.bind(this), false);
                    }
                }
                ;
            }
        };
        Controller.prototype.initializeListeners = function () {
            var _this = this;
            document.addEventListener("keydown", function (b) {
                //223 UK, 220 others
                if (b.keyCode === 220)
                    (_this.nextNest());
            });
            //Add refresh listener
            //Add close/ Open listeners
        };
        Controller.$inject = ['$scope', '$element'];
        return Controller;
    }());
    BreedingMod.Controller = Controller;
})(BreedingMod || (BreedingMod = {}));
var AppTest = new BreedingMod.Controller();
//# sourceMappingURL=Breeding.js.map