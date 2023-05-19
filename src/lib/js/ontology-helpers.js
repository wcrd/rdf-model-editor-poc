/**
 * Given rowData from the ontology grid, get the class type from the path
 * Equipment, Point, Collection, Location, Measurable, Unknown 
 * @param {*} rowData 
 */
function getClassType(rowData){
    let type = "unknown"
    try {
        type = rowData.path.agGridPath[1]
    } catch {}
    return type
}

function isSelectionParentOfTarget(selectedNode, targetNode) {
    const children = selectedNode.childrenAfterGroup || [];
    for (let i = 0; i < children.length; i++) {
        if (targetNode && children[i].key === targetNode.key) return true;
        isSelectionParentOfTarget(children[i], targetNode);
    }
    return false;
}



function arePathsEqual(path1, path2) {
    if (path1.length !== path2.length) {
        return false;
    }

    let equal = true;
    path1.forEach((item, index) => {
        if (path2[index] !== item) {
            equal = false;
        }
    });

    return equal;
}

export {
    getClassType,
    isSelectionParentOfTarget,
    arePathsEqual
}