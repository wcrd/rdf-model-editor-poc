import { moveToPath } from "$lib/js/entity-operations";

// ###################################################
// Row moving controllers
//

let potentialParent = null;
let srcDragMode = null;

function onRowDragEnter(event){
    if(event.nodes.some(node => node?.data.type == "src")){
        if(event.nodes.length==1) srcDragMode = 'single';
        else srcDragMode = 'multiple';
    } else {
        srcDragMode = null;
    }
}

function onRowDragMove(event){
    // console.debug("drg mode: ", srcDragMode)
    // if src point from other grid; do extra checks & options
    if(srcDragMode){
        // if one row selected, we are going to assign to an existing point
        if(srcDragMode=='single') setPotentialParentForSource(event.api, event.overNode);
        // if more that one row selected, CTRL must also be held, as we will be
        // creating new point records at the parent
        else {
            console.debug("More than one source being moved; insert mode.")
            // make new function set 'insert' point
        }
    } 
    // if model drag, do normal    
    else {
        setPotentialParentForNode(event.api, event.overNode)
    }
}

// Not needed, just testing
function onRowDragMove_srcRow(event){
    console.debug("Src: ", event)
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

    // if src point from other grid; do extra checks & options
    if(srcDragMode=="single"){
        // Need to update
        // 1. If point already has source; update that source in src table
        // 2. If source already has point; update that point in pnt table
        // 3. Write new source to new point
        // 4. Write new point to new source

        const srcGridApi = event.node.beans.gridApi
        // 1. if point has source already, remove that association in source grid
        if(potentialParent.data.source){
            let oldSource = srcGridApi.getRowNode(potentialParent.data.source);
            console.debug("Pnt removed from Src: ", potentialParent.data.source, oldSource.data['source-for'])
            oldSource.data['source-for'] = null
            srcGridApi.applyTransaction({
                update: [ oldSource.data ],
            });
            srcGridApi.clearFocusedCell()
        }
        // 2. source has point already, remove that association in points grid
        if(event.node.data['source-for']){
            let oldPoint = event.api.getRowNode(event.node.data['source-for'])
            console.debug("Src removed from Pnt: ", event.node.data['source-for'], oldPoint.data.source)
            oldPoint.data.source = null;
            event.api.applyTransaction({
                update: [ oldPoint.data ]
            });
            event.api.clearFocusedCell();
        }

        // 3. update model row
        potentialParent.data.source = event.node.id
        // console.debug(event)
        event.api.applyTransaction({
            update: [ potentialParent.data ],
        });
        event.api.clearFocusedCell();

        // 4. finally update source grid again
        event.node.data['source-for'] = potentialParent.id
        srcGridApi.applyTransaction({
            update: [ event.node.data ],
        });
        srcGridApi.clearFocusedCell()

        // clear node to highlight
        setPotentialParentForSource(event.api, null);
    } 
    // if internal model drag, do normal    
    else {
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

        // clear node to highlight
        setPotentialParentForNode(event.api, null);
    }
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

/////////////////////////////////////////////

function setPotentialParentForSource(gridApi, overNode){
    let newPotentialParent;
    
    // set parent to node we are hovering near
    if (overNode) {
    newPotentialParent =
        overNode.data?.type === 'point'
        ? // if over an point, we take the immediate row
            overNode
        : // if over an entity, keep as null; src can't belong to an entity
            null;
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
}


export { potentialParent, onRowDragEnd, onRowDragMove, onRowDragEnter }