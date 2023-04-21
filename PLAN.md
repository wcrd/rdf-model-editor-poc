# Interactive Tree Grid Builder

## Needs

* Go from a flat list to a nested one.
* Two types of rows
    * Entities
    * Points
* Points must be nested under an entity
* Pressing TAB will nest
    * Point under next entity above
    * Entity under next entity above
* Pressing {X} + TAB will create a new entity to nest under
* Drag and drop to nest as well
    * pnts can only be dragged to an entity
    * entities can only be dragged to an entity
    * in future; have list of allowable components to prevent un-auth entity nesting