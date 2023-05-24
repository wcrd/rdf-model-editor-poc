import { writable, get } from "svelte/store";
import { refreshRows } from "../js/common-grid";

export const ontologyData = createOntologyDataStore();
export const modelOntologyData = createModelOntologyDataStore();

export const modelOntologyAPI = writable();
export const ontologyAPI = writable()

export const modelOntologyGroupState = {
    ...writable([]),
    updateGroupState: function(rowNode) {
        // console.debug(rowNode)
        if(rowNode.expanded){
            // add group to expanded groups list
            this.update(curr => {
                return [...curr, rowNode.id]
            })
        }
        else {
            // remove group from expanded groups list
            this.update(curr => {
                return curr.filter(n => n != rowNode.id)
            })
        }
        // console.debug("Current state after update: ", get(modelOntologyGroupState));
    },
    // store expansion state of each node; persist during data refresh.
    // TODO: persist in local storage; along with the all other data.
    apply: function(){
        get(this).forEach(expandedNodeId => {
            let modelOntNode = get(modelOntologyAPI).api.getRowNode(expandedNodeId);
            if(modelOntNode) modelOntNode.expanded = true
            // get(modelOntologyAPI).api.setRowNodeExpanded(modelOntNode, true)
            // console.debug(modelOntNode)
        })
        get(modelOntologyAPI).api.onGroupExpandedOrCollapsed();
    }
}; 

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