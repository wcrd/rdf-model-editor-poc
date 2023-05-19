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

export {
    getClassType
}