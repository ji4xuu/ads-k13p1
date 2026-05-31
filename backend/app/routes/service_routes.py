from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..dependencies import get_current_user
from ..services.service_service import ServiceService
from ..schemas.service_schema import ServiceTypeResponse

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.get("", response_model=list[ServiceTypeResponse])
def list_services(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return ServiceService(db).list_services()
