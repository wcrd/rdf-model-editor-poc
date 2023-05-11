import { get } from "svelte/store";
import { sourceGridColumnDefs, sourceGridAPI, sourceEditedNodes } from "$lib/stores/store-grid-manager";
import { get_linked_class, get_linked_parent, get_linked_root_parent } from "$lib/js/grid-data-helpers";
import { modelGridAPI } from "$lib/stores/store-model-grid";
import { moveToPath, generatePoint } from '$lib/js/entity-operations'
import { addSourceLink } from '$lib/js/shared-transactions.js' 


function toggle_edit_mode(state=true){
    // state = true: show
    // state = false: hide

    // object with column names and function to fetch value to show
    const colsToUpdate = {'edit-class': get_linked_class, 'edit-parent': get_linked_parent};

    if(state){
        // need to copy existing linked values into columns for editing
        copy_linked_column_values(colsToUpdate);
    } 
    // need to process any changes
    else {
        // class changes
        // just apply the whole column, all values have been copied from the model grid on init
        // so they are the same.
        apply_updates();
        
    }

    // Show/hide editable columns
    sourceGridColumnDefs.update(curr => {
        curr.forEach(def => {
            if(Object.keys(colsToUpdate).includes(def?.field)){
                def.hide = !state;
                def.editable = state;
            }
        })
        return curr
    })

    // Disable/Enable row-dragging
    sourceGridAPI.update(curr => {
        curr.defaultColDef.rowDrag = !state;
        return curr
    })
}

function copy_linked_column_values(target_func_obj){
    const rowsToUpdate = [];
    
    // loop through grid rows and get updates
    get(sourceGridAPI).api.forEachNode(node => {
        // check if row is source for something in model
        if(node.data['source-for']){
            // check each row for updates
            for (const [target, func] of Object.entries(target_func_obj)){
                if(!func) continue; // nothing copy function
                // get value from function
                const srcVal = func(node);
                node.data[target] = srcVal;
                rowsToUpdate.push(node.data); // push for transaction update
            }
        }
    });

    // apply updates
    const res = sourceGridAPI._updateGrid({
        update: rowsToUpdate
    });

    return res
}

function apply_updates(){
    const modelRowsToUpdate = []
    const labelSubjectRef = {}; // this holds label-subject refrences for any entities created using just the label field for use by other updates in this transaction. i.e. users can assign points to entities via just the label. NEW points only.

    // use edited cells tracking object to apply update to model grid
    const cellsToProcess = get(sourceEditedNodes);
    console.log("Updating ", cellsToProcess.size, "entities.")


    cellsToProcess.forEach(srcNode => {

        // determine if source row is linked to a model row already
        const linkedNodeId = srcNode.data['source-for'];
        // console.debug("NODE: ", node, "Linked to Model: ", linkedNodeId)

        if(!linkedNodeId){ 
            // if source is not already linked to a model point
            // need to create a new model node!!
            console.debug("Unlinked mode. SrcNode: ", srcNode)

            // Create new point
            const newPointNode = modelGridAPI.addPointRow(null, { point_props: {cls: srcNode.data['edit-class']} })
            // link to source node
            addSourceLink(newPointNode, srcNode)

            // Process Parent
            // Process the parent field to see if any entity actions are required for this point.
            const parent_action = parse_parent(srcNode.data['edit-parent'])
            process_action(parent_action, newPointNode, modelRowsToUpdate, labelSubjectRef) // stores result in modelRowsToUpdate; process these updates at the end

        } else {

            console.debug("Linked mode. SrcNode: ", srcNode)

            // get model node to update
            const modelNode = get(modelGridAPI).api.getRowNode(linkedNodeId);
            // apply updates
            // Class
            modelNode.data.class = srcNode.data['edit-class'];
            // Parent
            // parse cell and get action
            const parent_action = parse_parent(srcNode.data['edit-parent'])
            // console.debug("Parent Action = ", parent_action)

            process_action(parent_action, modelNode, modelRowsToUpdate, labelSubjectRef)

            modelRowsToUpdate.push(modelNode.data);
        }
    });

    // apply transaction to model grid
    modelGridAPI._updateGrid({ update: modelRowsToUpdate });
    // console.debug(res)

    // clear change tracking
    sourceEditedNodes.update(curr => { curr.clear(); return curr } )

    return
}

