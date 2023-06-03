import { get } from 'svelte/store';
// import { modelGridAPI, sourceGridAPI, modelData, sourceData } from '$lib/stores/store-grid-manager.js'
import { sourceGridAPI, sourceData } from '$lib/stores/store-grid-manager.js'
import { modelGridAPI, modelData } from '$lib/stores/store-model-grid.js'

function test(){
    console.log("hello")
}

function export_all(){
    const output = {
        model: {
            data: [],
        },
        sources: {
            data: []
        }
    }
    // need to manually loop through each grid and export
    get(modelGridAPI).api.forEachNode(node => output.model.data.push(node.data));
    get(sourceGridAPI).api.forEachNode(node => output.sources.data.push(node.data));

    // Generate data file target
    const data = encodeURIComponent(JSON.stringify(output));
    // Autodownload (by creating hidden element)
    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,'+ data;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'model_builder_save_file.json';
    hiddenElement.click();
    hiddenElement.remove();

    return true

}

async function import_json(file){
    // read file data
    let fileData = await file.text();
    const data = await JSON.parse(fileData);
    // console.debug(data)

    // check data structure
    if(!data?.model?.data || !data?.sources?.data){
        console.log("ERROR: JSON file is not recognised as a save file from this application.")
        return false
    } else console.debug("JSON validation passed.")

    // clear the grids and process new data;
    modelData.set(data.model.data)
    sourceData.set(data.sources.data)

    return true
}

export default { test, export_all, import_json }
export { test, export_all, import_json }
