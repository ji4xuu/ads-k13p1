from uuid import UUID
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import require_ipb_staff
from ..models.user_model import User
from ..schemas.user_schema import UserResponse
from ..services.admin_service import AdminService

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    nama: str
    nim_nip: str
    role: str


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_ipb_staff),
):
    return AdminService(db).list_users()


@router.post("/users", response_model=UserResponse, status_code=201)
def create_user(
    body: CreateUserRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_ipb_staff),
):
    return AdminService(db).create_user(
        email=body.email,
        password=body.password,
        nama=body.nama,
        nim_nip=body.nim_nip,
        role=body.role,
    )


@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_ipb_staff),
):
    return AdminService(db).deactivate_user(user_id)
