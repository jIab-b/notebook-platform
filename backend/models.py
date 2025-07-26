from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime

class Cell(BaseModel):
    type: str
    content: str

class NotebookBase(BaseModel):
    title: str
    cells: List[Cell]

class NotebookCreate(NotebookBase):
    pass

class NotebookUpdate(NotebookBase):
    pass

class Notebook(NotebookBase):
    id: int
    created_at: datetime.datetime

    class Config:
        orm_mode = True 