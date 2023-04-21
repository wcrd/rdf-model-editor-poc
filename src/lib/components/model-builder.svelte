<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    import { createEventDispatcher } from 'svelte'

    import { potentialParent, onRowDragEnd, onRowDragMove, onRowDragEnter } from '$lib/js/row-dragging.js'
    import { addNewEntityRow } from '$lib/js/grid-operations.js'
    import { onCellKeyDown } from '$lib/js/keydown-handlers.js'
    import { SrcCellRenderer } from '$lib/ag-grid-components/srcCellRenderer.js'

    const dispatch = createEventDispatcher()

    const cellClassRules = {
        'hover-over': (params) => {return params.node === potentialParent}
    };

    const columnDefs = [
        // { rowDrag: true }, // drag handle
        { field: "subject_path", cellRenderer: params => { return `${params.value.join(" / ")}`} }, 
        { field: "subject" }, 
        { field: "label" },
        { field: "class" },
        { field: "type" },
        // internal fields
        { field: "source", cellRenderer: SrcCellRenderer}
    ];

    let rowData = [];
    function onGridReady() {
        fetch("/fake-data.json")
            .then((resp) => resp.json())
            .then((data) => (rowData = data));
    }



    export let gridOptions = {
        treeData: true,
        // getDataPath: (data) => {
        //     // return data.subject_path ? [...data.subject_path.split("/"), data.subject] : [data.subject]
        //     return data.subject_path.split("/")

        // },
        getDataPath: (data) => data.subject_path,
        rowSelection: 'multiple',
        rowDragMultiRow: true,
        defaultColDef: {
            sortable: true,
            cellClassRules: cellClassRules,
            resizable: true,
            filter: true
        },
        autoGroupColumnDef: {
            rowDrag: true,
            groupSelectsChildren: false
        },
        getRowId: (params) => params.data.subject,
        // Row Dragging Config (Event Handlers for native Grid Events)
        // onRowDragEnter: e => {
        //     console.debug("Row Drag Begin: ", e)
        // },
        onRowDragLeave: e => {
            console.debug("You left the grid yo stupid fok")
        },
        onRowDragMove: onRowDragMove,
        onRowDragEnd: onRowDragEnd,
        onRowDragEnter: onRowDragEnter,
        getContextMenuItems: getContextMenuItems,
        onCellKeyDown: onCellKeyDown,
        onSelectionChanged: onSelectionChanged

    };

    

    // Context Menu
    function getContextMenuItems(params){
        const result = [
            {
                name: "Add Entity Here",
                action: () => addNewEntityRow(params.api, params.node)
            },
            'separator',
            {
                name: "Add selection to new Entity",
                disabled: true,
                action: () => console.log("Created new entity and added selected items.")
            },
            {
                name: "Add selected to System",
                disabled: true,
                action: () => console.log("Adding selected to selected system from modal.")
            }
        ]

        return result

    }

    // on selection send event (used for filtering by source grid)
    function onSelectionChanged(event) {
      const selectedNodes = event.api.getSelectedNodes();
      dispatch("select", selectedNodes);
    };
    
</script>

<div class="ag-theme-alpine h-full w-full">
    <AgGridSvelte {rowData} {columnDefs} {onGridReady} {gridOptions} class=""/>
</div>

<style>
    :global(.hover-over) {
        background-color:lemonchiffon;
    }
</style>