import { get } from "svelte/store";
import { sourceGridColumnDefs, sourceGridAPI, sourceEditedNodes } from "$lib/stores/store-grid-manager";
import { get_linked_class, get_linked_parent, get_linked_root_parent } from "$lib/js/grid-data-helpers";
import { modelGridAPI } from "../stores/store-grid-manager";
import { createNewPointAtNode, moveToPath, createNewPointAtNodeWithParams } from '$lib/js/entity-operations'
import { addRowsToGrid, addNewEntityRowWithParams } from '$lib/js/grid-operations'

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

        // Parent changes
        // TODO

        // Other changes
        // TODO
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
    const res = get(sourceGridAPI).api.applyTransaction({
        update: rowsToUpdate
    });

    return res
}

function apply_updates(){
    const modelRowsToUpdate = []
    // use edited cells tracking object to apply update to model grid
    const cellsToProcess = get(sourceEditedNodes);
    console.log("Updating ", cellsToProcess.size, "entities.")
    cellsToProcess.forEach(node => {
        const linkedNodeId = node.data['source-for'];
        if(!linkedNodeId){ 
            // if source is not already linked to a model point
            // need to create a new model node!!
            console.debug("Need to create a new model node for: ", node)
            // check if a parent class, or parent subject has been specified
            // we only support creating new entities or changing point assignment. 
            // Editing existing entities is not possible in the source grid.
            console.debug("New node: ", node.data['edit-class'], node.data['edit-parent'])
            // create point entity
            // TODO: this is same as entity-operations. Refactor.
            // need to insert at same path as overnode
            let newRow = createNewPointAtNode({});
            newRow.source = node.id;
            newRow.class = node.data['edit-class']
            node.data['source-for'] = newRow.subject
            // add to model grid
            addRowsToGrid(get(modelGridAPI).api, [newRow])
            // refresh source grid
            get(sourceGridAPI).api.applyTransaction({
                update: [node.data]
            });

            // if parent
            
                // if exists
                    // move point into parent
                // if not
                    // create entity
                    // move point into entity
        } else {
            // get model node to update
            const modelNode = get(modelGridAPI).api.getRowNode(linkedNodeId);
            // apply updates
            // Class
            modelNode.data.class = node.data['edit-class'];
            // Parent
            // parse cell and get action
            const par_action = parse_parent(node.data['edit-parent'], modelGridAPI)
            // console.debug(par_action)
            process_action(par_action, modelNode, modelRowsToUpdate)
            // TODO: Others

            modelRowsToUpdate.push(modelNode.data);
        }
    });

    // apply transaction to model grid
    const res = get(modelGridAPI).api.applyTransaction({
        update: modelRowsToUpdate
    });
    // console.debug(res)

    // clear change tracking
    sourceEditedNodes.update(curr => { curr.clear(); return curr } )

    return res
}

// parse parent cell json node for use in update logic
function parse_parent(parent_data, modelGridAPI){
    // if subject defined, then we need to check if it exists already in the model
    if(parent_data?.subject){
        const modelNode = get(modelGridAPI).api.getRowNode(parent_data.subject);
        // console.debug("Model node: ", modelNode)
        
        if(modelNode){ // subject exists, check other fields, if provided
            if((parent_data?.class ? modelNode.data.class == parent_data.class : 1) & (parent_data?.label ? modelNode.data.label == parent_data.label : 1)){
                // valid reference; return this as new parent
                return {
                    operation: "move",
                    error: false,
                    targetNode: modelNode
                }
            } else {
                // the parent object provided is inconsistent with model node
                // editing class or label from source for existing model node is not allowed
                // abort
                console.log("Cannot process parent change due to inconsistent parent reference. No model node exists with these properties: ", parent_data)
                return {
                    error: true,
                }
            }
        } else { // no entity in model, create it.
            return {
                error: false,
                operation: "create",
                ctx: parent_data,
                label_mode: false
            }
        }
    } else { // if no subject, then a new entity will be created
        return {
            error: false,
            operation: "create",
            ctx: parent_data,
            label_mode: !!parent_data?.label
        }
    }
}

function process_action(action, node, modelRowsToUpdate){
    // action = action object
    // node = node to apply action to
    // modelRowsToUpdate = reference to shared array containing record of nodes updated
    if(action.error) return false;

    if(action.operation=="move"){
        // console.debug("Moving point: ", node, " to node: ", action.node)
        moveToPath(action.targetNode.data.subject_path, node, modelRowsToUpdate)
        return true
    }
    else if(action.operation=="create"){
        // check for label in current transaction record (assign to same subject if so)
        // create new entity
        // console.debug(node)
        const newEntity = addNewEntityRowWithParams(get(modelGridAPI).api, null, {...action.ctx, cls: action.ctx?.class}) // need to manually reassign class key as it is reserved. TODO: rename this in cell editor to cls
        // console.log(res_ent)
        // move existing model point to new parent
        moveToPath(newEntity.data.subject_path, node, modelRowsToUpdate)
        return true
    } else {
        console.log("Unsupported operation. Op: ", action, "on node: ", node)
        return false
    }
}

export { toggle_edit_mode }
