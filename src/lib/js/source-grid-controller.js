import { get } from "svelte/store";
import { sourceGridColumnDefs, sourceGridAPI } from "$lib/stores/store-grid-manager";
import { get_linked_class, get_linked_parent, get_linked_root_parent } from "$lib/js/grid-data-helpers";

function toggle_edit_mode(state=true){
    // state = true: show
    // state = false: hide
    const colsToUpdate = {'edit-class': get_linked_class, 'edit-parent': get_linked_parent};

    // need to copy existing linked values into columns for editing
    copy_linked_column_values(colsToUpdate);
    
    sourceGridColumnDefs.update(curr => {
        curr.forEach(def => {
            if(Object.keys(colsToUpdate).includes(def?.field)){
                def.hide = !state;
                def.editable = state;
            }
        })
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

export { toggle_edit_mode }
