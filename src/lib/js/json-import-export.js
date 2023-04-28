function test(){
    console.log("hello")
}

function export_all(modelApi, sourceApi){
    const output = {
        model: {
            data: [],
        },
        sources: {
            data: []
        }
    }
    // need to manually loop through each grid and export
    modelApi.forEachNode(node => output.model.data.push(node.data));
    sourceApi.forEachNode(node => output.sources.data.push(node.data));

    // Generate data file target
    const data = encodeURI(JSON.stringify(output));
    // Autodownload (by creating hidden element)
    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/json;charset=utf-8,'+ data;
    hiddenElement.target = '_blank';
    hiddenElement.download = 'model_builder_save_file.json';
    hiddenElement.click();
    hiddenElement.remove();

    return true

}

async function import_json(file, modelData, sourceData){
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
    // TODO: Update this when new storage/data handling is done.
    // at the moment I am just crudley writing direct to grid. Should write to data store.
    // NOTE: because I am passing references to the array, re-assigning it to a new array does not work
    // I can only modify the array at this reference. If I re-assign, it won't update the original data!
    // This is why I need to swap to stores now. I know this doesn't do what it is meant to, just testing that I can 'import' something.
    // Hack to replace elements.
    modelData.length = 0;
    sourceData.length = 0;
    modelData.push(...data.model.data);
    sourceData.push(...data.sources.data);

    return true
}

export default { test, export_all, import_json }
export { test, export_all, import_json }
