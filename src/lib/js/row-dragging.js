import { moveToPath } from "$lib/js/entity-operations";

// ###################################################
// Row moving controllers
//

let potentialParent = null;

function onRowDragMove(event){
    setPotentialParentForNode(event.api, event.overNode)
}


// Single Selection Only

function setPotentialParentForNode(gridApi, overNode){
    let newPotentialParent;
    
    // set parent to node we are hovering near
    if (overNode) {
    newPotentialParent =
        overNode.data?.type === 'entity'
        ? // if over an entity, we take the immediate row
            overNode
        : // if over a point, we take the parent row (which will be an entity, or root)
            overNode.parent;
    } else {
        newPotentialParent = null;
    }

    // check if it is the current parent
    const alreadySelected = potentialParent === newPotentialParent;
    if (alreadySelected) {
        return; // exit early, nothing to change
    }

    // if a new parent, lets remove highlight from old potential parent and highligh this one
    // we refresh the previous selection (if it exists) to clear
    // the highlighted and then the new selection.
    const rowsToRefresh = [];
    if (potentialParent) {
        rowsToRefresh.push(potentialParent);
    }
    if (newPotentialParent) {
        rowsToRefresh.push(newPotentialParent);
    }

    potentialParent = newPotentialParent;

    refreshRows(gridApi, rowsToRefresh);
};

function refreshRows(api, rowsToRefresh) {
    var params = {
    // refresh these rows only.
    rowNodes: rowsToRefresh,
    // because the grid does change detection, the refresh
    // will not happen because the underlying value has not
    // changed. to get around this, we force the refresh,
    // which skips change detection.
    force: true,
    };
    api.refreshCells(params);
}

function onRowDragEnd(event){
    if(!potentialParent){
        return
    }

    // Updated to support multiple selection dragging
    const newParentPath = potentialParent.data ? potentialParent.data.subject_path : [];
    // filter to just nodes that need parents updated
    const nodesToChangeParent = event.nodes.filter((node) => {
        if(!arePathsEqual(newParentPath, node.data.subject_path)){
            return true
        };
        return false
    });

    // check if any nodes that are being updated are being moved into their own child
    const invalidMode = nodesToChangeParent.some(node => isSelectionParentOfTarget(node, potentialParent));
    if (invalidMode) {
        console.log('Not allowed.');
    }

    if (nodesToChangeParent.length>0 && !invalidMode) {
        const updatedRows = [];
        // for each node, lets move path
        nodesToChangeParent.forEach(node => {
            moveToPath(newParentPath, node, updatedRows);
        });
        event.api.applyTransaction({
            update: updatedRows,
        });
        event.api.clearFocusedCell();
    }
    
    // OLD - Single selection dragging ONLY
    // const rowDataToMove = event.node.data;
    // // console.debug("Row data to move: ", rowDataToMove, "Potential Parent: ", potentialParent)
    // // take new parent path from parent, if data is missing, means it's the root node,
    // // which has no data.
    // const newParentPath = potentialParent.data ? potentialParent.data.subject_path : [];
    // const needToChangeParent = !arePathsEqual(newParentPath, rowDataToMove.subject_path);

    // // check we are not moving a entity into a child entity
    // const invalidMode = isSelectionParentOfTarget(event.node, potentialParent);
    // if (invalidMode) {
    //     console.log('Not allowed.');
    // }

    // if (needToChangeParent && !invalidMode) {
    //     const updatedRows = [];
    //     moveToPath(newParentPath, event.node, updatedRows);
    
    //     event.api.applyTransaction({
    //         update: updatedRows,
    //     });
    //     event.api.clearFocusedCell();
    // }


    // clear node to highlight
    setPotentialParentForNode(event.api, null);


}

function arePathsEqual(path1, path2) {
    if (path1.length !== path2.length) {
        return false;
    }

    let equal = true;
    path1.forEach((item, index) => {
        if (path2[index] !== item) {
            equal = false;
        }
    });

    return equal;
}

function isSelectionParentOfTarget(selectedNode, targetNode) {
    const children = selectedNode.childrenAfterGroup || [];
    for (let i = 0; i < children.length; i++) {
        if (targetNode && children[i].key === targetNode.key) return true;
            isSelectionParentOfTarget(children[i], targetNode);
        }
    return false;
}


export { potentialParent, onRowDragEnd, onRowDragMove }