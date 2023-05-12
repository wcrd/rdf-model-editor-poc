<script>
    import ModelBuilder from "$lib/components/model-builder.svelte";
    import SourceGrid from "$lib/components/source-grid.svelte";
    import jsonImportExport from '$lib/js/json-import-export.js'
    
    import Modal from "$lib/components/modal.svelte";
    import SimpleModal from "$lib/components/modals/modal-simple.svelte"
    import JsonUploadModal from "$lib/components/modals/modal-upload-json.svelte"

    // import { modelGridAPI, sourceGridAPI } from '$lib/stores/store-grid-manager.js'
    import { sourceGridAPI } from '$lib/stores/store-grid-manager.js'
    import { toggle_edit_mode } from '$lib/js/source-grid-controller'

    // NEW
    import { modelGridAPI } from '$lib/stores/store-model-grid.js'
    import OntologyGrid from "$lib/components/ontology-grid.svelte";
    import { modelOntologyAPI } from '$lib/stores/store-ontology-grids.js'

    let srcViewFilterMode = 'all'
    let modelNodesToFilter;

    // vis control variables
    let src_hidden = false;
    let model_hidden = false;
    let model_ontology_hidden = true;
    let full_ontology_hidden = true;
    // mode variables
    let source_edit_mode = false;

    // Modal control
    let showModal = false;
    let modalContent = SimpleModal;
    let modalContentProps = { value: 7 };

    // Modal launcher
    function launchModal(modalComponent=null, modalProps={}){
        // open json uploader module
        modalContent = modalComponent;
        modalContentProps = modalProps;
        showModal = true;
        return
    }

    // move into common grid ops module
    function collapseRows(api) {
        api.collapseAll();
    }

    function expandRows(api) {
        api.expandAll();
    }


</script>

<div class="h-screen w-full flex flex-col">
    <div id="controller-bar-container" class="h-8 bg-red-100">
        <p>main button bar</p>
    </div>
    <div id="grids-container" class="h-full flex flex-row">
        <div id="model-ontology-panel" class="w-1/4 max-w-md h-full flex flex-col" class:hidden={model_ontology_hidden || model_hidden}>
            <div id="model-ontology-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between">
                <div>
                    <button class="btn-default" on:click={()=>expandRows($modelOntologyAPI.api)}>+</button>
                    <button class="btn-default" on:click={()=>collapseRows($modelOntologyAPI.api)}>-</button>
                </div>
            </div>
            <OntologyGrid bind:gridOptions={$modelOntologyAPI}/>
        </div>
        <div id="model-grid-container" class="w-1/2 h-full flex flex-col flex-grow" class:hidden={model_hidden}>
            <div id="model-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between">
                <div>
                    <button class="btn-subtle" on:click={()=>model_ontology_hidden=!model_ontology_hidden}>[>]</button>
                    <button class="btn-default" on:click={()=>jsonImportExport.export_all()}>Export JSON</button>
                    <button class="btn-default"on:click={() => launchModal(JsonUploadModal)}>Import JSON</button>
                    <button class="btn-subtle" on:click={()=>showModal=true}>Test Modal</button>
                </div>
                <div id="src-panel-slide">
                    <button class="btn-subtle" on:click={()=>src_hidden=!src_hidden}>
                        {#if src_hidden}
                        Show Source
                        {:else}
                        Hide Source
                        {/if}
                    </button>
                    {#if src_hidden && full_ontology_hidden }
                    <button class="btn-subtle" on:click={()=>full_ontology_hidden=!full_ontology_hidden}>[]</button>
                    {/if}
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
                    <span>| |</span>
                    <button class={source_edit_mode ? "btn-error" : "btn-default"} on:click={() => { source_edit_mode = !source_edit_mode; toggle_edit_mode(source_edit_mode)}}>
                        {#if source_edit_mode}
                        Stop Editing
                        {:else}
                        Edit Mode
                        {/if}
                    </button>
                </div>
                <div>
                    <button class="btn-subtle" on:click={()=>model_hidden=!model_hidden}>
                        {#if model_hidden}
                        Show Model
                        {:else}
                        Hide Model
                        {/if}
                    </button>
                    {#if full_ontology_hidden}
                    <button class="btn-subtle" on:click={()=>full_ontology_hidden=!full_ontology_hidden}>[]</button>
                    {/if}
                </div>
            </div>
            <SourceGrid bind:gridOptions={$sourceGridAPI} targetGrid={$modelGridAPI} filterMode={srcViewFilterMode} {modelNodesToFilter}/>
        </div>
        <div id="full-ontology-panel" class="w-1/4 max-w-md h-full flex flex-col" class:hidden={full_ontology_hidden}>
            <div id="full-ontology-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between">
                <button class="btn-subtle" on:click={()=>full_ontology_hidden=!full_ontology_hidden}>[]</button>
                <button class="btn-default">++</button>
            </div>
            <div>
                <p>Placeholder for ontology grid panel</p>
            </div>
        </div>
    </div>
</div>

<Modal bind:showModal {modalContent} {modalContentProps}>
    <p slot="header">This is a modal container</p>
</Modal>