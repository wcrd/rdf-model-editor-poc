<script>
    import ModelBuilder from "$lib/components/model-builder.svelte";
    import SourceGrid from "$lib/components/source-grid.svelte";

    import { modelGridAPI, sourceGridAPI } from '$lib/stores/store-grid-manager.js'

    let srcViewFilterMode = 'all'
    let modelNodesToFilter;

    // vis control variables
    let src_hidden = false;
    let model_hidden = false;

</script>

<div class="h-screen w-full flex flex-col">
    <div id="controller-bar-container" class="h-8 bg-red-100">
        <p>main button bar</p>
    </div>
    <div id="grids-container" class="h-full flex flex-row">
        <div id="model-grid-container" class="w-1/2 h-full flex flex-col flex-grow" class:hidden={model_hidden}>
            <div id="model-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between">
                <div>Buttons</div>
                <div id="src-panel-slide">
                    <button class="btn-subtle" on:click={()=>src_hidden=!src_hidden}>
                        {#if src_hidden}
                        Show Source
                        {:else}
                        Hide Source
                        {/if}
                    </button>
                </div>
            </div>
            <ModelBuilder bind:gridOptions={$modelGridAPI} srcGrid={$sourceGridAPI} on:select={(m)=>modelNodesToFilter=m.detail} />
        </div>
        <div id="src-grid-container" class="w-1/2 h-full flex flex-col flex-grow" class:hidden={src_hidden}>
            <div id="source-button-bar" class="h-12 w-full flex flex-row align-middle p-2 space-x-2 justify-between">
                <div>
                    <button class="btn-default" class:btn-selected={srcViewFilterMode=="unassigned"} on:click={()=>{srcViewFilterMode="unassigned"}}>Unassigned</button>
                    <button class="btn-default" class:btn-selected={srcViewFilterMode=="assigned"} on:click={()=>{srcViewFilterMode="assigned"}}>Assigned</button>
                    <button class="btn-default" class:btn-selected={srcViewFilterMode=="all"} on:click={()=>{srcViewFilterMode="all"}}>All</button>
                    <span>|</span>
                    <button class="btn-default" class:btn-selected={srcViewFilterMode=="model"} on:click={()=>{srcViewFilterMode="model"}}>Model Selection</button>
                </div>
                <div>
                    <button class="btn-subtle" on:click={()=>model_hidden=!model_hidden}>
                        {#if model_hidden}
                        Show Model
                        {:else}
                        Hide Model
                        {/if}
                    </button>
                </div>
            </div>
            <SourceGrid bind:gridOptions={$sourceGridAPI} targetGrid={$modelGridAPI} filterMode={srcViewFilterMode} {modelNodesToFilter}/>
        </div>
    </div>
</div>