import { generateNewEntity, moveToPath } from '$lib/entity-operations.js'
import { addNewEntityRow } from '$lib/grid-operations';

// custom keypress capture and handler
function onCellKeyDown(e){
    const kc = e.event.keyCode; // easier to reference multiple times
    // SHIFT + ENTER
    if ( kc == 13 && e.event.shiftKey && !e.event.ctrlKey ){
        addNewEntityRow(e.api, e.node)
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
        const newNode = addNewEntityRow(e.api, newParent)
        // console.debug("New Node: ", newNode)
        // Add selected as children of node
        const updatedRows = [];
        selectedNodes.forEach(node => {
            moveToPath(newNode.data.subject_path, node, updatedRows);
        });
        e.api.applyTransaction({
            update: updatedRows,
        });
        e.api.clearFocusedCell();

    }
    // ARROWS (clear selection when arrows are used; user is cell editing)
    // Left: 37 Up: 38 Right: 39 Down: 40
    else if ( kc == 37 || kc == 38 || kc == 39 || kc == 40 ){
        e.api.deselectAll();
    }
}

export { onCellKeyDown }