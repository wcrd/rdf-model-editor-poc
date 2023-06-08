import { writable } from "svelte/store";

let shapes_loaded = false; // control var to make sure shapes are not reloaded when grid vis is toggled.

function createShapesDataStore(){
    const store = writable([]);

    async function getData(){
        if(!shapes_loaded){
            console.log("Loading shapes data.")
            // get all shapes from shapes dir
            const shapeFiles = import.meta.glob('$lib/data/templates/*.json');
            // console.log(shapeFiles)
            const shapeData = []
            for (const fp in shapeFiles){
                await shapeFiles[fp]()
                    .then(({default: shape}) => processTemplateFile(shape))
                    .then(res => shapeData.push(...res))
            }
            store.set(shapeData)

            // old single process
            // const response = await fetch('/templates/VAV-FP.json');
            // process
            // store.set(await processTemplateFile(response))
            // fin
            shapes_loaded = true;
        }
    }

    return {
        ...store,
        getData
    }
}

async function processTemplateFile(data){
    const output_data = []

    // set shape header
    output_data.push({
        "label": data.label, // name of the shape
        "template": data.template, // shape target category (label)
        "type": "template",
        "path": [data.template, data.label],
        "uri": data.entity.class // this is the root class for the entity defined by this shape
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
            relationship: condition.relationship,
            type: condition.type,
            uri: condition.entity.class,
            path: [data.template, data.label, ...condition.id_path.map(i => ids[i]), condition.entity.class],
            // this is useful for other features (quick way to track what shape a row belongs to)
            label: data.label
        })
    }

    return output_data
}


export const shapeData = createShapesDataStore();
// api ref
export const shapeAPI = writable();