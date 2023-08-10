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
    const rootNode = generateEntity(null, {cls: root.uri, label: root.label})
    newNodes.push(rootNode)

    const entity_id_map = {} // used for mapping id paths to newly created entities
    // TODO: to prevent errors here I should sort by rule.path.length. Smallest path first,
    // that way we create all parents before children.
    shapeDef.forEach(rule => {
        if(rule.type=="entity"){
            // get path
            const path = rule.path.slice(2) // remove first two elements as these are the shape 'labels'
            const parent = entity_id_map[ path[path.length-2] ] || rootNode // parent is 2nd last element, or the rootNode by default
            // create entitiy
            const newEntity = generateEntity({data: parent}, {cls: rule.uri})
            entity_id_map[rule.id] = newEntity

            newNodes.push(newEntity)
        }
        else if(rule.type=="point"){
            // get path
            const path = rule.path.slice(2) // remove first two elements as these are the shape 'labels'
            const parent = entity_id_map[ path[path.length-2] ]  || rootNode // parent is 2nd last element, or the rootNode by default
            newNodes.push(
                generatePoint({data: parent}, {child: true, point_props: {cls: rule.uri}})
            )
        }
        else if(rule.type=="template"){
            // pass
        }
        else {
            console.log("ERROR processing shape rule: ", rule)
        }
    })

    return newNodes
}

export {
    generateFromShape
}