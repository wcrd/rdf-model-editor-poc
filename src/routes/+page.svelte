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
    import ModelOntologyGrid from "$lib/components/model-ontology-grid.svelte";
    import { modelOntologyAPI, ontologyAPI } from '$lib/stores/store-ontology-grids.js'
    import OntologyGrid from "$lib/components/ontology-grid.svelte";
    import { setGridQuickFilter } from "$lib/js/common-grid.js"

    let srcViewFilterMode = 'all'
    let modelNodesToFilter;

    // vis control variables
    let src_hidden = false;
    let model_hidden = false;
    let model_ontology_hidden = true;
    let full_ontology_hidden = true;
    // mode variables
    let source_edit_mode = false;

    // filter variables
    let filter_classes = []; // classes to filter the model to
    // We don't need these variables as we could filter directly from the input element.
    // however keeping for now incase I want to set or clear via another function.
    let model_ontology_filter_input;
    let model_filter_input;
    let source_filter_input;
    let ontology_filter_input;


    // MOVE LATER
    // Filtering
    // Function to set the 'class' SET type filter on main grid
    function setModelClassFilter(itemsToFilter){
        try {
            const filterInstance = $modelGridAPI.api.getFilterInstance('class');
            // console.log(grid_api)
            // console.log(filterInstance)
            // Get Set filter
            // const setFilter = filterInstance.filters.filter(filter => filter.filterNameKey == "setFilter")[0]
            // assuming single filter type column for now. If not use above code.
            const setFilter = filterInstance;
            // console.log(setFilter, grid_api)
            if (itemsToFilter.length==0){
                setFilter.resetFilterValues()
                setFilter.setModel(null)
                $modelGridAPI.api.onFilterChanged()
            } else {
                setFilter.setModel({ values: itemsToFilter }).then(function() { $modelGridAPI.api.onFilterChanged(); });
            }
        } catch {
            console.log('Grid not ready to filter')
        }
    }

    // handle filter class selection
    function handleClassSelection(event){
        filter_classes = event.detail.map(row => row.data.uri)
    }

    // Call the filter everytime the filter list changes
    $: {
        setModelClassFilter(filter_classes)
    }

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
    <div id="controller-bar-container" class="h-8 bg-red-100 flex flex-row p-1 gap-x-1">
        <p>main button bar</p>
        <button class="btn-subtle !py-0" on:click={()=>showModal=true}>Test Modal</button>
    </div>
    <div id="grids-container" class="h-full flex flex-row">
        <div id="model-ontology-panel" class="w-1/4 max-w-md h-full flex flex-col" class:hidden={model_ontology_hidden || model_hidden}>
            <div id="model-ontology-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between gap-x-1">
                <div>
                    <button class="btn-default" on:click={()=>expandRows($modelOntologyAPI.api)}>+</button>
                    <button class="btn-default" on:click={()=>collapseRows($modelOntologyAPI.api)}>-</button>
                </div>
                <div class="border rounded border-blue-500 flex-grow">
                    <input class="w-full outline-none" type="search" id="model-ontology-filter-text-box" bind:value={model_ontology_filter_input} placeholder="Filter..." on:input={()=>setGridQuickFilter($modelOntologyAPI.api, model_ontology_filter_input, true)}>
                </div>
            </div>
            <ModelOntologyGrid bind:gridOptions={$modelOntologyAPI} on:select={(e)=>handleClassSelection(e)}/>
        </div>
        <div id="model-grid-container" class="w-1/2 h-full flex flex-col flex-grow" class:hidden={model_hidden}>
            <div id="model-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between gap-x-1">
                <div class="flex flex-row gap-x-1 flex-grow">
                    <button class="btn-subtle" on:click={()=>model_ontology_hidden=!model_ontology_hidden}>[>]</button>
                    <button class="btn-default" on:click={()=>jsonImportExport.export_all()}>Export JSON</button>
                    <button class="btn-default"on:click={() => launchModal(JsonUploadModal)}>Import JSON</button>
                    
                    <div class="border rounded border-blue-500 flex-grow">
                        <input class="w-full outline-none" type="search" id="model-filter-text-box" bind:value={model_filter_input} placeholder="Filter..." on:input={()=>setGridQuickFilter($modelGridAPI.api, model_filter_input, true)}>
                    </div>
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
                <div class="flex flex-row gap-x-1 flex-grow">
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
                    <span>|</span>
                    <div class="border rounded border-blue-500 flex-grow">
                        <input class="w-full outline-none" type="search" id="source-filter-text-box" bind:value={source_filter_input} placeholder="Filter..." on:input={()=>setGridQuickFilter($sourceGridAPI.api, source_filter_input, false)}>
                    </div>
                </div>
                <div class="flex flex-row">
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
            <div id="full-ontology-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between gap-x-1">
                <div>
                    <button class="btn-subtle" on:click={()=>full_ontology_hidden=!full_ontology_hidden}>[]</button>
                    <button class="btn-default" on:click={()=>expandRows($ontologyAPI.api)}>+</button>
                    <button class="btn-default" on:click={()=>collapseRows($ontologyAPI.api)}>-</button>
                </div>
                <div class="border rounded border-blue-500 flex-grow">
                    <input class="w-full outline-none" type="search" id="ontology-filter-text-box" bind:value={ontology_filter_input} placeholder="Filter..." on:input={()=>setGridQuickFilter($ontologyAPI.api, ontology_filter_input, true)}>
                </div>
            </div>
            <OntologyGrid bind:gridOptions={$ontologyAPI} />
        </div>
    </div>
</div>

<Modal bind:showModal {modalContent} {modalContentProps}>
    <p slot="header">This is a modal container</p>
</Modal>