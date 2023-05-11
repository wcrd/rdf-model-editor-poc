import { moveToPath } from '$lib/js/entity-operations.js'
import { modelGridAPI } from '$lib/stores/store-model-grid';

// custom keypress capture and handler for the modelGrid
function onCellKeyDown(e){
    const kc = e.event.keyCode; // easier to reference multiple times
    // SHIFT + ENTER
    if ( kc == 13 && e.event.shiftKey && !e.event.ctrlKey ){
        // addNewEntityRow(e.api, e.node)
        modelGridAPI.addEntityRow(e.node);
    }
    // CTRL + SHIFT + ENTER
    else if (kc == 13 && e.event.shiftKey && e.event.ctrlKey ){
        // console.debug(e)
        // Gather selected
        const selectedNodes = e.api.getSelectedNodes();
        // console.debug("Selected Nodes: ", selectedNodes)
        // Check that all have same parent
        const parents = new Set(selectedNodes.map(node => node?.parent))
        // console.debug("Parents: ", parents)
        if ( parents.size != 1) { console.log("Auto nesting entities with different parents not allowed."); return }
        const [newParent] = parents; // extract parent from set 
        // Write new node
        // const newNode = addNewEntityRow(e.api, newParent)
        const newNode = modelGridAPI.addEntityRow(newParent);
        // console.debug("New Node: ", newNode)
        // Add selected as children of node
        const updatedRows = [];
        selectedNodes.forEach(node => {
            moveToPath(newNode.data.subject_path, node, updatedRows);
        });
        // e.api.applyTransaction({
        //     update: updatedRows,
        // });
        modelGridAPI._updateGrid({ update: updatedRows })
        e.api.clearFocusedCell();

    }
    // TAB
    else if ( kc == 9 && !e.event.shiftKey ){
        console.debug("I'm tabbin away here")
        // if at root
        // > if entity: nest under new entity
        // > if point
    }
    // SHIFT-TAB
    else if ( kc == 9 && e.event.shiftKey ){
        console.debug("I'm shift-tabbin away here")
    }
    // ARROWS (clear selection when arrows are used; user is cell editing)
    // Left: 37 Up: 38 Right: 39 Down: 40
    else if ( kc == 37 || kc == 38 || kc == 39 || kc == 40 ){
        e.api.deselectAll();
    }
}

export { onCellKeyDown }