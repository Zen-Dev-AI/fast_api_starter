from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.globals.dependencies import get_db
from app.todo.schemas import TodoCreate, TodoUpdate, TodoOut
from . import services
import traceback

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("/", response_model=TodoOut)
def create(todo_in: TodoCreate, db: Session = Depends(get_db)):
    try:
        print("INPUT:", todo_in)
        todo = services.create_todo(db, todo_in)
        return todo
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[TodoOut])
def get_all(db: Session = Depends(get_db)):
    todos = services.list_todos(db)
    return todos


@router.get("/{todo_id}", response_model=TodoOut)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    try:
        todo = services.get_todo_or_404(db, todo_id)
        return todo
    except ValueError:
        raise HTTPException(status_code=404, detail="Todo not found")

@router.put("/{todo_id}", response_model=TodoOut)
def update(todo_id: int, data: TodoUpdate, db: Session = Depends(get_db)):
    todo = services.update_todo(db, todo_id, data)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo 

@router.delete("/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    try:
        services.delete_todo(db, todo_id)
        return {"success": True, "message": "Todo detailed"}
    except ValueError:
        raise HTTPException(status_code=404, detail="Todo not found")
