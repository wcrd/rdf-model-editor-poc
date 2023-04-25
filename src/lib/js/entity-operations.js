// simple function to generate new entity row data
function generateNewEntity(overNode){
    const id_str = generateString(5)
    
    // if location to insert is a point, then get the parent node.
    const newPotentialParent =
        overNode.data?.type === 'entity'
        ? // if over an entity, we take the immediate row
            overNode
        : // if over a point, we take the parent row (which will be an entity, or root)
            overNode.parent;
    
    // if no data, parent is root. Otherwise an entity
    const newPath = newPotentialParent?.data ? newPotentialParent.data.subject_path.slice() : []
    const subject = `ent_${id_str}`
    newPath.push(subject)

    return {
        "subject_path": newPath,
        "subject": subject,
        "label": "",
        "class": "Not Set",
        "type": "entity"
    }
}


// program to generate random strings
// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}



// Change entity path
function moveToPath(newParentPath, node, allUpdatedNodes) {
    // last part of the file path is the file name
    const oldPath = node.data.subject_path;
    const leafName = oldPath.pop();
    const newChildPath = newParentPath.slice();
    newChildPath.push(leafName);

    node.data.subject_path = newChildPath;

    allUpdatedNodes.push(node.data);
    
    // if the node we move has children of its own, they need to be updated.
    if (node.childrenAfterGroup) {
        node.childrenAfterGroup.forEach((childNode) => {
            moveToPath(newChildPath, childNode, allUpdatedNodes);
        });
    }
}


// create point at node
// TODO: similarity with above functions
function createNewPointAtNode(overNode){
    const id_str = generateString(5)
    const newPath = overNode?.data ? overNode.data.subject_path.slice() : []
    newPath.pop();
    const subject = `pnt_${id_str}`
    newPath.push(subject)

    return {
        "subject_path": newPath,
        "subject": subject,
        "label": "",
        "class": "Not Set",
        "type": "point"
    }

}

export { generateNewEntity, moveToPath, createNewPointAtNode }