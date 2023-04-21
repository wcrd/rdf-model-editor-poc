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
