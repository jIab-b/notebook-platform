let notebookState = {
    title: '',
    cells: []
};
let pyodideReady = false;

function onPyodideLoaded() {
    pyodideReady = true;
    const urlParams = new URLSearchParams(window.location.search);
    const notebookId = urlParams.get('id');

    if (notebookId) {
        fetchNotebook(notebookId);
    }
}

async function fetchNotebook(id) {
    const response = await fetch(`/notebooks/${id}`);
    const notebook = await response.json();
    notebookState = notebook;
    renderNotebook();
}

function renderNotebook() {
    document.getElementById('notebook-title').textContent = notebookState.title;
    const cellsContainer = document.getElementById('notebook-cells');
    cellsContainer.innerHTML = '';

    notebookState.cells.forEach((cell, index) => {
        const cellEl = document.createElement('div');
        cellEl.className = 'cell';
        
        const editorEl = document.createElement('div');
        cellEl.appendChild(editorEl);
        
        const editor = CodeMirror(editorEl, {
            value: cell.content,
            mode: 'python',
            lineNumbers: false
        });

        const runButton = document.createElement('button');
        runButton.textContent = 'Run';
        runButton.disabled = !pyodideReady;
        runButton.onclick = () => executeCell(index, editor);
        cellEl.appendChild(runButton);

        const outputEl = document.createElement('div');
        outputEl.className = 'cell-output';
        cellEl.appendChild(outputEl);

        cellsContainer.appendChild(cellEl);
    });
}

async function executeCell(index, editor) {
    const code = editor.getValue();
    const outputEl = document.querySelectorAll('.cell-output')[index];
    outputEl.textContent = 'Executing...';

    try {
        const capturedOutput = [];
        window.pyodide.setStdout({ batched: (s) => capturedOutput.push(s) });
        window.pyodide.setStderr({ batched: (s) => capturedOutput.push(s) });

        const result = await window.pyodide.runPythonAsync(code);

        let finalOutput = capturedOutput.join('\n');

        if (result !== undefined) {
            if (finalOutput) {
                finalOutput += '\n';
            }
            finalOutput += result.toString();
        }

        outputEl.textContent = finalOutput.trim() || ' ';
    } catch (err) {
        outputEl.textContent = err.toString();
    } finally {
        // Reset stdout and stderr to default behavior (console.log)
        window.pyodide.setStdout({});
        window.pyodide.setStderr({});
    }
}

document.getElementById('add-cell').addEventListener('click', () => {
    notebookState.cells.push({ type: 'code', content: '' });
    renderNotebook();
});

document.getElementById('save-notebook').addEventListener('click', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const notebookId = urlParams.get('id');

    // Update cell content from editors
    const editors = document.querySelectorAll('.CodeMirror');
    notebookState.cells.forEach((cell, index) => {
        cell.content = editors[index].CodeMirror.getValue();
    });

    const response = await fetch(`/notebooks/${notebookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notebookState)
    });

    if (response.ok) {
        alert('Notebook saved!');
    } else {
        alert('Failed to save notebook.');
    }
}); 