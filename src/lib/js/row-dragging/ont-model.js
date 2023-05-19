import { get } from "svelte/store";
import { getClassType } from "$lib/js/ontology-helpers.js"
import { refreshRows } from "$lib/js/common-grid";
import { potentialParent } from '$lib/stores/store-model-grid.js'

const MODEL_NODE_TYPE_CLASS_TYPE_MAP = {
    "entity": ["Equipment", "Location", "Collection"],
    "point": ["Point"],
}

function classOverModelNode(params){
    // check we are over something useful
    if(params.overNode){
        // console.debug(classType, overNodeType)
        // set potential parent
        const rowsToUpdate = setPotentialTargetForClass(params.overNode, params.node)
        if(rowsToUpdate){
            refreshRows(params.api, rowsToUpdate)
        }

    }
}


function setPotentialTargetForClass(overNode, classNode){
    const currentTarget = get(potentialParent);

    // check model node type and ontology class are compatible
    const overNodeType = overNode.data.type
    const classType = getClassType(classNode.data);
    if( MODEL_NODE_TYPE_CLASS_TYPE_MAP[overNodeType].includes(classType) ){
        // console.debug("Compatible")
        // check if already the target
        const alreadyTarget = currentTarget == overNode;
        if(!alreadyTarget){
            potentialParent.set(overNode)
            return [currentTarget, overNode]
        }
    }
    return false;
}

const ontModelDragParams = {
    onDragging: classOverModelNode,
}

export {
    ontModelDragParams
}