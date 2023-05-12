<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    import { modelOntologyAPI, ontologyData, modelOntologyData } from '$lib/stores/store-ontology-grids.js'
    import { modelClassSet } from '$lib/stores/store-model-grid.js'
    import { get } from "svelte/store";

    async function onGridReady(){
        await ontologyData.getData();
        modelOntologyData.refresh($modelClassSet);
    }

    export const gridOptions = {
        treeData: true,
        getDataPath: (data) => {
            if (data.path.full[0] == "https://brickschema.org/schema/Brick#Class"){
                return data.path.full.slice(1)
            }
            else {
                return null
            }
        },
        autoGroupColumnDef: {
            headerName: "Class",
            sortable: true,
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: classValueGetter
            },
            filter: 'agTextColumnFilter',
            resizable: true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true
        },
        defaultColDef: {
            sortable: true,
            flex: 1,
            resizable: true
        },
        rowSelection:'multiple',
        rowData: null,
        groupSelectsChildren: true,
    };

    function classValueGetter(params) {
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


</script>

<div id="modelOntologyGrid" class="ag-theme-alpine h-full w-full">
    <AgGridSvelte bind:rowData={$modelOntologyData} {onGridReady} {gridOptions}/>
</div>