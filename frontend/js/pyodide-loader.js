async function main() {
    const pyodideLoading = document.getElementById('pyodide-loading');
    const addCellBtn = document.getElementById('add-cell');
    const saveNotebookBtn = document.getElementById('save-notebook');
    
    pyodideLoading.style.display = 'block';
    
    let pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
    });
    
    pyodideLoading.style.display = 'none';
    addCellBtn.disabled = false;
    saveNotebookBtn.disabled = false;
    
    window.pyodide = pyodide;
    
    if (typeof onPyodideLoaded === 'function') {
        onPyodideLoaded();
    }
}

main(); 