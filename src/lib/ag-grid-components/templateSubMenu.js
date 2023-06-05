// submenu for entity from template
// TODO: Dynamic based on selections

const VAV = [
    {
        name: "VAV (Basic)",
        action: () => console.debug("Generating new VAV")
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