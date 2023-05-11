import { writable, get, derived } from "svelte/store";

//
// Store to house references to Model Grid variables
// Contains custom business logic for the Model Grid
// TODO: Much of the logic is shared with the Source grid, just with different column req's. This could be consolidated.
//
import { generateEntity, generatePoint } from "$lib/js/entity-operations";


function createModelAPIStore(){
    const store = writable()

    // Custom functions

    /** 
     * Adds a new entity to the grid
     * 
     * @param atNode ag-grid node object at which the new entity is to be added. If null, entity is added to root level.
     * @param {Object} [params] parameters for new entity creation, optional.
     * @param {Object} [params.entity_props] {subject, label, cls} for the newly created entity
     * 
     * **/
    function addEntityRow(atNode, {entity_props={}}={}){
        const newEntity = generateEntity(atNode, entity_props)

        return _updateGrid({ add: [newEntity] }).add[0]
    }

    function addPointRow(atNode, {point_props={}, child=false}={}){
        const newPoint = generatePoint(atNode, {child, point_props});
        
        return _updateGrid({ add: [newPoint] }).add[0]
    }


    function _updateGrid({add=[], remove=[], update=[]}={}){
        const res = get(store).api.applyTransaction({
            add,
            update,
            remove
        })

        return res
    }

    return {
        ...store,
        addEntityRow,
        addPointRow,
        _updateGrid
    }
}

const modelGridAPI = createModelAPIStore();
const modelData = writable([]);
const modelGridColumnDefs = writable();
// read-only derived store that has list of all classes in the model grid. For use in Ontology Panel.
const modelClassSet = derived(modelData, $modelData => {
    return new Set($modelData.map(row => row.class))
})

export { modelGridAPI, modelData, modelGridColumnDefs, modelClassSet }

console.debug({get, modelClassSet})