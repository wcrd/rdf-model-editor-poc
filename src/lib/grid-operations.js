import { generateNewEntity } from "$lib/entity-operations"

// HELPER: Insert new row
function addNewEntityRow(api, overNode){
    const transactionResults = api.applyTransaction({
        add: [generateNewEntity(overNode)],
    })
    return transactionResults.add[0]
}

export { addNewEntityRow }