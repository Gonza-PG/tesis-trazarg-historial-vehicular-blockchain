from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.dependencies import get_current_concesionaria
from app.models import Concesionaria, Vehiculo, Servicio
from app.schemas.vehiculo import VehiculoPublic
from app.services.blockchain import get_blockchain
from app.services.hashing import sha256_bytes
from app.services.security import decrypt_pk
from app.services.storage import upload_evidencia

router = APIRouter(prefix="/vehiculos", tags=["vehiculos"])


@router.post("", response_model=VehiculoPublic, status_code=status.HTTP_201_CREATED)
async def alta_vehiculo(
    vin: str = Form(...),
    patente: str | None = Form(None),
    marca: str = Form(...),
    modelo: str = Form(...),
    anio: int = Form(...),
    color: str | None = Form(None),
    km_inicial: int = Form(0),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current: Concesionaria = Depends(get_current_concesionaria),
):
    if db.query(Vehiculo).filter(Vehiculo.vin == vin).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "VIN ya registrado")

    contenido = await archivo.read()
    hash_hex = sha256_bytes(contenido)
    key = f"vehiculos/{vin}/alta-{int(datetime.now(timezone.utc).timestamp())}-{archivo.filename}"
    url = upload_evidencia(contenido, key, archivo.content_type or "application/octet-stream")

    bc = get_blockchain()
    pk = decrypt_pk(current.wallet_pk_enc)
    res = bc.registrar_vehiculo(pk, vin, km_inicial, hash_hex)

    v = Vehiculo(
        vin=vin,
        patente=patente,
        marca=marca,
        modelo=modelo,
        anio=anio,
        color=color,
        concesionaria_alta_id=current.id,
        km_inicial=km_inicial,
        tx_hash_alta=res["tx_hash"],
    )
    db.add(v)
    db.flush()

    s = Servicio(
        vehiculo_id=v.id,
        concesionaria_id=current.id,
        tipo_servicio=0,
        kilometraje=km_inicial,
        descripcion="Alta 0km",
        archivo_url=url,
        archivo_nombre=archivo.filename,
        hash_evidencia=hash_hex,
        tx_hash=res["tx_hash"],
        block_number=res["block_number"],
        chain_timestamp=res["timestamp"],
    )
    db.add(s)
    db.commit()
    db.refresh(v)

    return VehiculoPublic(
        id=str(v.id),
        vin=v.vin,
        patente=v.patente,
        marca=v.marca,
        modelo=v.modelo,
        anio=v.anio,
        color=v.color,
        km_inicial=v.km_inicial,
        tx_hash_alta=v.tx_hash_alta,
        creado_en=v.creado_en,
    )


@router.get("/mios", response_model=list[VehiculoPublic])
def listar_mios(
    db: Session = Depends(get_db),
    current: Concesionaria = Depends(get_current_concesionaria),
):
    items = (
        db.query(Vehiculo)
        .filter(Vehiculo.concesionaria_alta_id == current.id)
        .order_by(Vehiculo.creado_en.desc())
        .all()
    )
    return [
        VehiculoPublic(
            id=str(v.id),
            vin=v.vin,
            patente=v.patente,
            marca=v.marca,
            modelo=v.modelo,
            anio=v.anio,
            color=v.color,
            km_inicial=v.km_inicial,
            tx_hash_alta=v.tx_hash_alta,
            creado_en=v.creado_en,
        )
        for v in items
    ]
