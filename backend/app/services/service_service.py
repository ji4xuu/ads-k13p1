from sqlalchemy.orm import Session
from ..models.service_type_model import ServiceType
from ..repositories.service_repository import ServiceRepository


class ServiceService:
    def __init__(self, db: Session):
        self._repo = ServiceRepository(db)

    def list_services(self) -> list[ServiceType]:
        return self._repo.get_all()
