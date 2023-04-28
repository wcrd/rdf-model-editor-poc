import { get } from 'svelte/store'
import { modelGridAPI, sourceGridAPI } from '$lib/stores/store-grid-manager'

function get_linked_class(params){
    return params.data['source-for'] ? get(modelGridAPI).api.getRowNode(params.data['source-for']).data.class : null
}

function get_linked_parent(params){
    if(params.data['source-for']){ 
        // get last two elements; if only one returned then no parent
        const modelRowData = get(modelGridAPI).api.getRowNode(params.data['source-for']).data;
        const path = modelRowData.subject_path.slice(-2); 
        const entClass = get_class_by_subject(path[0]);
        return path.length == 1 ? "(not set)" : `${entClass}::${path[0]}` 
    } else return null

}

function get_linked_root_parent(params){
    if(params.data['source-for']){
        const modelRowData = get(modelGridAPI).api.getRowNode(params.data['source-for']).data;
        const path = modelRowData.subject_path
        const entClass = get_class_by_subject(path[0]);
        return path.length == 1 ? "(not set)" : `${entClass}::${path[0]}` 
    } else return null;

}

function get_class_by_subject(subject, id=true){
    if(id){
        const modelNode = get(modelGridAPI).api.getRowNode(subject);
        return modelNode ? modelNode.data.class : null; 
    } else {
        console.debug('This method has not been implement for when subject is not the row id.')
        return null
    }
}

export { get_linked_class, get_linked_parent, get_linked_root_parent }