//
// Generic functions to be used in grids
//

// Make this dynamic and kept in a store.
const PREFIXES = {
    "https://brickschema.org/schema/Brick": {prefix: "brick", icon: "🧱"},
    "https://switchautomation.com/schemas/BrickExtension": {prefix: "switch", icon: "🟢"},
    "http://www.w3.org/2002/07/owl": {prefix: "owl", icon: "🦉"}
}

/**
 * For an Ontology Grid with prefix, uri, term columns; renders a nice fragment with ontology icon.
 * @param params Column cell renderer param object from ag-grid  
 **/
// TODO: refactor to use prefix object above.
function classValueRenderer(params) {
    // console.debug(params)
    // SET ICON
    let icon = "❔" //🧱 🟢 ❔
    try {
        if(params.data.prefix == "brick") {
            icon = "🧱"
        } else if (params.data.prefix == "switch") {
            icon = "🟢"
        } else if (params.data.prefix == "owl") {
            icon = "🦉"
        }
    } catch(e) {
        console.log(`Grid::Class: No icon for given namespace of: ${params.value}`)
    }
    // SET NAME (TERM)
    try {
        return `${params.data.term} &nbsp; ${icon}`
    } catch {
        console.log(`Grid::Class: No term available for: ${params.value}`)
        return `${params.value} &nbsp; ${icon}`
    }
}

/**
 * For a class column displaying a valid URI, converts URI into fragment and ontology Icon.
 * @param params Column cell renderer param object from ag-grid  
 **/
function classValueFormatter(params){
    // console.debug(params)

    let icon = "❔"
    if(!params.value) return params.value
    try {
        const [ontology, fragment] = params.value.split("#")
        if(ontology in PREFIXES){
            return ` ${PREFIXES[ontology].icon} ${fragment}`
        }
        else {
            return `${fragment} ${icon}` // return with unknown icon.
        }
    }
    catch(e){
        console.log("ERROR: Class URI: Unable to process value")
        return params.value // return original data
    }
}

/**
 * Sets the quick filter for given grid using provided value.
 * @param api GridApi to set filter on
 * @param {string} value Value to filter the grid by
 * @param {boolean} [expand=false] Expand all rows after filtering, optional.
 * @returns null 
 **/
function setGridQuickFilter(api, value, expand=false){
    api.setQuickFilter(
        value
    );
    if(expand) api.expandAll();

    return
}


// 
// DRAG AND DROP
//
/**
 * Adds another ag-grid grid instance as a target for drag-and-drop operation from the current grid.
 * @param params Event parameters from ag-grid; dispatched by current grid, generally from onGridReady
 * @param targetGridApi Target grid api reference
 * @returns null 
 **/
function addGridDropZone(params, targetGridApi, rowDropZoneParams={}) {
    const dropZone = targetGridApi.getRowDropZoneParams(rowDropZoneParams);
  
    params.api.addRowDropZone(dropZone);
}


//
// GENERAL OPS
//

function refreshRows(api, rowsToRefresh) {
    if(!rowsToRefresh) return
    
    const params = {
        // refresh these rows only.
        rowNodes: rowsToRefresh,
        // because the grid does change detection, the refresh
        // will not happen because the underlying value has not
        // changed. to get around this, we force the refresh,
        // which skips change detection.
        force: true,
    };
    api.refreshCells(params);
}


export {
    classValueRenderer,
    classValueFormatter,
    setGridQuickFilter,
    addGridDropZone,
    refreshRows
}