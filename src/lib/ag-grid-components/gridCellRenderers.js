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
        if(params.value.entClass){ 
          this.eGui.innerHTML += `
            <span class="rounded-xl bg-blue-100 p-1">
                ${params.value.entClass || ""}
            </span>
            `
        }
        if(params.value.subject){
          // inlcude label if subject is present, even if label is blank.
          this.eGui.innerHTML += `
            <span class="ml-2">
                ${params.value.subject || ""}
            </span>
            <span class="ml-1">
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