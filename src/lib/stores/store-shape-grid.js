import { writable } from "svelte/store";

function createShapesDataStore(){
    const store = writable([]);

    async function getData(){
        console.log("Loading shapes data.")
    }

    return {
        ...store,
        getData
    }
}

export const shapeData = createShapesDataStore();