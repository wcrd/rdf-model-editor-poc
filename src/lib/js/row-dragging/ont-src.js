//
//
//  THIS IS ALMOST EXACTLY THE SAME CODE AS ONT-MODEL
//
//


import { getClassType } from "$lib/js/ontology-helpers.js"
import { dragMode, sourceGridAPI, sourceEditedNodes } from '$lib/stores/store-grid-manager.js'

const MODEL_NODE_TYPE_CLASS_TYPE_MAP = {
    "entity": ["Equipment", "Location", "Collection"],
    "point": ["Point"],
}

// control variables
let classType = null;
let hoverOverNode = null;

function onRowDragEnter(params){
    // set global drag controller
    dragMode.set("ontology-to-source")
    classType = getClassType(params.node.data)
}

function onRowDragMove(params){
    // guard: can only drag point classes into source grid
    if(classType!="Point") return;

    if(params.overNode){
        if(params.overNode != hoverOverNode) hoverOverNode = params.overNode;
    }
}

function onRowDragLeave(params){
    // // reset all potential variables
    // const rowsToRefresh = setPotentialTargetForClass(null, null);
    // // clear grid highlights
    // if(rowsToRefresh) refreshRows(params.api, rowsToRefresh)

    hoverOverNode = null;

    // reset global drag mode
    dragMode.set(null)
}

// function classOverModelNode(params){
//     // check we are over something useful
//     if(params.overNode){
//         // console.debug(classType, overNodeType)
//         // set potential parent
//         const rowsToRefresh = setPotentialTargetForClass(params.overNode, params.node)
//         if(rowsToRefresh){
//             refreshRows(params.api, rowsToRefresh)
//         }

//     }
// }

function onRowDragEnd(params){
    // const rowsToRefresh = [];
    // // update model grid
    // const targetNode = get(potentialParent);
    // if(targetNode){
    //     targetNode.data.class = params.node.data.uri;
    //     rowsToRefresh.push(targetNode);
    //     // console.debug(params)
    //     // clear highlight
    //     rowsToRefresh.push(...(setPotentialTargetForClass(null, null) || []));
    //     // update grid
    //     // execute updates (so events fire)
    //     modelGridAPI._updateGrid({update: rowsToRefresh.map(row => row.data)})

    //     refreshRows(params.api, rowsToRefresh)
    // }
    
    if(hoverOverNode){
        params.overNode.data['edit-class'] = params.node.data.uri;
        sourceGridAPI._updateGrid({ update: [params.overNode.data]})

        // record row for processing at edit mode termination
        sourceEditedNodes.update(curr => {
            curr.add(params.overNode)
            return curr
        })

    } else {
        console.log("Only point classes can be dragged into the source grid")
    }

    hoverOverNode = null;
    // reset global drag mode
    dragMode.set(null)
}

//
//
//


// function setPotentialTargetForClass(overNode, classNode){
//     const currentTarget = get(potentialParent);
//     let newTarget = null;
    
//     // guard
//     if(overNode) {
//         newTarget = overNode;
    
//         // check model node type and ontology class are compatible
//         const overNodeType = overNode.data.type
//         const classType = getClassType(classNode.data);
//         if( ! MODEL_NODE_TYPE_CLASS_TYPE_MAP[overNodeType].includes(classType) ){
//             // console.debug("Not Compatible")
//             newTarget = null ; // clear target, not compatible.
//         }
//         // check if already the target
//         const alreadyTarget = currentTarget == newTarget;
//         if(alreadyTarget){
//             return false
//         }
        
//     }
//     const rowsToRefresh = []
//     if(currentTarget) rowsToRefresh.push(currentTarget)
//     if(newTarget) rowsToRefresh.push(overNode)

//     potentialParent.set(newTarget)

//     return rowsToRefresh
// }

const ontSourceDragHandlers = {
    onDragEnter: onRowDragEnter,
    onDragging: onRowDragMove,
    onDragLeave: onRowDragLeave,
    onDragStop: onRowDragEnd
}

export {
    ontSourceDragHandlers
}