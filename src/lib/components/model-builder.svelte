<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
    import { debounce } from 'lodash'

    import { createEventDispatcher } from 'svelte'

    import { modelGridAPI, modelData, modelClassSet, potentialParent, potentialInsertNode } from '$lib/stores/store-model-grid.js'
    import { removeSourceLinks } from '$lib/js/shared-transactions.js'
    import { modelOntologyData } from '$lib/stores/store-ontology-grids.js'

    import { modelModelDragHandlers } from '$lib/js/row-dragging/model-model.js'
    import { onCellKeyDown } from '$lib/js/keydown-handlers.js'
    import { SrcCellRenderer } from '$lib/ag-grid-components/gridCellRenderers.js'
    import { classValueFormatter } from '$lib/js/common-grid.js'

    const dispatch = createEventDispatcher()

    const cellClassRules = {
        'hover-over': (params) => {return params.node === $potentialParent},
        'insert-at': (params) => { return params.node === $potentialInsertNode },
    };
    const rowClassRules = {
        'entity-row': (params) => { return params.node.data.type == "entity" }

    }

    const columnDefs = [
        // { rowDrag: true }, // drag handle
        { field: "subject_path", cellRenderer: params => { return `${params.value.join(" / ")}`} }, 
        { field: "subject" }, 
        { field: "label", editable: true },
        { field: "class", editable: true, valueFormatter: classValueFormatter },
        { field: "pointName", editable: true},
        { field: "type", hide: true },
        // internal fields
        { field: "source", cellRenderer: SrcCellRenderer}
    ];

    // let rowData = [];
    function onGridReady() {
        fetch("/fake-data.json")
            .then((resp) => resp.json())
            .then((data) => ($modelData = data))
            .then(() => modelClassSet.refresh())
    }

    export let srcGrid;

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
        rowClassRules: rowClassRules,
        getRowId: (params) => params.data.subject,
        // Row Dragging Config (Event Handlers for native Grid Events)
        // onRowDragEnter: e => {
        //     console.debug("Row Drag Begin: ", e)
        // },
        ...modelModelDragHandlers,
        getContextMenuItems: getContextMenuItems,
        onCellKeyDown: onCellKeyDown,
        onSelectionChanged: onSelectionChanged,
        onCellContextMenu: (event) => { event.node.isSelected() ? null : event.node.setSelected(true) },
        onCellValueChanged: (params) => {
            // refresh source grid so linked-data fields are re-fetched
            srcGrid.api.refreshCells({ columns: ['linked-class', 'linked-parent', 'linked-root-parent']});
            
            // refresh ontology grid if classes have changed
            // console.debug(params)
            if(params.column.colId == "class"){
                // TODO: make a common function for this whole operation
                // make it smarter by only evaluating changes/updates
                console.debug("Model class cell updates; refreshing model ontology")
                modelClassSet.refresh()
                modelOntologyData.refresh($modelClassSet)
            }
        },
        onRowDataUpdated: (params) => {
            // new data added or updated
            // debounce to prevent constant refreshes
            // console.log(params)
            debounce(() => {
                console.debug("Model row updates; refreshing model ontology")
                modelClassSet.refresh()
                modelOntologyData.refresh($modelClassSet)
            }, 500)()
        },
        context: {
            gridName: "model"
        }

    };

    

    // Context Menu
    function getContextMenuItems(params){
        const result = [
            {
                name: "Add Entity Here",
                // action: () => addNewEntityRow(params.api, params.node)
                action: () => modelGridAPI.addEntityRow(params.node)
            },
            {
                name: "Delete selected rows",
                action: () => { 
                    const nodes = params.api.getSelectedNodes()
                    const allNodes = nodes.flatMap(node => node.allLeafChildren)
                    const allRows = allNodes.map(node => node.data)
                    // update source grid to remove associations
                    removeSourceLinks({modelRows: allRows})
                    // removeRowsFromGrid(params.api, allRows)
                    modelGridAPI._updateGrid({remove: allRows})
                    // removeSourceFor(srcGrid.api, allRows)
                }
            },
            'separator',
            {
                name: "Remove associated sources",
                disabled: params.api.getSelectedNodes().some(node => node.data?.source ? false : true),
                action: () => { 
                    const allNodes = params.api.getSelectedNodes();
                    const allRows = allNodes.map(node => node.data)
                    // remove from src grid first, before updating model (otherwise this function doesn't work)
                    // removeSourceFor(srcGrid.api, allRows)
                    // now remove the src from the model row
                    // params.api.applyTransaction({
                    //     update: allRows.map(row => { row.source = null; return row })
                    // });
                    // modelGridAPI._updateGrid({ update: allRows.map(row => { row.source=null; return row })})
                    removeSourceLinks({modelRows: allRows})
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

    // on selection send event (used for filtering by source grid)
    function onSelectionChanged(event) {
      const selectedNodes = event.api.getSelectedNodes();
      dispatch("select", selectedNodes);
    };
    
</script>

<div id="modelGrid" class="ag-theme-alpine h-full w-full">
    <AgGridSvelte bind:rowData={$modelData} {columnDefs} {onGridReady} {gridOptions} class=""/>
</div>

<style>
    :global(.hover-over) {
        background-color:lemonchiffon;
    }
    :global(.insert-at) {
        border-top: 3px solid red !important;
    }
    /*  customise theme */
    :global(#modelGrid.ag-theme-alpine){
        --ag-odd-row-background-color: white;
    }
    :global(.entity-row){
        background-color: #f5f3f3;
    }
</style>