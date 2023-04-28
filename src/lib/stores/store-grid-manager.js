import { writable, get } from "svelte/store";

// Grid Data references
export const modelData = writable([]);
export const sourceData = writable([]);

console.debug({get, modelData, sourceData})