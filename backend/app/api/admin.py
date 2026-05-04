from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Concesionaria
from app.schemas.auth import ConcesionariaCreate, ConcesionariaPublic
from app.services.blockchain import get_blockchain
from app.services.security import hash_password, encrypt_pk

router = APIRouter(prefix="/admin", tags=["admin"])


def _expected_admin_token() -> str:
    t = (settings.ADMIN_API_TOKEN or "").strip()
    return t if t else settings.JWT_SECRET[:32]


def _check_admin(x_admin_token: str = Header(...)):
    if x_admin_token != _expected_admin_token():
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Token de admin invalido")


@router.post("/concesionarias", response_model=ConcesionariaPublic, dependencies=[Depends(_check_admin)])
def crear_concesionaria(payload: ConcesionariaCreate, db: Session = Depends(get_db)):
    if db.query(Concesionaria).filter(Concesionaria.email == payload.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email ya registrado")

    bc = get_blockchain()
    address, pk = bc.crear_wallet()

    bc.autorizar_concesionaria(address, payload.nombre)

    try:
        bc.fondear_wallet(address, "0.5")
    except Exception:
        pass

    c = Concesionaria(
        nombre=payload.nombre,
        cuit=payload.cuit,
        email=payload.email,
        password_hash=hash_password(payload.password),
        wallet_address=address,
        wallet_pk_enc=encrypt_pk(pk),
        activa=True,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return ConcesionariaPublic(
        id=str(c.id),
        nombre=c.nombre,
        email=c.email,
        wallet_address=c.wallet_address,
        activa=c.activa,
    )


@router.get("/concesionarias", response_model=list[ConcesionariaPublic], dependencies=[Depends(_check_admin)])
def listar(db: Session = Depends(get_db)):
    items = db.query(Concesionaria).order_by(Concesionaria.creado_en.desc()).all()
    return [
        ConcesionariaPublic(
            id=str(c.id),
            nombre=c.nombre,
            email=c.email,
            wallet_address=c.wallet_address,
            activa=c.activa,
        )
        for c in items
    ]


@router.post("/concesionarias/{concesionaria_id}/fondear", dependencies=[Depends(_check_admin)])
def fondear(concesionaria_id: str, monto_matic: str = "0.5", db: Session = Depends(get_db)):
    c = db.query(Concesionaria).filter(Concesionaria.id == concesionaria_id).first()
    if not c:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No encontrada")
    bc = get_blockchain()
    res = bc.fondear_wallet(c.wallet_address, monto_matic)
    return {"ok": True, **res, "balance": bc.balance_matic(c.wallet_address)}
