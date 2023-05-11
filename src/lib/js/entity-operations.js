//
// Pure entity operations; no grid logic in here.
//
import { generateString } from "$lib/js/helpers";

function generateEntity(atNode, {subject, label, cls}={}){
    const newSubject = subject || `ent_${generateString(5)}`;
    let newPath;
    
    if(atNode){
        // if location to insert is a point, then get the parent node.
        const newPotentialParent =
            atNode.data?.type === 'entity'
            ? // if over an entity, we take the immediate row
                atNode
            : // if over a point, we take the parent row (which will be an entity, or root)
                atNode.parent;
        
        // if no data, parent is root. Otherwise an entity
        newPath = newPotentialParent?.data ? newPotentialParent.data.subject_path.slice() : []
        newPath.push(newSubject)
    } 
    // else grid is empty or user has selected empty space. Add to root.
    else {
        newPath = [newSubject]
    }

    return {
        "subject_path": newPath,
        "subject": newSubject,
        "label": label || "",
        "class": cls || "(not set)",
        "type": "entity"
    }
}

function generatePoint(atNode, {child=false, point_props={subject, label, cls}}={}){
    const newSubject = point_props.subject || `pnt_${generateString(5)}`;

    // get path of atNode; if null set path to root
    const newPath = atNode?.data ? atNode.data.subject_path.slice() : []
    // if child option set, try to add the point as child of atNode, else sibling.
    if(child && atNode){
        // if atNode is an entity then we can make point a child
        atNode.data?.type === 'entity' ? null : newPath.pop(); 

    } else newPath.pop();
    
    newPath.push(newSubject)

    return {
        "subject_path": newPath,
        "subject": newSubject,
        "label": point_props.label || "",
        "class": point_props.cls || "(not set)",
        "type": "point"
    }
}

//
// REVIEW THESE

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

// 

export { 
    generateEntity, 
    generatePoint, 
    moveToPath, 
}

//
// OLD
//

// clear linked sources
// function removeSourceFor(gridApi, rows){
//     const srcIds = rows.map(row => row.source).filter(Boolean)
//     const rowsToRefresh = []
//     srcIds.forEach(id => {
//         const node = gridApi.getRowNode(id)
//         node.data['source-for'] = null
//         rowsToRefresh.push(node.data)
//     })
//     const res = gridApi.applyTransaction({
//             update: rowsToRefresh
//     });
//     return res.update[0]
// }

// // simple function to generate new entity row data
// function generateNewEntity(overNode){
//     const id_str = generateString(5)
//     const subject = `ent_${id_str}`
//     let newPath;
    
//     if(overNode){
//         // if location to insert is a point, then get the parent node.
//         const newPotentialParent =
//             overNode.data?.type === 'entity'
//             ? // if over an entity, we take the immediate row
//                 overNode
//             : // if over a point, we take the parent row (which will be an entity, or root)
//                 overNode.parent;
        
//         // if no data, parent is root. Otherwise an entity
//         newPath = newPotentialParent?.data ? newPotentialParent.data.subject_path.slice() : []
//         newPath.push(subject)
//     } 
//     // else grid is empty or user has selected empty space. Add to root.
//     else {
//         newPath = [subject]
//     }

//     return {
//         "subject_path": newPath,
//         "subject": subject,
//         "label": "",
//         "class": "(not set)",
//         "type": "entity"
//     }
// }

// // replace above with this function
// function generateNewEntityWithParams(overNode, {subject, label, cls}={}){
//     // console.debug(subject, label, cls)
//     const newSubject = subject || `ent_${generateString(5)}`;
//     let newPath;
    
//     if(overNode){
//         // if location to insert is a point, then get the parent node.
//         const newPotentialParent =
//             overNode.data?.type === 'entity'
//             ? // if over an entity, we take the immediate row
//                 overNode
//             : // if over a point, we take the parent row (which will be an entity, or root)
//                 overNode.parent;
        
//         // if no data, parent is root. Otherwise an entity
//         newPath = newPotentialParent?.data ? newPotentialParent.data.subject_path.slice() : []
//         newPath.push(newSubject)
//     } 
//     // else grid is empty or user has selected empty space. Add to root.
//     else {
//         newPath = [newSubject]
//     }

//     return {
//         "subject_path": newPath,
//         "subject": newSubject,
//         "label": label || "",
//         "class": cls || "(not set)",
//         "type": "entity"
//     }
// }





// // create point at node
// // TODO: similarity with above functions
// function createNewPointAtNode(overNode){
//     const id_str = generateString(5)
//     const newPath = overNode?.data ? overNode.data.subject_path.slice() : []
//     newPath.pop();
//     const subject = `pnt_${id_str}`
//     newPath.push(subject)

//     return {
//         "subject_path": newPath,
//         "subject": subject,
//         "label": "",
//         "class": "(not set)",
//         "type": "point"
//     }

// }

// // above function should be 'over' node as I am popping the path. This fucntion inserts at the given node.
// function createNewPointAtNode2(overNode){
//     const id_str = generateString(5)
//     const newPath = overNode?.data ? overNode.data.subject_path.slice() : []
//     // newPath.pop();
//     const subject = `pnt_${id_str}`
//     newPath.push(subject)

//     return {
//         "subject_path": newPath,
//         "subject": subject,
//         "label": "",
//         "class": "(not set)",
//         "type": "point"
//     }

// }

// // replace above function with this
// function createNewPointAtNodeWithParams(overNode, {subject, label, cls}={}){
//     subject = subject || `pnt_${generateString(5)}`;
//     const newPath = overNode?.data ? overNode.data.subject_path.slice() : []
//     newPath.pop();
//     newPath.push(subject)

//     return {
//         "subject_path": newPath,
//         "subject": subject,
//         "label": label || "",
//         "class": cls || "(not set)",
//         "type": "point"
//     }
// }

