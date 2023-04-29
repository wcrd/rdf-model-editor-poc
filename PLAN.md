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

### Model Grid

* UI
  * [ ] Toggle to control whether path is shown as label or subject
  * [ ] Add row highligh fade style to rows that have just been moved. ~3s.
  * [ ] Indicator column showing if there is source point linked? like little dot at start.
* UX
  * [HOLD] Tabbing to nest
    * [ ] Tabbing highlighted rows nests or unnested them, if available.
    * [ ] THIS IS MORE COMPLEX THAN THIS; parking for now. See branch: tab-captures
  * [ ] need to suppress shift enter opening drop downs
* Data
  * [ ] force unique on model subject column
  * [ ] Add combo in class selector

### Source Grid

* UI
  * [ ] Toggle to control whether parent/root shows subject or label
* Editing
  - [ ] add valueSetter handlers to allow path and subject editing
  * [ ] creating/updating
    * [x] update/set class
    * [ ] pnt not in model yet
      * [ ] No entity
      * [ ] entity
        * [ ] class + no subject
        * [ ] class + subject
        * [ ] subject only (same as class + subject; we should auto populate class on subject selection)
          * [ ] Offer dropdown in this cell?
    * [ ] Cannot update parent/root class if subject is set. Can only make new subject.
      * [ ] To set a class for source points they must be 'assigned' to a new entity. Once the entity is created, entity class cannot be changed from the source grid. Must be done in model grid. This is because it is not good ux when changing parent/root class in source; it would affect all other points assigned to that entity. Would need to loop through an update on the fly. I think it is better to allow static changes, that are processed on edit completion.
  * [ ] Capture edits that are not OK on processing
    * [ ] Store var for this?
    * [ ] Highligh src rows red where processing failed
    * [ ] Clear other nodes that we successfully processed.

### General Grid
* UX
  * [ ] Shift + Arrow highlights
  * [ ] Add range selection with mouse

### Ontology
* Ontology Grid
  * [ ] Side grid to show tree of classes
* Ontology Manager
  * [ ] Modal? to show ontologies in use for this model
  * [ ] Ability to upload / add ontology data; this can come later, by default will offer Brick and btg.com ontologies.

### Cross Grid Drag
* [ ] Single src row + ctrl creates new point entity
- [ ] Prevent drag-and-drop operations in edit mode

### Filtering

### Functions

### System

* Storage
  * [ ] Persist between sessions
* [ ] Upload data into points src grid
* [ ] Export model to ttl
* [ ] Undo