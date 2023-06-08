// submenu for entity from template
// TODO: Dynamic based on selections
import { get } from 'svelte/store'
import { shapeData } from '$lib/stores/store-shape-grid'

const VAV = [
    {
        name: "VAV (Basic)",
        action: () => {
            console.debug("Generating new VAV")
            console.debug(get(shapeData).filter(d => d.label == "VAV (Basic)"))
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