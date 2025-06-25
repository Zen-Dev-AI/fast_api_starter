from sqlalchemy.orm import Session
from .models import Todo
from .schemas import TodoCreate, TodoUpdate

def create_todo(db: Session, data: TodoCreate) -> Todo:
    todo = Todo(**data.model_dump())
    db.add(todo)
    db.commit()
    return todo


def get_todo(db: Session, todo_id: int) -> Todo | None:
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    return todo

def list_todos(db: Session) -> list[Todo]:
    todo_list = db.query(Todo).all()
    return todo_list

def update_todo(db: Session, todo_id: int, data: TodoUpdate) -> Todo | None:
    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        return None

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(todo, key, value)

    db.commit()
    db.refresh(todo)
    return todo

def delete_todo(db: Session, todo: Todo):
    db.delete(todo)
    db.commit()
