import { writable, get } from "svelte/store";

// Grid API references
export const modelGridAPI = writable();
export const sourceGridAPI = writable();

// Grid Data references
export const modelData = writable([]);
export const sourceData = writable([]);

console.debug({get, modelData, sourceData})