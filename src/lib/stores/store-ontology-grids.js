import { writable, get } from "svelte/store";

export const ontologyData = createOntologyDataStore();
export const modelOntologyData = createModelOntologyDataStore();

export const modelOntologyAPI = writable();
export const ontologyAPI = writable()

// // load ontology data automatically
// export async function initLoad(){
//     console.log("Loading ontologies.")
//     const response = await fetch('/ontology.json');
//     ontologyData.set(await response.json())
//     console.log("Loading ontologies complete.")
// }

let ontology_data_loading = false; // track if getData() has already been called to prevent double call

function createOntologyDataStore(){
    const store = writable([]);

    async function getData(){
        if(ontology_data_loading) { console.log("Ontology data already loading."); return } 
        console.log("Loading ontologies.")
        ontology_data_loading = true;
        const response = await fetch('/ontology.json');
        store.set(await response.json())
        ontology_data_loading = false;
        console.log("Loading ontologies complete.")
    }

    return {
        ...store,
        getData
    }
}

function createModelOntologyDataStore(){
    const store = writable()

    function refresh(modelClassSet){
        // extract all classes in ontology path for given class list
        const all_classes = new Set( get(ontologyData).filter(row => modelClassSet.has(row.uri)).map(row => row.path.full).flat() );
        // filter to just these classes
        store.set(
            get(ontologyData).filter(row => all_classes.has(row.uri))
        )
    }

    return {
        ...store,
        refresh
    }
}

console.debug("Store:ModelOntology", {get, ontologyData, modelOntologyAPI, modelOntologyData, ontologyAPI})