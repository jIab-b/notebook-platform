from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
from fastapi.staticfiles import StaticFiles

import models
import database

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/notebooks/", response_model=models.Notebook)
def create_notebook(notebook: models.NotebookCreate, db: Session = Depends(database.get_db)):
    db_notebook = database.NotebookDB(
        title=notebook.title, 
        cells=json.dumps([cell.dict() for cell in notebook.cells])
    )
    db.add(db_notebook)
    db.commit()
    db.refresh(db_notebook)
    return models.Notebook(
        id=db_notebook.id,
        title=db_notebook.title,
        cells=[models.Cell(**cell) for cell in json.loads(db_notebook.cells)],
        created_at=db_notebook.created_at
    )

@app.get("/notebooks/{notebook_id}", response_model=models.Notebook)
def read_notebook(notebook_id: int, db: Session = Depends(database.get_db)):
    db_notebook = db.query(database.NotebookDB).filter(database.NotebookDB.id == notebook_id).first()
    if db_notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")
    return models.Notebook(
        id=db_notebook.id,
        title=db_notebook.title,
        cells=[models.Cell(**cell) for cell in json.loads(db_notebook.cells)],
        created_at=db_notebook.created_at
    )

@app.get("/notebooks/", response_model=list[models.Notebook])
def read_notebooks(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    notebooks = db.query(database.NotebookDB).offset(skip).limit(limit).all()
    return [
        models.Notebook(
            id=db_notebook.id,
            title=db_notebook.title,
            cells=[models.Cell(**cell) for cell in json.loads(db_notebook.cells)],
            created_at=db_notebook.created_at
        ) for db_notebook in notebooks
    ]

@app.put("/notebooks/{notebook_id}", response_model=models.Notebook)
def update_notebook(notebook_id: int, notebook: models.NotebookUpdate, db: Session = Depends(database.get_db)):
    db_notebook = db.query(database.NotebookDB).filter(database.NotebookDB.id == notebook_id).first()
    if db_notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")
    
    db_notebook.title = notebook.title
    db_notebook.cells = json.dumps([cell.dict() for cell in notebook.cells])
    db.commit()
    db.refresh(db_notebook)
    return models.Notebook(
        id=db_notebook.id,
        title=db_notebook.title,
        cells=[models.Cell(**cell) for cell in json.loads(db_notebook.cells)],
        created_at=db_notebook.created_at
    )

@app.delete("/notebooks/{notebook_id}", response_model=models.Notebook)
def delete_notebook(notebook_id: int, db: Session = Depends(database.get_db)):
    db_notebook = db.query(database.NotebookDB).filter(database.NotebookDB.id == notebook_id).first()
    if db_notebook is None:
        raise HTTPException(status_code=404, detail="Notebook not found")
    db.delete(db_notebook)
    db.commit()
    return models.Notebook(
        id=db_notebook.id,
        title=db_notebook.title,
        cells=[models.Cell(**cell) for cell in json.loads(db_notebook.cells)],
        created_at=db_notebook.created_at
    )

app.mount("/", StaticFiles(directory="../frontend", html=True), name="static") 