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


## To Do

* Add row highligh fade style to rows that have just been moved. ~3s.
* Selection
  * [x] Row Selected on Click, Ctrl/Shift Click
  * [x] Cell celected on double click
  * [x] Cell selected on keyboard arrow movement
  * [x] Rows unselect on keyboard arrow movement or cell double click
* New Rows
  * [x] Shift+Enter creates new row at selection level (selected cell; i.e. last click)
  * [x] Ctrl+Shift+Enter creates new entity and moves anything selected inside as child.
* Highlighting <- Needs to happen before New Rows work
  * Shift+arrows should also highlight
* Tab
  * Tabbing highlighted rows nests or unnested them, if available.
  * THIS IS MORE COMPLEX THAN THIS; parking for now. See branch: tab-captures
* Undo

* need to suppress shift enter opening drop downs
---

* Storage
  * Persist between sessions
* Upload data into points src grid
* Export 'save file'
* Load 'save file'
* Export model to ttl