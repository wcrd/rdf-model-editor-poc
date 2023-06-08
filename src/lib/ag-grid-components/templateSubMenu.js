// submenu for entity from template
// TODO: Dynamic based on selections
import { get } from 'svelte/store'
import { shapeData } from '$lib/stores/store-shape-grid'
import { generateFromShape } from '$lib/js/shape-helpers'

const VAV = [
    {
        name: "VAV (Basic)",
        action: () => {
            console.debug("Generating new VAV")
            const template = get(shapeData).filter(d => d.label == "VAV (Basic)");
            console.debug(template)
            generateFromShape(template)
        }
    }
]


export const subMenu = [
    {
        name: "VAV",
        subMenu: VAV
    },
    {
        name: "AHU",
        disabled: true
    }
]