// parse parent cell json node for use in update logic
function parse_parent(parent_data){

    if (!parent_data || parent_data == {} || Object.values(parent_data).every(v => !v)){
        // no parent data provided;
        // To handle case where a parent is removed, this should be a 'move' operation with no target (i.e. move to root)
        return {
            operation: "move",
            error: false,
            targetNode: null
        }
    }

    // if subject defined, then we need to check if it exists already in the model
    if(parent_data?.subject){

        const modelNode = get(modelGridAPI).api.getRowNode(parent_data.subject);
        
        if(modelNode){ // subject exists, check other fields, if provided
            if((parent_data?.class ? modelNode.data.class == parent_data.class : 1) & (parent_data?.label ? modelNode.data.label == parent_data.label : 1)){
                // valid reference as all fields match; return this as new parent
                return {
                    operation: "move",
                    error: false,
                    targetNode: modelNode
                }
            } 
            else {
                // the parent subject provided is inconsistent with any model nodes
                // editing class or label from source for existing model node is not allowed
                // abort
                console.log("Cannot process parent change due to inconsistent parent reference. No model node exists with these properties: ", parent_data)
                return {
                    error: true,
                }
            }
        } 
        else { // no entity with given subject found in model, create it.
            return {
                error: false,
                operation: "create",
                ctx: parent_data, // params for new entity
                label_mode: false // create new entity based on subject; not on a label ref.
            }
        }
    } 
    else { // if no subject, then a new entity will be created using provided label(/class), or via just provided class.
        return {
            error: false,
            operation: "create",
            ctx: parent_data, // params for new entity
            label_mode: !!parent_data?.label // if label is provided then need to check label ref object for newly created nodes absed on that label.
        }
    }
}

function process_action(action, modelNode, modelRowsToUpdate, labelSubjectRef){
    // action = action object
    // modelNode = node to apply action to
    // modelRowsToUpdate = reference to shared array containing record of nodes updated
    // NOTE: The point node must exist to process any parent actions (i.e. can't be a pending update)

    if(action.error) return false;

    if(action.operation=="no-op"){
        return false
    }
    else if(action.operation=="move"){
        moveToPath(action.targetNode?.data.subject_path || [], modelNode, modelRowsToUpdate)
    }
    else if(action.operation=="create"){
        let entityNode;

        // if label mode need to:
        // * check label-subject object to see if a new entity has been created in this update for the given label; if just do a move operation to this entity
        // * if not, create new entity, record in label-subject ref.
        if(action?.label_mode){
            // check ref object for newly created entities
            if(action.ctx.label in labelSubjectRef) {
                entityNode = get(modelGridAPI).api.getRowNode(labelSubjectRef[action.ctx.label]);
                // console.debug("Label mode. Found existing entity: ", entityNode)
            } else {
                // create new entity and add to ref
                entityNode = modelGridAPI.addEntityRow(null, { entity_props: {...action.ctx, cls: action.ctx?.class} })
                labelSubjectRef[action.ctx.label] = entityNode.data.subject
                // console.debug("Label mode. Created new entity: ", entityNode)
            }
        }
        else { // create new entity
            entityNode = modelGridAPI.addEntityRow(null, {entity_props: {...action.ctx, cls: action.ctx?.class}}) // need to manually reassign class key as it is reserved. TODO: rename this in cell editor to cls
        }

        // move model point to new parent
        moveToPath(entityNode.data.subject_path, modelNode, modelRowsToUpdate)

    } else {
        console.log("Unsupported operation. Op: ", action, "on node: ", modelNode)
        return false
    }
}

export { toggle_edit_mode }
