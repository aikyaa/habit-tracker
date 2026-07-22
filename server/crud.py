"""A small factory that builds a full CRUD router for any model.

All five resources have the identical REST shape (list / create / update /
delete), so rather than copy-paste four near-identical routers we generate them.
This is the kind of DRY abstraction worth being able to explain in an interview:
it trades a little indirection for a lot less repetition.
"""

from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from db import get_db


def make_crud_router(model, create_schema, read_schema, prefix, tag):
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("", response_model=list[read_schema])
    def list_all(db: DBSession = Depends(get_db)):
        return db.query(model).all()

    @router.post("", response_model=read_schema, status_code=201)
    def create(payload: create_schema, db: DBSession = Depends(get_db)):
        obj = model(id=str(uuid4()), **payload.model_dump())
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @router.put("/{item_id}", response_model=read_schema)
    def update(item_id: str, payload: create_schema, db: DBSession = Depends(get_db)):
        obj = db.get(model, item_id)
        if obj is None:
            raise HTTPException(status_code=404, detail=f"{tag} not found")
        for key, value in payload.model_dump().items():
            setattr(obj, key, value)
        db.commit()
        db.refresh(obj)
        return obj

    @router.delete("/{item_id}", status_code=204)
    def delete(item_id: str, db: DBSession = Depends(get_db)):
        obj = db.get(model, item_id)
        if obj is None:
            raise HTTPException(status_code=404, detail=f"{tag} not found")
        db.delete(obj)
        db.commit()

    return router
