import Dexie from "dexie";

// create db
export const db = new Dexie('modelBuilderDB');

// define tables and schemas
db.version(1).stores({
    modelGrid: "++id",
    sourceGrid: "++id"
})

// instantiate db in browser
db.open()

console.debug("DB: ", db)