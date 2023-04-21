<script>
    import ModelBuilder from "$lib/components/model-builder.svelte";
    import SourceGrid from "$lib/components/source-grid.svelte";

    let srcViewFilterMode = 'all'
</script>

<div class="h-screen w-full flex flex-col">
    <div id="controller-bar-container" class="h-8 bg-red-100">
        <p>main button bar</p>
    </div>
    <div id="grids-container" class="h-full flex flex-row">
        <div id="model-grid-container" class="w-1/2 h-full flex flex-col">
            <div id="model-button-bar" class="h-12 w-full flex flex-row align-middle p-2">
                <p>Model button bar</p>
            </div>
            <ModelBuilder />
        </div>
        <div id="src-grid-container" class="w-1/2 h-full flex flex-col">
            <div id="source-button-bar" class="h-12 w-full flex flex-row align-middle p-2 space-x-2">
                <button class="btn-default" class:btn-selected={srcViewFilterMode=="unassigned"} on:click={()=>{srcViewFilterMode="unassigned"}}>Unassigned</button>
                <button class="btn-default" class:btn-selected={srcViewFilterMode=="assigned"} on:click={()=>{srcViewFilterMode="assigned"}}>Assigned</button>
                <button class="btn-default" class:btn-selected={srcViewFilterMode=="all"} on:click={()=>{srcViewFilterMode="all"}}>All</button>
            </div>
            <SourceGrid />
        </div>
    </div>
</div>