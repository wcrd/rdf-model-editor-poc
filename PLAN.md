# Interactive Tree Grid Builder

## State
* branch: templates-loader-fix
* merge into templates when done
* There is an issue in loading the templates that needs to be fixed.

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
Today:
* UPDATE SHAPE PROCESSING
  * Use DualDamper VAV shape -> need to path by id, at the moment it is by class which doesn't allow for multiple components. Using the id path will also make it easier for the context menu to generate the shape in the model.
* Shape & ontology grid
  * Add better method to track active grid; update buttons and filter to reference this.
  * Add function buttons to assign class only, or class path - this need thinking
    * Add buttons to component to control this
    * Can set if nothing is set && a subject is assigned (need to know how to nest)
      * How do we handle multiple fans in same entity?
* (LEAVE FOR NOW) Storage
  * Upgrade methods and grids to track changes, then only push changes rows into IndexDB to save iterating the whole table.
* Model Ont needs to remember state b/w refresh calls
* (HOLD) Combo class selector -> this might not be required though; could do cell edit just opens the ontology panel? Adds a 'select' button in search box? On Enter or click class is applied?

Current:
* Import model
* Import sources
* Add entity from template
* Unnest entity to root
* Auto match selection (from source) when dragging onto an entity from template
* Source edit -> add to existing entity by label, if no dups. This will be easiest way to use scripts.

* Process updates to parent objects in edit mode as part of applying update routine.
* ( Review this - may have already been done) Need to cleanup the apply_updates logic. It is too messy. Process_Parent probably needs a re-write
  * CASES:
    * src not in model; adding point to existing entity
    * Removing parent from src; currently nothing happens due to no-op.

Ontology
* Updates not workign properly
  * Add 'unclassified' as ontology option
  * Update update calls to be in a function with some smarts

* Status bar to show count of rows, entities, linked, etc.
* Overlay to show on model when processing updates from source.

Storage
* Add 'sync' to indexDB from store every x minutes. Provide force sync button.

## Future Ideas
* Using IndexedDB it is easy to have multiple models & source sets, could add a browser so users can swap between stored models without needing to import/export

## Structure Overhaul


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
  * [X] Toggle to control whether parent/root shows subject or label
* Editing
  - [ ] add valueSetter handlers to allow path and subject editing
  * [X] UPDATING/CREATING LOGIC
    * [x] update/set class
    * [X] IF source point not in model yet
      * [X] IF parent is not set
        * Create new point model node at root & link
      * [X] ELSE IF parent is set (case for JSON keys):
        * [X] **subject** (if subject is set, then we need to search for it)
          * Find subject in model and get row
          * [X] IF exists:
            * If **class** | **label** check that these match
              *  If match:
                 *  Create point and assign to subject provided
              *  Else:
                 *  Error - might be a mistaken assignement. Do not process change. Add to error list and move on.
          * [X] ELSE need to create a new entity
            *  create new entity with subject (and class, and label) and add point entity to it.
        * [X] **!subject** (only new entity creation here)
          * [X] **class** & **!label**
            * Creates new entity of class and nests point.
          * [X] **class** & **label**
            * Creates new entity of class and label and nests point.
            * Stores a temporary ref to the new subject for this label. Any other points during the current save loop that have class & label, or just label that matches will be assigned to this subject as well. 
          * [X] **!class** & **label**
            * Same as class & !subject & label; except no class will be set.
    * [X] ELSE source point is already linked to model; only thing allowed here it to re-assign to a new entity by subject reference.
      * Same process as **subject** above.
  * [X] EDIT OBJECT IN CELL? Atm it shows [Object Object]
    * [ ] Support shorthand class::subject; convert on edit
    * [ ] ~~Only show class, subject in edit field. Hide label.~~
  * [X] Cannot update parent/root class if subject is set. Can only make new subject.
    * [X] To set a class for source points they must be 'assigned' to a new entity. Once the entity is created, entity class cannot be changed from the source grid. Must be done in model grid. This is because it is not good ux when changing parent/root class in source; it would affect all other points assigned to that entity. Would need to loop through an update on the fly. I think it is better to allow static changes, that are processed on edit completion.
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
* [x] Single src row + ctrl creates new point entity
  * [ ] Need to reset highlight/insert line when ctrl is pressed or released
- [ ] Prevent drag-and-drop operations in edit mode
  - Need to check API docs on how to re-apply default col defs.

### Filtering

### Functions

### System

* Storage
  * [ ] Persist between sessions
* [ ] Upload data into points src grid
* [ ] Export model to ttl
* [ ] Undo