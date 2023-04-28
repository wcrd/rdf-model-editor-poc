import { get } from "svelte/store";
import { sourceGridColumnDefs } from "$lib/stores/store-grid-manager";

function toggle_edit_mode(state=true){
    // state = true: show
    // state = false: hide
    const colsToUpdate = ['edit-class', 'edit-parent'];
    
    sourceGridColumnDefs.update(curr => {
        curr.forEach(def => {
            if(colsToUpdate.includes(def?.field)){
                def.hide = !state;
                def.editable = state;
            }
        })
        return curr
    })
}


export { toggle_edit_mode }
