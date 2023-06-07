<script>
    import ModelBuilder from "$lib/components/model-builder.svelte";
    import SourceGrid from "$lib/components/source-grid.svelte";
    import jsonImportExport from '$lib/js/json-import-export.js'

    import { setData } from "$lib/js/grid-persistance/grid2indexedDB"
    
    import Modal from "$lib/components/modal.svelte";
    import SimpleModal from "$lib/components/modals/modal-simple.svelte"
    import JsonUploadModal from "$lib/components/modals/modal-upload-json.svelte"

    // import { modelGridAPI, sourceGridAPI } from '$lib/stores/store-grid-manager.js'
    import { sourceGridAPI, dragMode } from '$lib/stores/store-grid-manager.js'
    import { toggle_edit_mode } from '$lib/js/source-grid-controller'

    // NEW
    import { modelGridAPI } from '$lib/stores/store-model-grid.js'
    import ModelOntologyGrid from "$lib/components/model-ontology-grid.svelte";
    import { modelOntologyAPI, ontologyAPI } from '$lib/stores/store-ontology-grids.js'
    import OntologyGrid from "$lib/components/ontology-grid.svelte";
    import { setGridQuickFilter } from "$lib/js/common-grid.js"
    import ShapesGrid from "$lib/components/shapes-grid.svelte";
    import { shapeAPI } from "$lib/stores/store-shape-grid"


    let srcViewFilterMode = 'all'
    let modelNodesToFilter;

    // vis control variables
    let src_hidden = false;
    let model_hidden = false;
    let model_ontology_hidden = true;
    let full_ontology_hidden = true;
    // mode variables
    let source_edit_mode = false;
    let ont_view_mode = "class";

    // filter variables
    let filter_classes = []; // classes to filter the model to
    // We don't need these variables as we could filter directly from the input element.
    // however keeping for now incase I want to set or clear via another function.
    let model_ontology_filter_input;
    let model_filter_input;
    let source_filter_input;
    let ontology_filter_input;

    // UI
    let lastSaved = null;
    let isSaving = false;


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

    // persistance
    async function saveToDB(){
        isSaving = true;
        try {
            await setData($modelGridAPI.api, "modelGrid");
            await setData($sourceGridAPI.api, "sourceGrid");
            lastSaved = new Date().toString()
        } catch(e){
            console.log("Failed to save!!", e)
        }
        isSaving = false;
    }


</script>

<div class="h-screen w-full flex flex-col">
    <div id="controller-bar-container" class="h-8 bg-neutral-200 border-b border-black flex flex-row p-1 gap-x-1 justify-between">
        <div class="flex flex-row gap-x-1">
            <div class="flex flex-row gap-x-2 mr-2">
                <p class="font-bold italic">bmg.fyi</p>
                <p>Model Builder</p>
            </div>
            <span>|</span>
            <!-- <button class="btn-subtle !py-0" on:click={()=>showModal=true}>Test Modal</button> -->
            <div class="border-slate-700 border rounded-xl px-2 flex flex-row text-slate-500">
                <p class="pr-2 font-semibold italic">
                    Drag Mode:
                </p>
                <p>{$dragMode || "none" }</p>
            </div>
        </div>
        <div class="flex flex-row gap-x-1">
            <div class="flex flex-row gap-x-1">
                <p class="px-1 italic">Save File:</p>
                <button class="btn-default !py-0" on:click={()=>jsonImportExport.export_all()}>Export</button>
                <button class="btn-default !py-0" on:click={() => launchModal(JsonUploadModal)}>Import</button>
            </div>
            <span>|</span>
            <button class="btn-success !py-0" on:click={() => saveToDB()}>
                {#if isSaving}
                ...spinner
                {:else}
                Save
                {/if}
            </button>
            <div class="w-96 overflow-x-hidden">
                <p class="font-semibold">Last saved: <span class="font-normal italic">{lastSaved || "not saved"}</span></p>
            </div>
        </div>
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
                    <button class="btn-default" on:click={()=>expandRows($modelGridAPI.api)}>+</button>
                    <button class="btn-default" on:click={()=>collapseRows($modelGridAPI.api)}>-</button>
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
            <SourceGrid bind:gridOptions={$sourceGridAPI} filterMode={srcViewFilterMode} {modelNodesToFilter}/>
        </div>
        <div id="full-ontology-panel" class="w-1/4 max-w-md h-full flex flex-col" class:hidden={full_ontology_hidden}>
            <div id="full-ontology-button-bar" class="h-12 w-full flex flex-row align-middle p-2 justify-between gap-x-1">
                <div>
                    <button class="btn-subtle" on:click={()=>full_ontology_hidden=!full_ontology_hidden}>[]</button>
                    <button class="btn-default" on:click={()=>expandRows($ontologyAPI.api)}>+</button>
                    <button class="btn-default" on:click={()=>collapseRows($ontologyAPI.api)}>-</button>
                </div>
                <div class="border rounded border-blue-500 flex-grow flex flex-row">
                    <input class="w-full outline-none" type="search" id="ontology-filter-text-box" bind:value={ontology_filter_input} placeholder="Filter..." on:input={()=>setGridQuickFilter($ontologyAPI.api, ontology_filter_input, true)}>
                </div>
                <div>
                    <button class="btn-default" class:btn-selected={ont_view_mode=="class"} on:click={()=>ont_view_mode="class"}>C</button>
                    <button class="btn-default" class:btn-selected={ont_view_mode=="shape"} on:click={()=>ont_view_mode="shape"}>S</button>
                    <button class="btn-default" class:btn-selected={ont_view_mode=="all"} on:click={()=>ont_view_mode="all"}>C+S</button>
                </div>
            </div>
            <!-- {#if ont_view_mode == "shape"} -->
            <!-- USING HIDDEN CLASS instead as it allows for dropzones to remain set when component is hidden -->
            <!-- Might be less efficent, but saves me needing to write a grid/drag controller to manage vis and dragging in the short term -->
            <div class="flex flex-col h-full">
                <div class="h-full" class:hidden={ont_view_mode == "class"}>
                    <ShapesGrid bind:gridOptions={$shapeAPI} />
                </div>
                <!-- {:else} -->
                <div class="h-full" class:hidden={ont_view_mode == "shape"}>
                    <OntologyGrid bind:gridOptions={$ontologyAPI} />
                </div>
                <!-- {/if} -->
            </div>
        </div>
    </div>
</div>

<Modal bind:showModal {modalContent} {modalContentProps}>
    <p slot="header">This is a modal container</p>
</Modal>