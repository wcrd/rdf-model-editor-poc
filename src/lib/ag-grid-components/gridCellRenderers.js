import { classValueFormatter } from "$lib/js/common-grid";

export class SrcCellRenderer {
    // init method gets the details of the cell to be renderer
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = params.value ? `
            <span class="rounded-xl bg-blue-100 p-1">
                ${params.value}
            </span>
        ` : ''
    }
  
    getGui() {
      return this.eGui;
    }
  
    refresh(params) {
      return false;
    }
}


// params => {return params.value ? `<div class="rounded-lg bg-blue-100 m-0 p-0">${params.value}</div>` : '' }

export class ParentCellRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
      // render container
      this.eGui = document.createElement('div');
      // default val
      this.eGui.innerHTML = '';
      // check for data
      // console.debug("render: ", params)
      // if data and object has some values, then lets render
      if(params.value && Object.values(params.value).some(val => val!=null)){
        if(params.value.class){
          const cls_str = classValueFormatter({value: params.value.class}) 
          this.eGui.innerHTML += `
            <span class="rounded-xl bg-blue-100 p-1">
                ${cls_str || ""}
            </span>
            `
        }
        if(params.value.subject){
          // inlcude label if subject is present, even if label is blank.
          this.eGui.innerHTML += `
            <span class="ml-2">
                ${params.value.subject || ""}
            </span>
            `
        }
        if(params.value.label){
          this.eGui.innerHTML +=
            `<span class="ml-1">
                (${params.value.label || ""})
            </span>
          `
        }
        // else
        // something went wrong
        // will just return default value set above
      }
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}


export class ShapesCellRenderer {
  // init method gets the details of the cell to be renderer
  init(params) {
    // render container
    this.eGui = document.createElement('div');
    // default val
    this.eGui.innerHTML = '';
    // check for data
    // console.debug("render: ", params)
    // if data and object has some values, then lets render, else return value
    if(params.value && params?.data){
      if(params.data.type=="template"){
        this.eGui.innerHTML =
          `
          <span class="rounded-xl bg-green-100 p-1 mr-2">
            🧩 Shape
          </span> 
          ${params.value}
          `
      }
      else if(["entity", "point"].includes(params.data.type)){
        const cls_str = classValueFormatter({value: params.data.uri})
        const rel_str = classValueFormatter({value: params.data.relationship})
        this.eGui.innerHTML = 
          `
            <span class="rounded-xl bg-blue-100 text-xs p-1 mr-2">
                ${rel_str}
            </span> 
            ${cls_str}
            `
      }
    } else {
      this.eGui.innerHTML = params.value
    }
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}