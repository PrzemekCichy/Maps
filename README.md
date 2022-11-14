# Maps
Credits for game files go to https://mo.ee/credits.html 

## Interactive Maps

This is a interactive map viewer for an online MMORPG. 

### Use online at:
https://przemekcichy.github.io/Maps/Map/map.html

Functionality:
* Cheese one out 44 different maps
* Pan around map to see different sections
* Draw misc objects on the map for clarity:
  * Highlight NPC's and PvE Mobs
  * Draw Lines for grid visbility
  * Place Overlay to separate Layers
* Control visibility properties of the misc layer
* Clustering algorithm to group Cluster mobs together based on location 
* Place a marker on the central moblocation for each cluster
* Sidebar which can pan the map to the area containing the selected mob

TODO:
* List NPC's
* Improve UI
* Add Monster Clusters opacity/colour controls to UI
* Save controls values to LocalStorage
* Apply custom options after map change (currently uses default until user inputs anything again)
* Add additional models to clustering algorithm - struggles in some scenarios.
* Add monsters/npc outline - probably impossible to do easily
* Zoom
* Connected maps buttons
* Shade unsafe areas around the mob
