import { get } from 'svelte/store'
import { modelGridAPI, sourceGridAPI } from '$lib/stores/store-grid-manager'

// factory
function entityCellData({entClass=null, subject=null, label=null}={}){
    return {
        "class": entClass,
        subject: subject,
        label: label
    }
}

function get_linked_class(params){
    return params.data['source-for'] ? get(modelGridAPI).api.getRowNode(params.data['source-for']).data.class : null
}

function get_linked_parent(params){
    if(params.data['source-for']){ 
        // get last two elements; if only one returned then no parent
        const modelRowData = get(modelGridAPI).api.getRowNode(params.data['source-for']).data;
        const path = modelRowData.subject_path.slice(-2); 
        // const entFields = get_fields_by_subject(path[0]);
        const ent = get_model_row_by_subject(path[0])
        // return path.length == 1 ? "(not set)" : `${entClass}::${path[0]}`
        return path.length == 1 ? entityCellData() : entityCellData({entClass: ent.data?.class, subject: path[0], label: ent.data?.label}) // new object format
    } else return null

}

function get_linked_root_parent(params){
    if(params.data['source-for']){
        const modelRowData = get(modelGridAPI).api.getRowNode(params.data['source-for']).data;
        const path = modelRowData.subject_path
        // const entFields = get_fields_by_subject(path[0]);
        const ent = get_model_row_by_subject(path[0])
        // return path.length == 1 ? "(not set)" : `${entClass}::${path[0]}`
        return path.length == 1 ? entityCellData() : entityCellData({entClass: ent.data?.class, subject: path[0], label: ent.data?.label}) // new object format
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

function get_fields_by_subject(subject, fields=['class', 'label'], id=true){
    if(id){
        const res = {};
        const modelNode = get(modelGridAPI).api.getRowNode(subject);

        for(const field of fields){
            res[field] = modelNode?.data?.[field] ? modelNode.data[field] : null             
        };

        return res
    } else {
        console.debug('This method has not been implement for when subject is not the row id.')
        return null
    }
}

function get_model_row_by_subject(subject){
    return get(modelGridAPI).api.getRowNode(subject);
}

export { get_linked_class, get_linked_parent, get_linked_root_parent }