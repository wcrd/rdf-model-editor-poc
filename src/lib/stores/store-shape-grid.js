import { writable } from "svelte/store";

let shapes_loaded = false; // control var to make sure shapes are not reloaded when grid vis is toggled.

function createShapesDataStore(){
    const store = writable([]);

    async function getData(){
        if(!shapes_loaded){
            console.log("Loading shapes data.")
            // convert to glob loop to fetch all
            const response = await fetch('/templates/VAV.json');
            // process
            store.set(await processTemplateFile(response))
            // fin
            shapes_loaded = true;
        }
    }

    return {
        ...store,
        getData
    }
}

async function processTemplateFile(response){
    const data = await response.json();
    const output_data = []

    // set shape header
    output_data.push({
        "label": data.label, // name of the shape
        "template": data.template, // shape target category (label)
        "type": "template",
        "path": [data.template, data.label]
    })

    // process shape
    // get refs
    const ids = data.shape.reduce((m, r) => {
        if(r._id!=""){
            m[r._id] = r.entity.class
        }
        return m
    }, {})
    // console.debug(ids)
    for (let condition of data.shape){
        output_data.push({
            type: condition.type,
            uri: condition.entity.class,
            path: [data.template, data.label, ...condition.id_path.map(i => ids[i]), condition.entity.class]
        })
    }

    return output_data
}


export const shapeData = createShapesDataStore();