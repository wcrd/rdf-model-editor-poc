<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    const columnDefs = [
        { field: "subject_path" }, 
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
        getDataPath: (data) => {
            return data.subject_path ? [...data.subject_path.split("/"), data.subject] : [data.subject]
        },
        defaultColDef: {
            sortable: true
        },

    };
</script>

<div class="ag-theme-alpine h-screen w-full flex flex-col">
    <AgGridSvelte {rowData} {columnDefs} {onGridReady} {gridOptions} class=""/>
</div>