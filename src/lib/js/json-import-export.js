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

export default { test, export_all }