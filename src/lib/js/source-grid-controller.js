import { get } from "svelte/store";
import { sourceGridColumnDefs, sourceGridAPI, sourceEditedNodes } from "$lib/stores/store-grid-manager";
import { get_linked_class, get_linked_parent, get_linked_root_parent } from "$lib/js/grid-data-helpers";
import { modelGridAPI } from "../stores/store-grid-manager";

function toggle_edit_mode(state=true){
    // state = true: show
    // state = false: hide

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
            // need to create a new model node!!
            console.debug("Need to create a new model node for: ", node)
            // check if a parent class, or parent subject has been specified
            // we only support creating new entities or changing point assignment. 
            // Editing existing entities is not possible in the source grid.
            console.debug("New node: ", node.data['edit-class'], node.data['edit-parent'])
        } else {
            // get model node to update
            const modelNode = get(modelGridAPI).api.getRowNode(linkedNodeId);
            // apply updates
            // Class
            modelNode.data.class = node.data['edit-class'];
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

export { toggle_edit_mode }
