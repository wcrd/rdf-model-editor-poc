function addGridDropZone(params, targetGridApi) {
    const dropZone = targetGridApi.getRowDropZoneParams();
  
    params.api.addRowDropZone(dropZone);
}

export { addGridDropZone }