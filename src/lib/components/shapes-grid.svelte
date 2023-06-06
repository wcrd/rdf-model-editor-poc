<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    // import { ontologyData, ontologyAPI } from '$lib/stores/store-ontology-grids.js'
    import { shapeData } from "$lib/stores/store-shape-grid"
    import { modelGridAPI } from '$lib/stores/store-model-grid.js'
    import { classValueRenderer, addGridDropZone } from '$lib/js/common-grid.js'
    // import { ontModelDragParams } from '$lib/js/row-dragging/ont-model.js'
    import { ShapesCellRenderer } from "$lib/ag-grid-components/gridCellRenderers"


    // import { createEventDispatcher } from 'svelte'
    // const dispatch = createEventDispatcher()

    async function onGridReady(params){
        shapeData.getData();
        // modelOntologyData.refresh($modelClassSet);
        // Add model grid as valid drag-drop target
        // TODO: make more robust and move into parent; I don't like importing all the grid apis into each grid module.
        // setTimeout(()=>addGridDropZone(
        //         params, 
        //         $modelGridAPI.api,
        //         ontModelDragParams
        //     ), 1000)
    }

    export let gridOptions = {
        treeData: true,
        getDataPath: (data) => data.path,
        autoGroupColumnDef: {
            headerName: "Shape",
            sortable: true,
            cellRendererParams: {
                suppressCount: true,
                innerRenderer: ShapesCellRenderer
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
        rowSelection: false,
        rowData: null,
        context: {
            gridName: "shapes"
        }
    };


</script>

<div id="shapeGrid" class="ag-theme-alpine h-full w-full">
    <AgGridSvelte bind:rowData={$shapeData} {onGridReady} {gridOptions}/>
</div>