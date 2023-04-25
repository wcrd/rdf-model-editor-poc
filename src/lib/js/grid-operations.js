import { generateNewEntity, createNewPointAtNode } from "$lib/js/entity-operations"

// HELPER: Insert new row
function addNewEntityRow(api, overNode){
    const transactionResults = api.applyTransaction({
        add: [generateNewEntity(overNode)],
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

export { addNewEntityRow, addRowsToGrid }