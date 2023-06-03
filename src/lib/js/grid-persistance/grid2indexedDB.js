import { db } from "$lib/js/db";

// load data function
async function getData(tableName, keyName="main"){
    const data = db[tableName].get(keyName);
    return data
}

// write data function (replaces value for key)
async function setData(api, tableName, keyName="main"){
    // get grid data
    // TODO: Replace with tracked changes for each grid to save iterating the whole grid each time.
    const data = [];
    api.forEachNode(n => data.push({rowData: n.data}))

    // write to table
    const key = db[tableName].put(data, keyName)

    return key // promise; resolves to rowId if successful.
}

export {
    setData,
    getData
}

console.debug(setData)