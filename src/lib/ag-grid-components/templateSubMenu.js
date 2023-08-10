// submenu for entity from template
// TODO: Dynamic based on selections
import { get } from 'svelte/store'
import { shapeData } from '$lib/stores/store-shape-grid'
import { generateFromShape } from '$lib/js/shape-helpers'

function VAV(params, gridAPI) {
    return [
        {
            name: "VAV (Basic)",
            action: () => {
                console.debug("Generating new VAV")
                const template = get(shapeData).filter(d => d.label == "VAV (Basic)");
                // console.debug(template)
                const rowsToAdd = generateFromShape(template)
                // console.debug(rowsToAdd)
                gridAPI._updateGrid({ add: rowsToAdd })
            }
        },
        {
            name: "VAV (Dual Damper)",
            action: () => {
                console.debug("Generating new VAV")
                const template = get(shapeData).filter(d => d.label == "VAV (Dual Damper)");
                // console.debug(template)
                const rowsToAdd = generateFromShape(template)
                // console.debug(rowsToAdd)
                gridAPI._updateGrid({ add: rowsToAdd })
            }
        }
    ]
}


export function subMenu(params, gridAPI) {
    return [
        {
            name: "VAV",
            subMenu: VAV(params, gridAPI)
        },
        {
            name: "AHU",
            disabled: true
        }
    ]
}