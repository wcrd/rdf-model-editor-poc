import { generateEntity, generatePoint } from "$lib/js/entity-operations";

/**
 * generate a model entity from a shape 
 * @param {Array} shapeDef 
 */
function generateFromShape(shapeDef){
    const newNodes = []
    // need to scan for root class first. Must be a better way to do this
    // so I don't have to filter the array for this first
    // we are essentially doing two loops here.
    const root = shapeDef.filter(r => r.type == "template")[0];
    if (!root) {
        console.log("ERROR processing shape rule - no root template! ", rule)
        return newNodes
    }

    // create root node
    const rootNode = generateEntity(null, {cls: root.uri})
    newNodes.push(rootNode)

    shapeDef.forEach(rule => {
        if(rule.type=="entity"){
            newNodes.push(
                generateEntity({data: rootNode}, {cls: rule.uri})
            )
        }
        else if(rule.type=="point"){
            newNodes.push(
                generatePoint({data: rootNode}, {point_props: {cls: rule.uri}})
            )
        }
        else {
            console.log("ERROR processing shape rule: ", rule)
        }
    })

    console.debug(newNodes)
}

export {
    generateFromShape
}