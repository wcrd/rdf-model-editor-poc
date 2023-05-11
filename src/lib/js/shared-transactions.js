//
// Methods that need to be applied to both grids during the transaction
//
import { get } from "svelte/store";
import { sourceGridAPI } from "$lib/stores/store-grid-manager";
import { modelGridAPI } from "$lib/stores/store-model-grid";

function removeSourceLinks({ modelRows=[], sourceRows=[]}={}){
    const modelRowsToRefresh = [], sourceRowsToRefresh = [];

    // remove links from provided model rows
    if(modelRows.length){
        // clear referenced source rows
        const sourceRowIds = modelRows.map(row => row.source).filter(Boolean);
        sourceRowIds.forEach(id => {
            // get node from source grid
            const srcNode = get(sourceGridAPI).api.getRowNode(id);
            // clear source ref
            srcNode.data['source-for'] = null;
            // push to update stack
            sourceRowsToRefresh.push(srcNode.data); 
        })
        // clear model rows and add to update stack
        modelRowsToRefresh.push(...modelRows.map(row => { row.source = null; return row }))
    }

    // remove links from provided source rows
    if(sourceRows.length){
        // clear referenced model rows
        const modelRowIds = sourceRows.map(row => row['source-for']).filter(Boolean);
        modelRowIds.forEach(id =>{
            // get node from model grid
            const modelNode = get(modelGridAPI).api.getRowNode(id);
            // clear source ref
            modelNode.data.source = null;
            // push to update stack
            modelRowsToRefresh.push(modelNode.data)
        })
        // clear source rows and add to update stack
        sourceRowsToRefresh.push(...sourceRows.map(row => { row['source-for'] = null; return row }))
    }

    // execute updates
    sourceGridAPI._updateGrid({ update: sourceRowsToRefresh });
    modelGridAPI._updateGrid({ update: modelRowsToRefresh });    
}

function addSourceLink(modelNode, sourceNode){
    modelNode.data.source = sourceNode.id
    sourceNode.data['source-for'] = modelNode.id

    sourceGridAPI._updateGrid({ update: [sourceNode.data] });
    modelGridAPI._updateGrid({ update: [modelNode.data] });  
}


export {
    removeSourceLinks,
    addSourceLink
}