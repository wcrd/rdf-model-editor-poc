import { getClassType } from "$lib/js/ontology-helpers.js"

function classOverModelNode(params){
    // check we are over something useful
    if(params.overNode){
        // check type of model node
        console.debug("Class over node: ", params)
        const classType = getClassType(params.node.data);
        const overNodeType = params.overNode.data.type
        console.debug(classType, overNodeType)
    }
    // set highlight


}

export {
    classOverModelNode
}