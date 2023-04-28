<script>
    import { import_json } from '$lib/js/json-import-export.js'

    export let dialog; // reference to parent dialog
    export let modelData, sourceData; // references to data objects for grids.
    let files;

    async function uploadJson(file){
        console.debug(modelData, sourceData)
        const res = await import_json(file, modelData, sourceData)
        // console.debug("Data in modal post func:", modelData, sourceData)
        modelData = modelData; sourceData = sourceData;
        if(res) console.log("Import successful.")
        else console.log("There was an error when processing the import.")
        // return
        dialog.close();
    }
</script>

<div class="flex flex-col gap-2">
    <h6 class="text-red-500 border-red-500 p-1 border rounded-lg font-semibold">
        This process will clear the model and source grids. Make sure you have saved your work!
    </h6>
    <input 
        type="file"
        name="json-upload"
        id="json-upload"
        accept=".json"
        bind:files
    >
    <hr>
    <div class="self-end">
        <button class="btn-error" on:click={() => dialog.close()}>Cancel</button>
        <button class="btn-default" on:click={() => uploadJson(files[0])}>Upload</button>
    </div>
</div>
