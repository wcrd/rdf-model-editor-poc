import { get } from "svelte/store";
import { getClassType } from "$lib/js/ontology-helpers.js"
import { refreshRows } from "$lib/js/common-grid";
import { potentialParent, modelGridAPI } from '$lib/stores/store-model-grid.js'
import { dragMode } from '$lib/stores/store-grid-manager.js'

const MODEL_NODE_TYPE_CLASS_TYPE_MAP = {
    "entity": ["Equipment", "Location", "Collection"],
    "point": ["Point"],
}

function onRowDragEnter(params){
    // set global drag controller
    dragMode.set("ontology-to-model")
}

function onRowDragLeave(params){
    // reset all potential variables
    const rowsToRefresh = setPotentialTargetForClass(null, null);
    // clear grid highlights
    if(rowsToRefresh) refreshRows(params.api, rowsToRefresh)
    // reset global drag mode
    dragMode.set(null)
}

function classOverModelNode(params){
    // check we are over something useful
    if(params.overNode){
        // console.debug(classType, overNodeType)
        // set potential parent
        const rowsToRefresh = setPotentialTargetForClass(params.overNode, params.node)
        if(rowsToRefresh){
            refreshRows(params.api, rowsToRefresh)
        }

    }
}

function onRowDragEnd(params){
    const rowsToRefresh = [];
    // update model grid
    const targetNode = get(potentialParent);
    targetNode.data.class = params.node.data.uri;
    rowsToRefresh.push(targetNode);
    // console.debug(params)
    // clear highlight
    rowsToRefresh.push(...(setPotentialTargetForClass(null, null) || []));
    // update grid
    // execute updates (so events fire)
    modelGridAPI._updateGrid({update: rowsToRefresh.map(row => row.data)})

    refreshRows(params.api, rowsToRefresh)
    // reset global drag mode
    dragMode.set(null)
}

//
//
//


function setPotentialTargetForClass(overNode, classNode){
    const currentTarget = get(potentialParent);
    let newTarget = null;
    
    // guard
    if(overNode) {
        newTarget = overNode;
    
        // check model node type and ontology class are compatible
        const overNodeType = overNode.data.type
        const classType = getClassType(classNode.data);
        if( ! MODEL_NODE_TYPE_CLASS_TYPE_MAP[overNodeType].includes(classType) ){
            // console.debug("Not Compatible")
            newTarget = null ; // clear target, not compatible.
        }
        // check if already the target
        const alreadyTarget = currentTarget == newTarget;
        if(alreadyTarget){
            return false
        }
        
    }
    const rowsToRefresh = []
    if(currentTarget) rowsToRefresh.push(currentTarget)
    if(newTarget) rowsToRefresh.push(overNode)

    potentialParent.set(newTarget)

    return rowsToRefresh
}

const ontModelDragParams = {
    onDragEnter: onRowDragEnter,
    onDragging: classOverModelNode,
    onDragLeave: onRowDragLeave,
    onDragStop: onRowDragEnd
}

export {
    ontModelDragParams
}