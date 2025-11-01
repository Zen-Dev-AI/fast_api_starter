from sqlalchemy.orm import Session
from app.todo.schemas import TodoCreate, TodoUpdate
from app.todo import repository

def create_todo(db: Session, data: TodoCreate):
    return repository.create_todo(db, data)

def get_todo_or_404(db: Session, todo_id: int):
    todo = repository.get_todo(db, todo_id)
    if not todo:
        raise ValueError("Todo not found")
    return todo

def list_todos(db: Session):
    todos = repository.list_todos(db)
    return todos

def update_todo(db: Session, todo_id: int, data: TodoUpdate):
    return repository.update_todo(db, todo_id, data)

def delete_todo(db: Session, todo_id: int):
    todo = get_todo_or_404(db, todo_id)
    repository.delete_todo(db, todo)
    