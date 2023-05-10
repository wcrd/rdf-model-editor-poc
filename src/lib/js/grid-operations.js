import { generateNewEntity, createNewPointAtNode, generateNewEntityWithParams } from "$lib/js/entity-operations"

// HELPER: Insert new row
function addNewEntityRow(api, overNode){
    const transactionResults = api.applyTransaction({
        add: [generateNewEntity(overNode)],
    })
    return transactionResults.add[0]
}

// replace above with this
function addNewEntityRowWithParams(api, overNode, params){
    const transactionResults = api.applyTransaction({
        add: [generateNewEntityWithParams(overNode, params)],
    })
    return transactionResults.add[0]
}

// HELPER: Insert new point row
function addNewPointRow(api, atNode){
    const transactionResults = api.applyTransaction({
        add: [createNewPointAtNode(overNode)]
    })
    return transactionResults.add[0]
}

function addRowsToGrid(api, rows){
    const transactionResults = api.applyTransaction({
        add: rows
    })
    return transactionResults.add[0]
}

function removeRowsFromGrid(api, rows){
    const transactionResults = api.applyTransaction({
        remove: rows
    })
    return transactionResults.remove[0]
}

export { addNewEntityRow, addRowsToGrid, removeRowsFromGrid, addNewEntityRowWithParams }