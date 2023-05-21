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
let modelNodeSet;

function onRowDragEnter(params){
    // set global drag controller
    dragMode.set("model-to-ontology")

    // get dragged node types for use later
    modelNodeSet = new Set(params.nodes.map(node => node.data.type));
};

function onRowDragMove(params){
    // model over class node

    // guard; dragged model rows must be same 'type' (entity OR point for assignment to work)
    if(modelNodeSet.size!=1){
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
            && MODEL_NODE_TYPE_CLASS_TYPE_MAP[modelNodeSet.values().next().value].includes(classType)
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

function onRowDragEnd(params){
    // clear expansion timer (may not be running)
    clearTimeout(timer)

    // guard; dragged model rows must be same 'type' (entity OR point for assignment to work)
    if(modelNodeSet.size!=1){
        console.log("ERROR: Cannot drag model rows of different types for class assignement. Drag points OR entiites.")
        return false;
    }

    // check target class is set
    if(hoverOverNode){
        // double check class is valid for dragged model nodes
        // get class type to check drag is compatible
        const classType = getClassType(hoverOverNode.data);
        if(MODEL_NODE_TYPE_CLASS_TYPE_MAP[modelNodeSet.values().next().value].includes(classType)){
            const rowsToUpdate = [];
            // for each node, update class
            params.nodes.forEach(node => {
                node.data.class = hoverOverNode.data.uri;
                rowsToUpdate.push(node.data)
            })
            // apply updates to model grid
            modelGridAPI._updateGrid({ update: rowsToUpdate })

        }

    }

    hoverOverNode = null;
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