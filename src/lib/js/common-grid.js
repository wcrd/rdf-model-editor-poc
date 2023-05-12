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

export {
    classValueRenderer,
    classValueFormatter
}