import { get } from "svelte/store";

import { potentialParent, potentialInsertNode } from "$lib/stores/store-model-grid";
import { refreshRows } from "$lib/js/common-grid";
import { removeSourceLinks, addSourceLink } from "$lib/js/shared-transactions";
import { modelGridAPI } from "$lib/stores/store-model-grid";
import { sourceGridAPI, dragMode } from "$lib/stores/store-grid-manager"

let srcDragMode = null; // controls: insert new node or make link to existing

function onRowDragEnter(params) {
    // console.debug(params);
    // set global drag controller
    dragMode.set("source-to-model")

    // check that we are dragging at least some source points; a little redundant.
    if (params.nodes.some(node => node?.data.type == "src")) {
        // 1 node and no ctrl key = link; else insert.
        // this get re-evaluated for ctrl key changes on move and end of drag.
        if (params.nodes.length == 1 && !params.event.ctrlKey ) srcDragMode = 'link';
        else srcDragMode = 'insert';
    } else srcDragMode = null;
}

function srcOverModelNode(params){
    // console.debug("Callback drag: ", params)
    // check we are dragging source rows (a little redundant)
    if(srcDragMode){
        let rowsToRefresh = false;
        // if one row selected, we are going to assign to an existing point
        // re-check if ctrl key has since been changed
        if (srcDragMode == 'link' && !params.event.ctrlKey) {
            rowsToRefresh = setPotentialModelNodeForSource(params.overNode, params.node);
        }
        // if more that one row selected, or CTRL is held, we will be
        // creating new point records at the parent
        else {
            // console.debug("More than one source being moved; insert mode.")
            rowsToRefresh = setPotentialInsertNode(params.overNode)
        }

        // if changes have been made, refresh changed rows.
        if(rowsToRefresh){
            refreshRows(params.api, rowsToRefresh);
        }
    }
}

function onRowDragStop(params){
    let rowsToRefresh;

    if (srcDragMode == "link") {
        // Need to update
        // 1. If point already has source; update that source in src table
        // 2. If source already has point; update that point in pnt table
        // 3. Write new source to new point
        // 4. Write new point to new source

        // const srcGridApi = get(sourceGridAPI).api;
        const modelNodeToLink = get(potentialParent);

        if(!modelNodeToLink) return; // nothing we can do

        // 1. if point (modelNode) has source already, remove that association in source grid
        if (modelNodeToLink.data.source) {
            removeSourceLinks({modelRows: [modelNodeToLink.data]})
        }

        // 2. if source has point already, remove that association in points grid
        if (params.node.data['source-for']) {
            removeSourceLinks({sourceRows: [params.node.data]})
        }

        // 3&4: Create link between source and model
        addSourceLink(modelNodeToLink, params.node)

        // clear node to highlight
        rowsToRefresh = setPotentialModelNodeForSource(null);
    }
    else if (srcDragMode == "insert") {
        // block this operation if any selected source node has a point assigned already
        if( params.nodes.some(node => node.data['source-for'])) {
            console.log("NOT ALLOWED: Some selected src points are already assigned to model points.")
        } 
        else {
            // for each dragged src node
            // 1. create model point node
            // 2. link to src point (do steps 2 from clause above)
            

            // need to insert at same path as overnode
            const newRows = [] 
            params.nodes.forEach(node => {
                const newPointNode = modelGridAPI.addPointRow(params.overNode)
                addSourceLink(newPointNode, node)
            })
            get(sourceGridAPI).api.deselectAll()

        }
        // clear highlight
        rowsToRefresh = setPotentialInsertNode(null)
    }
    
    // clear highlight
    if(rowsToRefresh) refreshRows(params.api, rowsToRefresh)

    // reset global drag mode
    dragMode.set(null)

}

function onRowDragLeave(params){
    // clear highlight
    const rowsToRefresh = [] 
    rowsToRefresh.push(...(setPotentialModelNodeForSource(null) || []))
    rowsToRefresh.push(...(setPotentialInsertNode(null) || [] ))
    if(rowsToRefresh) refreshRows(params.api, rowsToRefresh)
    // reset global drag mode
    dragMode.set(null)
}

const srcModelDragParams = {
    onDragEnter: onRowDragEnter,
    onDragging: srcOverModelNode,
    onDragStop: onRowDragStop,
    onDragLeave: onRowDragLeave
}



// 
// 
// 


function setPotentialModelNodeForSource(overNode) {
    // NOTE: We are re-using the existing potentialParent store variable
    // to track which model node to link to as it is essentially the same
    // concept. It simplifies things as the highlighting is already set up in css for it.
    let newPotentialModelNode = null;
    const currPotentialModelNode = get(potentialParent); 

    // set parent to node we are hovering near
    if (overNode) {
        newPotentialModelNode =
            overNode.data?.type === 'point'
                ? // if over an point, we take the immediate row
                overNode
                : // if over an entity, keep as null; src can't belong to an entity
                null;
    }

    // check if it is the current parent
    const alreadySelected = currPotentialModelNode === newPotentialModelNode;
    if (alreadySelected) {
        return false; // exit early, nothing to change
    }

    // if a new parent, lets remove highlight from old potential parent and highligh this one
    // we refresh the previous selection (if it exists) to clear
    // the highlighted and then the new selection.
    const rowsToRefresh = [];
    if (currPotentialModelNode) {
        rowsToRefresh.push(currPotentialModelNode);
    }
    if (newPotentialModelNode) {
        rowsToRefresh.push(newPotentialModelNode);
    }


    potentialParent.set(newPotentialModelNode);
    
    return rowsToRefresh
}



function setPotentialInsertNode(overNode){
    let newPotentialInsertNode = null;
    const currPotentialInsertNode = get(potentialInsertNode);

    // set insert loc at node we are hovering near
    if (overNode) newPotentialInsertNode = overNode;

    // check if it is the current insert loc
    const alreadySelected = currPotentialInsertNode === overNode;
    if (alreadySelected) {
        return false; // exit early, nothing to change
    }

    // if a new insert loc, lets remove highlight from old potential loc and highligh this one
    // we refresh the previous selection (if it exists) to clear
    // the highlighted and then the new selection.
    const rowsToRefresh = [];
    if (currPotentialInsertNode) {
        rowsToRefresh.push(currPotentialInsertNode);
    }
    if (newPotentialInsertNode) {
        rowsToRefresh.push(newPotentialInsertNode);
    }

    potentialInsertNode.set(newPotentialInsertNode);
    
    return rowsToRefresh
}



export { srcModelDragParams }