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
            groupSelectsChildren: false
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
        if ( kc == 13 && e.event.shiftKey && !e.event.ctrlKey ){
            addNewEntityRow(e.api, e.node)
        }
        // CTRL + SHIFT + ENTER
        else if (kc == 13 && e.event.shiftKey && e.event.ctrlKey ){
            // console.debug(e)
            // Gather selected
            const selectedNodes = e.api.getSelectedNodes();
            // console.debug("Selected Nodes: ", selectedNodes)
            // Check that all have same parent
            const parents = new Set(selectedNodes.map(node => node?.parent))
            // console.debug("Parents: ", parents)
            if ( parents.size != 1) { console.log("Auto nesting entities with different parents not allowed."); return }
            const [newParent] = parents; // extract parent from set 
            // Write new node
            const newNode = addNewEntityRow(e.api, newParent)
            // console.debug("New Node: ", newNode)
            // Add selected as children of node
            // REFACTOR - this is same code as row-dragging; make new module row-operations
            const updatedRows = [];
            selectedNodes.forEach(node => {
                moveToPath2(newNode.data.subject_path, node, updatedRows);
            });
            e.api.applyTransaction({
                update: updatedRows,
            });
            e.api.clearFocusedCell();

        }
        // ARROWS (clear selection when arrows are used; user is cell editing)
        // Left: 37 Up: 38 Right: 39 Down: 40
        else if ( kc == 37 || kc == 38 || kc == 39 || kc == 40 ){
            e.api.deselectAll();
        }
    }

    // REFACTOR - this is same code as row-dragging; make new module row-operations
    function moveToPath2(newParentPath, node, allUpdatedNodes) {
        // last part of the file path is the file name
        const oldPath = node.data.subject_path;
        const leafName = oldPath.pop();
        const newChildPath = newParentPath.slice();
        newChildPath.push(leafName);

        node.data.subject_path = newChildPath;

        allUpdatedNodes.push(node.data);
        
        // if the node we move has children of its own, they need to be updated.
        if (node.childrenAfterGroup) {
            node.childrenAfterGroup.forEach((childNode) => {
                moveToPath2(newChildPath, childNode, allUpdatedNodes);
            });
        }
    }

    // HELPER: Insert new row
    function addNewEntityRow(api, overNode){
        const transactionResults = api.applyTransaction({
            add: [generateNewEntity(overNode)],
        })
        return transactionResults.add[0]
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