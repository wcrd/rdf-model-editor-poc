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
      this.eGui.innerHTML = params.value;
      // check for data
      if(params.value){
        // get parts
        const parts = params.value?.split("::");
        if(parts.length == 2){
            this.eGui.innerHTML = `
                <span class="rounded-xl bg-blue-100 p-1">
                    ${parts[0]}
                </span>
                <span class="ml-2">
                    ${parts[1]}
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