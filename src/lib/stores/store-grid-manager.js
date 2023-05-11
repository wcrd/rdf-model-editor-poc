import { writable, get } from "svelte/store";

// Grid API references
// export const modelGridAPI = writable();
export const sourceGridAPI = writable();

// Grid column defs; these can also be had via getColumnDefs but it may be nicer to keep them as reactive var.
// export const modelGridColumnDefs = writable();
export const sourceGridColumnDefs = writable();

// Grid Data references
// export const modelData = writable([]);
export const sourceData = writable([]);

// change tracking
export const sourceEditedNodes = writable()

console.debug({get, sourceData, sourceGridAPI, sourceEditedNodes})