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
const modelData = writable([]); // this is the original data, new rows are not added by the grid. It does it all in memory.
const modelGridColumnDefs = writable();
// read-only derived store that has list of all classes in the model grid. For use in Ontology Panel.
// THIS DOES NOT WORK. Ag-grid is bind'd to store array, it does not use update/set methods therfore svelte cannot know when it is updated!
// Ag grid doesn't keep rowData updated aswell; rows need to be access through the forEachNode loop; doesn't appear to be a 'data' object anywhere...
// need to do a workaround with manual refresh.
// const modelClassSet = derived(modelData, $modelData => {
    // console.debug("Updating model class set ", $modelData)
    // return new Set($modelData.map(row => row.class))
// 
// })
const modelClassSet = {
    ...writable(new Set()),
    refresh(){
        this.update(curr => {
            const classes = [];
            get(modelGridAPI).api.forEachNode(node => classes.push(node.data.class))
            return new Set( classes )
        })
    }
}

// ui control variables
const potentialParent = writable();
const potentialInsertNode = writable();


export { modelGridAPI, modelData, modelGridColumnDefs, modelClassSet, potentialParent, potentialInsertNode }

console.debug("Store:Model", {get, modelData, modelGridAPI, modelClassSet})