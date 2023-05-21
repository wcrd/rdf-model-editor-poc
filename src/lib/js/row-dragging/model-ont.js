import { get } from "svelte/store";
import { getClassType } from "$lib/js/ontology-helpers.js"
import { refreshRows } from "$lib/js/common-grid";
import { potentialParent, modelGridAPI } from '$lib/stores/store-model-grid.js'
import { dragMode } from '$lib/stores/store-grid-manager.js'

const MODEL_NODE_TYPE_CLASS_TYPE_MAP = {
    "entity": ["Equipment", "Location", "Collection"],
    "point": ["Point"],
}

// control variables
let hoverOverNode;
let timer;

function onRowDragEnter(){
    // set global drag controller
    dragMode.set("model-to-ontology")
};

function onRowDragMove(params){
    // model over class node

    // guard; dragged model rows must be same 'type' (entity OR point for assignment to work)
    const modelNodeTypes = new Set(params.nodes.map(node => node.data.type));
    if(modelNodeTypes.size!=1){
        // going to show message on row drag end to cut down on console messages.
        // console.log("ERROR: Cannot drag model rows of different types for class assignement. Drag points or entiites.")
        return false;
    }


    // check we are over something useful
    if(params.overNode){
        // get class type to check drag is compatible
        const classType = getClassType(params.overNode.data);
        // expand after 1 sec
        // clear if we leave row
        // if new hover node, and row not expanded AND class is valid for dragged
        if(
            !params.overNode?.expanded 
            && params.overNode != hoverOverNode
            && MODEL_NODE_TYPE_CLASS_TYPE_MAP[modelNodeTypes.values().next().value].includes(classType)
        ){
            clearTimeout(timer);
            timer = setTimeout(()=>{
                params.overNode.setExpanded(true)
                // console.debug("Time func trigger. ", params)
            }, 1500);
            hoverOverNode = params.overNode;
            // console.debug("New timer set; ", hoverOverNode) 
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

function onRowDragEnd(){
    // reset global drag mode
    dragMode.set(null)
};

const modelOntDragHandlers = {
    onDragEnter: onRowDragEnter,
    onDragging: onRowDragMove,
    onDragLeave: onRowDragLeave,
    onDragStop: onRowDragEnd
}

//
//
//






export {
    modelOntDragHandlers
}