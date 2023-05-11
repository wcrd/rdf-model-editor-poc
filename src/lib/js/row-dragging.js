import { get } from "svelte/store";
import { moveToPath, generatePoint } from "$lib/js/entity-operations";
import { sourceGridAPI } from "$lib/stores/store-grid-manager";
import { modelGridAPI } from "$lib/stores/store-model-grid";
import { removeSourceLinks, addSourceLink } from "$lib/js/shared-transactions";

// ###################################################
// Row moving controllers
//

let potentialParent = null;
let srcDragMode = null;
let potentialInsertNode= null;

function onRowDragEnter(event) {
    // console.debug(event);
    if (event.nodes.some(node => node?.data.type == "src")) {
        if (event.nodes.length == 1 && !event.event.ctrlKey ) srcDragMode = 'link';
        else srcDragMode = 'insert';
    } else {
        srcDragMode = null;
    }
}

function onRowDragMove(event) {
    // console.debug(event)
    // if src point from other grid; do extra checks & options
    if (srcDragMode) {
        // if one row selected, we are going to assign to an existing point
        if (srcDragMode == 'link' && !event.event.ctrlKey) setPotentialParentForSource(event.api, event.overNode);
        // if more that one row selected, CTRL must also be held, as we will be
        // creating new point records at the parent
        else {
            // console.debug("More than one source being moved; insert mode.")
            if (event.overNode && event.overNode != potentialInsertNode) {
                setPotentialInsertNode(event.api, event.overNode)
            }
        }
    }
    // if model drag, do normal    
    else {
        setPotentialParentForNode(event.api, event.overNode)
    }
}


function onRowDragLeave(event){
    // reset all potential variables
    console.debug("You left the grid yo stupid fok")
    setPotentialParentForNode(event.api, null);
    setPotentialInsertNode(event.api, null);
    return
}

function setPotentialInsertNode(gridApi, overNode){
    const rowsToRefresh = []
    if(overNode) rowsToRefresh.push(overNode)
    if(potentialInsertNode) rowsToRefresh.push(potentialInsertNode)
    potentialInsertNode = overNode
    refreshRows(gridApi, rowsToRefresh)
}

// Single Selection Only

function setPotentialParentForNode(gridApi, overNode) {
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

function onRowDragEnd(event) {
    if (!potentialParent && !potentialInsertNode) {
        return
    }

    // if src point from other grid; do extra checks & options
    if (srcDragMode == "link") {
        // Need to update
        // 1. If point already has source; update that source in src table
        // 2. If source already has point; update that point in pnt table
        // 3. Write new source to new point
        // 4. Write new point to new source

        const srcGridApi = event.node.beans.gridApi
        // 1. if point has source already, remove that association
        if (potentialParent.data.source) {
            // let oldSource = srcGridApi.getRowNode(potentialParent.data.source);
            // console.debug("Pnt removed from Src: ", potentialParent.data.source, oldSource.data['source-for'])
            // oldSource.data['source-for'] = null
            // srcGridApi.applyTransaction({
            //     update: [oldSource.data],
            // });
            // srcGridApi.clearFocusedCell()
            removeSourceLinks({modelRows: [potentialParent.data]})
        }
        // 2. source has point already, remove that association in points grid
        if (event.node.data['source-for']) {
            // let oldPoint = event.api.getRowNode(event.node.data['source-for'])
            // console.debug("Src removed from Pnt: ", event.node.data['source-for'], oldPoint.data.source)
            // oldPoint.data.source = null;
            // event.api.applyTransaction({
            //     update: [oldPoint.data]
            // });
            // event.api.clearFocusedCell();
            removeSourceLinks({sourceRows: [event.node.data]})
        }

        // 3. update model row
        // potentialParent.data.source = event.node.id
        // // console.debug(event)
        // event.api.applyTransaction({
        //     update: [potentialParent.data],
        // });
        // event.api.clearFocusedCell();

        // 4. finally update source grid again
        // event.node.data['source-for'] = potentialParent.id
        // srcGridApi.applyTransaction({
        //     update: [event.node.data],
        // });
        // srcGridApi.clearFocusedCell()

        // 3&4: Create link between source and model
        addSourceLink(potentialParent, event.node)


        // clear node to highlight
        setPotentialParentForSource(event.api, null);
    }
    else if(srcDragMode == "insert"){
        console.debug("inserting new point(s)")
        // console.debug(event.nodes)

        // lots of potential for refactoring here with code in if clause above
        // TODO

        // block if any node has a point assigned already
        if( event.nodes.some(node => node.data['source-for'])) {
            console.log("NOT ALLOWED: Some selected src points are already assigned to model points.")
        } else {
        // for each dragged src node
        // 1. create model point node
        // 1a. assign class (if available from src grid) // do this later
        // 2. link to src point (do steps 2 from clause above)\
            const srcGridApi = event.node.beans.gridApi;
            // const insertIndex = event.overNode.rowIndex;

            // need to insert at same path as overnode
            const newRows = [] 
            event.nodes.forEach(node => {
                // let newRow = createNewPointAtNode(event.overNode);
                let newRow = generatePoint(event.overNode)
                newRow.source = node.id;
                newRows.push(newRow)

                node.data['source-for'] = newRow.subject
            })
            // console.debug(newRows)
            // add to model grid
            // addRowsToGrid(event.api, newRows)
            modelGridAPI._updateGrid({ add: newRows })
            // refresh source grid
            srcGridApi.applyTransaction({
                update: event.nodes.map(node => node.data),
            });
            srcGridApi.deselectAll()

        }
        // clear highlight
        setPotentialInsertNode(event.api, null)
    }
    // if internal model drag, do normal    
    else {
        const newParentPath = potentialParent.data ? potentialParent.data.subject_path : [];
        // filter to just nodes that need parents updated
        const nodesToChangeParent = event.nodes.filter((node) => {
            if (!arePathsEqual(newParentPath, node.data.subject_path)) {
                return true
            };
            return false
        });

        // check if any nodes that are being updated are being moved into their own child
        const invalidMode = nodesToChangeParent.some(node => isSelectionParentOfTarget(node, potentialParent));
        if (invalidMode) {
            console.log('Not allowed.');
        }

        if (nodesToChangeParent.length > 0 && !invalidMode) {
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

        // refresh source grid so linked-data fields are re-fetched
        get(sourceGridAPI).api.refreshCells({ columns: ['linked-class', 'linked-parent', 'linked-root-parent']});
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

function setPotentialParentForSource(gridApi, overNode) {
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


export { 
    potentialParent, potentialInsertNode, 
    onRowDragEnd, onRowDragMove, onRowDragEnter, onRowDragLeave,
    refreshRows
}