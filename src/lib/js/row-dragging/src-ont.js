//
//
//  THIS IS ALMOST EXACTLY THE SAME CODE AS MODEL-ONT
//
//

import { getClassType } from "$lib/js/ontology-helpers.js"
import { dragMode, sourceGridAPI, sourceEditedNodes } from '$lib/stores/store-grid-manager.js'
// import { sourceGridAPI } from '$lib/stores/'


const MODEL_NODE_TYPE_CLASS_TYPE_MAP = {
    "entity": ["Equipment", "Location", "Collection"],
    "point": ["Point"],
}

// control variables
let hoverOverNode;
let timer;

function onRowDragEnter(params){
    // set global drag controller
    dragMode.set("source-to-ontology")
};

function onRowDragMove(params){
    // model over class node
    // console.debug(params.overNode)

    // check we are over something useful
    if(params.overNode){
        // get class type to check drag is compatible
        const classType = getClassType(params.overNode.data);

        // if new hover node AND class is valid for dragged
        if(
            params.overNode != hoverOverNode
            && classType == "Point"
        ){
            // if row not expanded, long hover will expand it
            if(!params.overNode?.expanded){
                // expand after 1.5 sec
                // clear if we leave row
                clearTimeout(timer);
                timer = setTimeout(()=>{
                    params.overNode.setExpanded(true)
                    // console.debug("Time func trigger. ", params)
                }, 1500);
                // console.debug("New timer set; ", hoverOverNode)
            };

            // set new 'target' class;
            hoverOverNode = params.overNode;

            // console.debug("New hover over node: ", hoverOverNode) 
        }
    }
};

function onRowDragLeave(){
    // clear expansion timer (may not be running)
    clearTimeout(timer)
    hoverOverNode = null;
    // console.debug("Clear timer")

    // reset global drag mode
    dragMode.set(null)
};

function onRowDragEnd(params){
    // clear expansion timer (may not be running)
    clearTimeout(timer)

    // check target class is set
    if(hoverOverNode){
        // double check class is valid for dragged model nodes
        // get class type to check drag is compatible
        const classType = getClassType(hoverOverNode.data);
        if(classType == "Point"){
            const rowsToUpdate = [];
            // for each node, update class
            params.nodes.forEach(node => {
                node.data['edit-class'] = hoverOverNode.data.uri;
                rowsToUpdate.push(node.data)

                // record row for processing at edit mode termination
                sourceEditedNodes.update(curr => {
                    curr.add(node)
                    return curr
                })
            })
            // apply updates to model grid
            sourceGridAPI._updateGrid({ update: rowsToUpdate })

            

        }

    }

    hoverOverNode = null;
    // reset global drag mode
    dragMode.set(null)
};

const sourceOntDragHandlers = {
    onDragEnter: onRowDragEnter,
    onDragging: onRowDragMove,
    onDragLeave: onRowDragLeave,
    onDragStop: onRowDragEnd
}

//
//
//



export {
    sourceOntDragHandlers
}