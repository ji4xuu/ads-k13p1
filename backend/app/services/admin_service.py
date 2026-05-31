from uuid import UUID
from passlib.context import CryptContext
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.user_model import User
from ..repositories.user_repository import UserRepository

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_VALID_ROLES = {"mahasiswa", "staff_departemen", "staff_fakultas", "staff_ipb"}


class AdminService:
    def __init__(self, db: Session):
        self._repo = UserRepository(db)

    def list_users(self) -> list[User]:
        return self._repo.list_all()

    def create_user(self, email: str, password: str, nama: str, nim_nip: str, role: str) -> User:
        if role not in _VALID_ROLES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Role tidak valid. Pilih salah satu: {', '.join(_VALID_ROLES)}")
        if self._repo.get_by_email(email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar.")
        return self._repo.create(
            email=email,
            password_hash=_pwd_context.hash(password),
            nama=nama,
            nim_nip=nim_nip,
            role=role,
        )

    def deactivate_user(self, user_id: UUID) -> User:
        user = self._repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User tidak ditemukan.")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Akun sudah tidak aktif.")
        return self._repo.deactivate(user)
