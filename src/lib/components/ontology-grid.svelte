<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    import { ontologyData, ontologyAPI } from '$lib/stores/store-ontology-grids.js'
    import { modelGridAPI } from '$lib/stores/store-model-grid.js'
    import { classValueRenderer, addGridDropZone } from '$lib/js/common-grid.js'
    import { classOverModelNode } from '$lib/js/row-dragging/ont-model.js'

    // import { createEventDispatcher } from 'svelte'
    // const dispatch = createEventDispatcher()

    async function onGridReady(params){
        ontologyData.getData();
        // modelOntologyData.refresh($modelClassSet);
        // Add model grid as valid drag-drop target
        // TODO: make more robust and move into parent; I don't like importing all the grid apis into each grid module.
        setTimeout(()=>addGridDropZone(
                params, 
                $modelGridAPI.api,
                {
                    onDragging: classOverModelNode
                }
            ), 1000)
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
                innerRenderer: classValueRenderer
            },
            filter: 'agTextColumnFilter',
            resizable: true,
            // checkboxSelection: true,
            // headerCheckboxSelection: true,
            // headerCheckboxSelectionFilteredOnly: true
            rowDrag: true,
        },
        defaultColDef: {
            sortable: true,
            flex: 1,
            resizable: true
        },
        rowSelection:'multiple',
        rowData: null,
        groupSelectsChildren: true,
        context: {
            gridName: "ontology"
        }
    };


</script>

<div id="modelOntologyGrid" class="ag-theme-alpine h-full w-full">
    <AgGridSvelte bind:rowData={$ontologyData} {onGridReady} {gridOptions}/>
</div>