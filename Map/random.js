var NO_HEAD_HELMETS = [140, 141, 143];
var GENDER = { "MALE": 1, "FEMALE": 0 };
var GENDER_HEADS = {
    "1": [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28],
    "0": [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55]
};
var item_base = [];
var BASE_TYPE = {
    OBJECT: "1",
    1: object_base,
    GROUND: "2",
    2: ground_base,
    ITEM: "3",
    3: "item_base",
    NPC: "4",
    4: npc_base,
    PLAYER: "5",
    5: "players",
    PET: "6",
    6: "pets"
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