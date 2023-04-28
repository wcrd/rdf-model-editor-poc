<script>
    let files;
</script>

<div class="flex flex-col h-32 gap-2">
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

    <p>{files}</p>
</div>
