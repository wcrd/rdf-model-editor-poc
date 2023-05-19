import { get } from "svelte/store";
import { moveToPath } from "$lib/js/entity-operations";
import { sourceGridAPI, dragMode } from "$lib/stores/store-grid-manager";
import { modelGridAPI, potentialParent } from "$lib/stores/store-model-grid";
import { refreshRows } from "$lib/js/common-grid";
import { isSelectionParentOfTarget, arePathsEqual } from "$lib/js/ontology-helpers";

// ###################################################
// Row moving controllers
//

function onRowDragEnter(params) {
    // set global drag mode to model-on-model
    if(!get(dragMode)) dragMode.set("model-to-model");
}

function onRowDragMove(params) {
    if(get(dragMode) == "model-to-model"){
        // console.debug("native grid move: ", params)
        const rowsToRefresh = setPotentialParentForNode(params.overNode)
        refreshRows(params.api, rowsToRefresh)
    }
}

function onRowDragLeave(params){
    // reset all potential variables
    console.debug("You left the grid yo stupid fok")
    setPotentialParentForNode(params.api, null);
    setPotentialInsertNode(params.api, null);
    // clear grid highlights
    refreshRows(gridApi, rowsToRefresh)

    // reset global drag mode
    dragMode.set(null)
    return
}


function onRowDragEnd(params) {
    // if internal model drag
    if( get(dragMode) == "model-to-model" ) {
        const currPotentialParent = get(potentialParent);
        const newParentPath = currPotentialParent.data ? currPotentialParent.data.subject_path : [];

        // filter to just nodes that need parents updated
        const nodesToChangeParent = params.nodes.filter((node) => {
            if (!arePathsEqual(newParentPath, node.data.subject_path)) {
                return true
            };
            return false
        });

        // check if any nodes that are being updated are being moved into their own child
        const invalidMode = nodesToChangeParent.some(node => isSelectionParentOfTarget(node, currPotentialParent));
        if (invalidMode) {
            console.log('Not allowed.');
        }

        if (nodesToChangeParent.length > 0 && !invalidMode) {
            const updatedRows = [];
            // for each node, lets move path
            nodesToChangeParent.forEach(node => {
                moveToPath(newParentPath, node, updatedRows);
            });

            modelGridAPI._updateGrid({update: updatedRows})
            params.api.clearFocusedCell();
        }

        // clear node to highlight
        const rowsToRefresh = setPotentialParentForNode(null);
        refreshRows(params.api, rowsToRefresh)

        // refresh source grid so linked-data fields are re-fetched
        get(sourceGridAPI).api.refreshCells({ columns: ['linked-class', 'linked-parent', 'linked-root-parent']});
    }
}

//
//
//

function setPotentialParentForNode(overNode) {
    let newPotentialParent = null;
    let currPotentialParent = get(potentialParent);

    // set parent to node we are hovering near
    if (overNode) {
        newPotentialParent =
            overNode.data?.type === 'entity'
                ? // if over an entity, we take the immediate row
                overNode
                : // if over a point, we take the parent row (which will be an entity, or root)
                overNode.parent;
    }

    // check if it is the current parent
    const alreadySelected = currPotentialParent === newPotentialParent;
    if (alreadySelected) {
        return false; // exit early, nothing to change
    }

    // if a new parent, lets remove highlight from old potential parent and highligh this one
    // we refresh the previous selection (if it exists) to clear
    // the highlighted and then the new selection.
    const rowsToRefresh = [];
    if (currPotentialParent) {
        rowsToRefresh.push(currPotentialParent);
    }
    if (newPotentialParent) {
        rowsToRefresh.push(newPotentialParent);
    }

    potentialParent.set(newPotentialParent);

    return rowsToRefresh
};

const modelModelDragHandlers = {
    onRowDragEnd, onRowDragMove, onRowDragEnter, onRowDragLeave
}

export {  
        modelModelDragHandlers    
}