# Botwars Rules

## Turns
Botwars is played turn by turn. Every client needs to read the game state and submit commands for their units before the next turn is run. After the turn is run the server will send the new state to all connected clients. The turn length is currently 500 milliseconds (1/2 of a second).

## Grid
The game is played on a grid. Each thing in the game has an X and a Y position. If you go north the Y coordinate gets smaller, if you go south the Y coordinate gets bigger. If you go east the X coordinate gets bigger, if you go west the X coordinate gets smaller. Negative numbers are allowed, and there are not controlled maximum or minimum bounds outside the range of numbers javascript can represent. You may see the following notation in this document (5, 6) this means that the X coordinate is 5 and the Y coordinate is 6.

## Pawns
Pawns are the only unit you can control. You could have 1 or you could have 100000 to control. The pawn can do the following things per turn:

* Move in the direction the pawn is facing
* Turn right or left
* Mine in the direction the pawn is facing
* Pick up an item sitting next to the pawn in the direction the pawn is facing
* Drop an item next to the pawn based on where it is facing
* Build a building
* Activate a building (Activate Factories to build more pawns)
* Attack in the direction facing.
* Install batteries to increase pawn charge (charge command)

Pawns have a charge. If the charge runs out the pawn can no longer do anything. A pawn may get more charge by picking up batteries and charge using those batteries.

Pawns have a field of view. Anything in the field of view of a pawn is visible to the pawn's owner. You will want to have a set of pawns partrolling or guarding to maintain vision.

Pawns also have health. If their health reaches zero, they will be destroyed along with what they were carrying.


## Ore
You get ore by mining ore patches. Ore patches restock over time, so you will get more yield per mine attempt if you leave ore patches alone for a while. Remember that mining costs energy, so it may be best to wait it out.

## Items
Items are things that your pawn can carry around and use. Currently there are only two items: ore and batteries.

You can have as many items as you want stack on the ground, but after 100 items, they start to decay. You can build buildings to increase that limit for a tile.

### Ore
Ore you get via mining ore patches. See Ore. Ore is the main construction material. You use ore to build buildings and more pawns.

### Batteries
Batteries you get via solar buildings. Batteries can be used to charge pawns and keep them from running out of energy and shutting down.

## Starting
When you first register you will be giving one pawn facing north at (0, 0). At (0, -1) you will have a ore patch. This is just the current behavor. Things will change as the project matures.

## Buildings
Buildings can be built by pawns. Buildings cost ore to build. When you pick a build site. The building will be constructed by ore sourced from a 3x3 tile radius around the building.

Buildings have health. If their health is reduced to zero, they are destroyed.

The following types of buildings are avaiable. More will be coming as the project matures:
* smallSolar - Produces a small amount of batteries per turn
* smallFactory - Produces pawns when activated and ore is pressent
* smallStorage - Increases the amount of items that can be stacked on a tile without item decay.

### Solars
Solars create batteries right on top of themselves. They will keep creating batteries, but they will appear to stop at the item decay limit. 

### Factories
Factories build pawns when activated. The factory will look for the required ore in a 3x3 tile surrounding the factory.

## Terrain
You will run into walls and paths. Walls are not passable by pawns, and there is no way to remove them. Paths decrease power cost of moving and rotating.

## Combat
Pawns can be commanded to attack what they are facing. Friendly fire is allowed, so be careful.

Pawns have a 3x3 zone of control (Not implemented yet). If a pawn from a different user enters the zone of control, they may not move to another tile in the zone of control. Using this, you can create blockades without blocking your own routes out of your defended area.


