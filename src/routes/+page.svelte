<script>
    import AgGridSvelte from "ag-grid-svelte";
    import 'ag-grid-enterprise'
    import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
    import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

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
            cellClassRules: cellClassRules
        },
        autoGroupColumnDef: {
            rowDrag: true,
        },
        // Row Dragging Config (Event Handlers for native Grid Events)
        onRowDragEnter: e => {
            console.debug("Row Drag Begin: ", e)
        },
        onRowDragLeave: e => {
            console.debug("You left the grid yo stupid fok")
        },
        onRowDragMove: onRowDragMove,
        onRowDragEnd: onRowDragEnd

    };
    
    // ###################################################
    // Row moving controllers
    //

    let potentialParent = null;

    function onRowDragMove(event){
        setPotentialParentForNode(event.api, event.overNode)
    }


    // Single Selection Only

    function setPotentialParentForNode(gridApi, overNode){
        let newPotentialParent;
        
        // set parent to node we are hovering near
        if (overNode) {
        newPotentialParent =
            overNode.data?.type === 'entity'
            ? // if over an entity, we take the immediate row
                overNode
            : // if over a point, we take the parent row (which will be an entity, or root)
                overNode.parent;
        } else {
            newPotentialParent = null;
        }

        // check if it is the current parent
        const alreadySelected = potentialParent === newPotentialParent;
        if (alreadySelected) {
            return; // exit early, nothing to change
        }

        // if a new parent, lets remove highlight from old potential parent and highligh this one
        // we refresh the previous selection (if it exists) to clear
        // the highlighted and then the new selection.
        const rowsToRefresh = [];
        if (potentialParent) {
            rowsToRefresh.push(potentialParent);
        }
        if (newPotentialParent) {
            rowsToRefresh.push(newPotentialParent);
        }
    
        potentialParent = newPotentialParent;
    
        refreshRows(gridApi, rowsToRefresh);
    };

    function refreshRows(api, rowsToRefresh) {
        var params = {
        // refresh these rows only.
        rowNodes: rowsToRefresh,
        // because the grid does change detection, the refresh
        // will not happen because the underlying value has not
        // changed. to get around this, we force the refresh,
        // which skips change detection.
        force: true,
        };
        api.refreshCells(params);
    }

    function onRowDragEnd(event){
        if(!potentialParent){
            return
        }

        // Updated to support multiple selection dragging
        const newParentPath = potentialParent.data ? potentialParent.data.subject_path : [];
        // filter to just nodes that need parents updated
        const nodesToChangeParent = event.nodes.filter((node) => {
            if(!arePathsEqual(newParentPath, node.data.subject_path)){
                return true
            };
            return false
        });

        // check if any nodes that are being updated are being moved into their own child
        const invalidMode = nodesToChangeParent.some(node => isSelectionParentOfTarget(node, potentialParent));
        if (invalidMode) {
            console.log('Not allowed.');
        }

        if (nodesToChangeParent.length>0 && !invalidMode) {
            const updatedRows = [];
            // for each node, lets move path
            nodesToChangeParent.forEach(node => {
                moveToPath(newParentPath, node, updatedRows);
            });
            event.api.applyTransaction({
                update: updatedRows,
            });
            event.api.clearFocusedCell();
        }
        
        // OLD - Single selection dragging ONLY
        // const rowDataToMove = event.node.data;
        // // console.debug("Row data to move: ", rowDataToMove, "Potential Parent: ", potentialParent)
        // // take new parent path from parent, if data is missing, means it's the root node,
        // // which has no data.
        // const newParentPath = potentialParent.data ? potentialParent.data.subject_path : [];
        // const needToChangeParent = !arePathsEqual(newParentPath, rowDataToMove.subject_path);
    
        // // check we are not moving a entity into a child entity
        // const invalidMode = isSelectionParentOfTarget(event.node, potentialParent);
        // if (invalidMode) {
        //     console.log('Not allowed.');
        // }
  
        // if (needToChangeParent && !invalidMode) {
        //     const updatedRows = [];
        //     moveToPath(newParentPath, event.node, updatedRows);
        
        //     event.api.applyTransaction({
        //         update: updatedRows,
        //     });
        //     event.api.clearFocusedCell();
        // }


        // clear node to highlight
        setPotentialParentForNode(event.api, null);

    
    }

    function arePathsEqual(path1, path2) {
        if (path1.length !== path2.length) {
            return false;
        }
    
        let equal = true;
        path1.forEach((item, index) => {
            if (path2[index] !== item) {
                equal = false;
            }
        });
    
        return equal;
    }

    function isSelectionParentOfTarget(selectedNode, targetNode) {
        const children = selectedNode.childrenAfterGroup || [];
        for (let i = 0; i < children.length; i++) {
            if (targetNode && children[i].key === targetNode.key) return true;
                isSelectionParentOfTarget(children[i], targetNode);
            }
        return false;
    }

    function moveToPath(newParentPath, node, allUpdatedNodes) {
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
                moveToPath(newChildPath, childNode, allUpdatedNodes);
            });
        }
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