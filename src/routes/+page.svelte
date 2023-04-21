<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    import { potentialParent, onRowDragEnd, onRowDragMove } from '$lib/row-dragging.js'
    import { generateNewEntity } from '$lib/entity-gen.js'

    const cellClassRules = {
        'hover-over': (params) => {return params.node === potentialParent}
    };

    const columnDefs = [
        // { rowDrag: true }, // drag handle
        { field: "subject_path", cellRenderer: params => { return `${params.value.join(" / ")}`} }, 
        { field: "subject" }, 
        { field: "label" },
        { field: "class" }
    ];

    let rowData = [];
    function onGridReady() {
        fetch("/fake-data.json")
            .then((resp) => resp.json())
            .then((data) => (rowData = data));
    }



    let gridOptions = {
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
        },
        // Row Dragging Config (Event Handlers for native Grid Events)
        // onRowDragEnter: e => {
        //     console.debug("Row Drag Begin: ", e)
        // },
        onRowDragLeave: e => {
            console.debug("You left the grid yo stupid fok")
        },
        onRowDragMove: onRowDragMove,
        onRowDragEnd: onRowDragEnd,
        getContextMenuItems: getContextMenuItems,
        onCellKeyDown: onCellKeyDown

    };

    // custom keypress capture and handler
    function onCellKeyDown(e){
        const kc = e.event.keyCode; // easier to reference multiple times
        // SHIFT + ENTER
        if ( kc == 13 && e.event.shiftKey == true ){
            // console.log("Shift+Enter: Create new entity!", e)
            addNewEntityRow(e.api, e.node)
        }
        // ARROWS (clear selection when arrows are used; user is cell editing)
        // Left: 37 Up: 38 Right: 39 Down: 40
        else if ( kc == 37 || kc == 38 || kc == 39 || kc == 40 ){
            e.api.deselectAll();
        }
    }

    // HELPER: Insert new row
    function addNewEntityRow(api, overNode){
        api.applyTransaction({
            add: [generateNewEntity(overNode)],
        })
    }

    // Context Menu
    function getContextMenuItems(params){
        const result = [
            {
                name: "Add Entity Here",
                action: () => {
                    params.api.applyTransaction({
                        add: [generateNewEntity(params.node)],
                    })
                }
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
    
</script>

<div class="ag-theme-alpine h-screen w-full flex flex-col">
    <AgGridSvelte {rowData} {columnDefs} {onGridReady} {gridOptions} class=""/>
</div>

<style>
    :global(.hover-over) {
        background-color:lemonchiffon;
    }
</style>