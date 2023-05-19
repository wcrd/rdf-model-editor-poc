<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

    import { sourceData, sourceGridColumnDefs, sourceEditedNodes } from '$lib/stores/store-grid-manager.js'

    // import { addGridDropZone } from '$lib/js/drag-and-drop.js'
    import { addGridDropZone } from '$lib/js/common-grid.js'
    import { onRowDragEnter } from '$lib/js/row-dragging.js'
    import { SrcCellRenderer, ParentCellRenderer } from '$lib/ag-grid-components/gridCellRenderers.js'
    import { get_linked_class, get_linked_parent, get_linked_root_parent } from '$lib/js/grid-data-helpers'
    import { srcModelDragParams } from '$lib/js/row-dragging/src-model.js'

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

    // track edited nodes
    // could also be done as data-column on rowData
    $sourceEditedNodes = new Set();
    
    const rowClassRules = {
        "row-assigned": params => !!params.node.data['source-for']
    }

    $sourceGridColumnDefs = [
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
        // { field: "_edited", hide: true, editable: false, suppressColumnsToolPanel: true }, // for change tracking
        // editing
        { field: "edit-class", hide: true, editable: false, suppressColumnsToolPanel: true },
        { field: "edit-parent", hide: true, editable: false, suppressColumnsToolPanel: true, 
            valueFormatter: (params)=>JSON.stringify(params.value), 
            cellRenderer: ParentCellRenderer, 
            cellEditorParams: {useFormatter: true},
            valueParser: params=>{
                // try to parse, else return old data
                let data = params.oldValue;
                try{
                    data = JSON.parse(params.newValue)
                } catch {
                    console.log("Invalid cell value format. Discarding changes. Soz. Please provide a valid JSON object next time.", params.newValue)
                }
                return data
            } 
        },
        // linked
        { field: "linked-class", valueGetter: (params)=> get_linked_class(params)},
        { field: "linked-parent", valueGetter: (params) => get_linked_parent(params), cellRenderer: ParentCellRenderer},
        { field: "linked-root-parent", valueGetter: (params) => get_linked_root_parent(params), cellRenderer: ParentCellRenderer },
    ];

    // let rowData = [];
    function onGridReady(params) {
        fetch("/test-src-data.json")
            .then((resp) => resp.json())
            .then((data) => (
                $sourceData = data.map(row => ({...row, type: "src"}) )
            )); // add the type to the imported data. In future will run dedicated import function here.
        // add row drop zone
        // setting delay to make sure other grid is intitalised
        // TODO: update this to be more robust.
        setTimeout(() => addGridDropZone(
                params, 
                targetGrid.api, 
                srcModelDragParams,
            ), 1000)   
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
            // rowDrag: true,
            groupSelectsChildren: false
        },
        getRowId: (params) => `${params.data['BACnet Network']}-${params.data['Device No']}-${params.data['Object Address']}`,
        // Row Dragging Config (Event Handlers for native Grid Events)
        onRowDragEnter: onRowDragEnter,
        animateRows: true,
        isExternalFilterPresent: isExternalFilterPresent,
        doesExternalFilterPass: doesExternalFilterPass,
        rowClassRules: rowClassRules,
        onCellValueChanged: (event) => { 
            // event.node.setDataValue('_edited', true)
            $sourceEditedNodes.add(event.node)
            // console.debug(event)
        } 
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

    // DEBUG
    // $: console.debug('srcData', rowData)
</script>

<div class="ag-theme-alpine h-full w-full">
    <AgGridSvelte bind:rowData={$sourceData} bind:columnDefs={$sourceGridColumnDefs} {onGridReady} bind:gridOptions={gridOptions} class=""/>
</div>

<style>
</style>