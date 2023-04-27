<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    import { addGridDropZone } from '$lib/js/drag-and-drop.js'
    import { onRowDragEnter } from '$lib/js/row-dragging.js'
    import { SrcCellRenderer } from '$lib/ag-grid-components/srcCellRenderer.js'

    // get target grid dropzone
    export let targetGrid;
    // filter button state
    export let filterMode;
    $: externalFilterChanged(filterMode)
    // model selection filtering
    export let modelNodesToFilter = [];
    let nodesToFilter=[];
    // if filterMode, then action
    $: {
        if(filterMode=="model"){
            // get all leaf nodes
            nodesToFilter = []
            modelNodesToFilter.forEach((node) => {
                nodesToFilter.push(...node.allLeafChildren)
            })
            // lets extract just the id
            nodesToFilter = nodesToFilter.map((node) => node.data.source).filter(item => item)
            // console.debug(nodesToFilter)
            externalFilterChanged(modelNodesToFilter)
        }
    }
    
    const rowClassRules = {
        "row-assigned": params => !!params.node.data['source-for']
    }

    const columnDefs = [
        { rowDrag: true, valueGetter: 'node.id', headerName: 'src-id'}, // drag handle
        { field: "IP Address", hide: true },
        { field: "BACnet Network", hide: true },
        { field: "BACnet Device Name" },
        { field: "Device No" },
        { field: "Object Type", hide: true },
        { field: "Object Address" },
        { field: "Object Name" },
        { field: "Description" },
        { field: "BACnet Unit Of Measure" },
        { field: "Vendor", hide: true },
        { field: "Model", hide: true },
        { field: "Discovered Value", hide: true },
        // system
        { field: "source-for", cellRenderer: SrcCellRenderer},
        { field: "type", hide: true },
        // linked
        { field: "linked-class", valueGetter: (params)=>{ return params.data['source-for'] ? targetGrid.api.getRowNode(params.data['source-for']).data.class : null } },
        { field: "linked-root-parent", valueGetter: (params)=>{ 
                if(params.data['source-for']){
                    const path = targetGrid.api.getRowNode(params.data['source-for']).data.subject_path
                    return path.length == 1 ? "(not set)" : path[0]
                } else return null;
            }
        },
        { field: "linked-parent", valueGetter: (params)=>{ 
                if(params.data['source-for']){ 
                    // get last two elements; if only one returned then no parent
                    const path = targetGrid.api.getRowNode(params.data['source-for']).data.subject_path.slice(-2); 
                    return path.length == 1 ? "(not set)" : path[0] 
                } else return null
            },
        },
    ];

    let rowData = [];
    function onGridReady(params) {
        fetch("/test-src-data.json")
            .then((resp) => resp.json())
            .then((data) => (rowData = data.map(row => ({...row, type: "src"}) ))); // add the type to the imported data. In future will run dedicated import function here.
        // add row drop zone
        // setting delay to make sure other grid is intitalised
        // TODO: update this to be more robust.
        setTimeout(() => addGridDropZone(params, targetGrid.api), 1000)   
    };

    export let gridOptions = {
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
            filter: true,
            rowDrag: true, // all row drag from any cell
        },
        autoGroupColumnDef: {
            rowDrag: true,
            groupSelectsChildren: false
        },
        getRowId: (params) => `${params.data['BACnet Network']}-${params.data['Device No']}-${params.data['Object Address']}`,
        // Row Dragging Config (Event Handlers for native Grid Events)
        onRowDragEnter: onRowDragEnter,
        animateRows: true,
        isExternalFilterPresent: isExternalFilterPresent,
        doesExternalFilterPass: doesExternalFilterPass,
        rowClassRules: rowClassRules
    };
    
    function isExternalFilterPresent(){
        return filterMode != 'all'
    }

    function doesExternalFilterPass(node){
        if (node.data){
            switch (filterMode){
                case 'assigned':
                    return !!node.data['source-for']
                case 'unassigned':
                    return !node.data['source-for']
                case 'model':
                    return modelNodesToFilter.length ? nodesToFilter.includes(node.id) : true // check if any nodes are selected in model grid; if so try and filter, if not, show all.
                default:
                    return true
            }
        }
    }

    function externalFilterChanged(trigger){
        if(gridOptions?.api) gridOptions.api.onFilterChanged();
    }

</script>

<div class="ag-theme-alpine h-full w-full">
    <AgGridSvelte {rowData} {columnDefs} {onGridReady} {gridOptions} class=""/>
</div>

<style>
</style>