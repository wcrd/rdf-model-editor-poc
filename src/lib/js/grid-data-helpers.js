import { get } from 'svelte/store'
import { modelGridAPI, sourceGridAPI } from '$lib/stores/store-grid-manager'

function get_linked_class(params){
    return params.data['source-for'] ? get(modelGridAPI).api.getRowNode(params.data['source-for']).data.class : null
}

function get_linked_parent(params){
    if(params.data['source-for']){ 
        // get last two elements; if only one returned then no parent
        const path = get(modelGridAPI).api.getRowNode(params.data['source-for']).data.subject_path.slice(-2); 
        return path.length == 1 ? "(not set)" : path[0] 
    } else return null

}

function get_linked_root_parent(params){
    if(params.data['source-for']){
        const path = get(modelGridAPI).api.getRowNode(params.data['source-for']).data.subject_path
        return path.length == 1 ? "(not set)" : path[0]
    } else return null;

}

export { get_linked_class, get_linked_parent, get_linked_root_parent }