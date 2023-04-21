<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS


    const columnDefs = [
        { rowDrag: true, maxWidth: 40 }, // drag handle
        { field: "IP Address" },
        { field: "BACnet Network" },
        { field: "BACnet Device Name" },
        { field: "Device No" },
        { field: "Object Type" },
        { field: "Object Address" },
        { field: "Object Name" },
        { field: "Description" },
        { field: "BACnet Unit Of Measure" },
        { field: "Vendor" },
        { field: "Model" },
        { field: "Discovered Value" },
        // system
        { field: "row-id"},
        { field: "source-for"}
    ];

    let rowData = [];
    function onGridReady() {
        fetch("/test-src-data.json")
            .then((resp) => resp.json())
            .then((data) => (rowData = data));
    }

    let gridOptions = {
        treeData: false,
        // getDataPath: (data) => {
        //     // return data.subject_path ? [...data.subject_path.split("/"), data.subject] : [data.subject]
        //     return data.subject_path.split("/")

        // },
        getDataPath: (data) => data.subject_path,
        rowSelection: 'multiple',
        rowDragMultiRow: true,
        defaultColDef: {
            sortable: true,
            resizable: true,
            filter: true
        },
        autoGroupColumnDef: {
            rowDrag: true,
            groupSelectsChildren: false
        },
        // Row Dragging Config (Event Handlers for native Grid Events)

    };
    
</script>

<div class="ag-theme-alpine h-full w-full">
    <AgGridSvelte {rowData} {columnDefs} {onGridReady} {gridOptions} class=""/>
</div>

<style>
</style>