document.addEventListener('DOMContentLoaded', () => {
    const notebookList = document.getElementById('notebook-list');
    const createNotebookBtn = document.getElementById('create-notebook');

    async function fetchNotebooks() {
        const response = await fetch('/notebooks/');
        const notebooks = await response.json();
        notebookList.innerHTML = '';
        notebooks.forEach(notebook => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `notebook.html?id=${notebook.id}`;
            a.textContent = notebook.title;
            li.appendChild(a);
            notebookList.appendChild(li);
        });
    }

    createNotebookBtn.addEventListener('click', async () => {
        const title = prompt('Enter notebook title:');
        if (title) {
            const response = await fetch('/notebooks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    cells: [{ type: 'code', content: '' }]
                })
            });
            if (response.ok) {
                fetchNotebooks();
            }
        }
    });

    fetchNotebooks();
}); 