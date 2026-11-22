import os
import re
import shutil
from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File, status, Depends
from sqlalchemy import create_engine, text
import pandas as pd

from auth.dependencies import require_user
from datasources.schemas import (
    SQLConnectionRequest,
    DataSourceResponse,
    SQLType
)
from datasources.store import save_datasource, list_datasources, delete_datasource

router = APIRouter(prefix="/datasources", tags=["datasources"])

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_UPLOAD_EXTENSIONS = (".csv", ".xlsx", ".xls")


def _safe_upload_filename(raw_name):
    """
    Turn a client-supplied file name into a safe bare file name, or None if the
    file type is not allowed. Strips any directory part (both / and \\ separators),
    replaces unusual characters, and lower-cases the extension.
    """
    if not raw_name:
        return None
    name = raw_name.replace("\\", "/").split("/")[-1].strip()
    stem, ext = os.path.splitext(name)
    ext = ext.lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        return None
    stem = re.sub(r"[^A-Za-z0-9._ -]", "_", stem).strip(" .")
    if not stem:
        stem = "upload"
    return f"{stem[:120]}{ext}"

@router.get("/", response_model=List[dict])
def get_datasources(user: dict = Depends(require_user)):
    """
    List all saved data sources for the current user.
    """
    return list_datasources(str(user["id"]))

@router.post("/sql/connect", response_model=DataSourceResponse)
def connect_sql(payload: SQLConnectionRequest, user: dict = Depends(require_user)):
    """
    Connect to a SQL database (MySQL or PostgreSQL).
    """
    db_url = ""
    if payload.type == SQLType.MYSQL:
        db_url = f"mysql+pymysql://{payload.username}:{payload.password}@{payload.host}:{payload.port}/{payload.database}"
    elif payload.type == SQLType.POSTGRESQL:
        db_url = f"postgresql+psycopg2://{payload.username}:{payload.password}@{payload.host}:{payload.port}/{payload.database}"
    
    try:
        engine = create_engine(db_url)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            
        # Save connection details
        saved = save_datasource(str(user["id"]), payload.type.value, payload.dict())
        datasource_id = str(saved["_id"]) if saved else None
        
        return DataSourceResponse(
            message=f"Successfully connected to {payload.type.value} database",
            status="success",
            datasource_id=datasource_id,
            details={"database": payload.database, "host": payload.host}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect to database: {str(e)}"
        )

@router.post("/pandas/upload", response_model=DataSourceResponse)
async def upload_pandas(file: UploadFile = File(...), user: dict = Depends(require_user)):
    """
    Upload a CSV or Excel file for Pandas analysis.
    """
    filename = _safe_upload_filename(file.filename)
    if filename is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a CSV or Excel file."
        )

    # Each user gets their own folder under UPLOAD_DIR
    user_upload_dir = os.path.abspath(os.path.join(UPLOAD_DIR, str(user["id"])))
    os.makedirs(user_upload_dir, exist_ok=True)
    file_path = os.path.join(user_upload_dir, filename)

    # Defence in depth: the final path must stay inside the user's folder
    if os.path.commonpath([user_upload_dir, os.path.abspath(file_path)]) != user_upload_dir:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file name."
        )

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Verify if it can be read by pandas
        if filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        # Save datasource details
        details = {
            "filename": filename,
            "path": file_path,
            "rows": len(df),
            "columns": list(df.columns)
        }
        saved = save_datasource(str(user["id"]), "pandas", details)
        datasource_id = str(saved["_id"]) if saved else None
            
        return DataSourceResponse(
            message="Successfully uploaded and verified file",
            status="success",
            datasource_id=datasource_id,
            details=details
        )
    except Exception as e:
        # Clean up if failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process file: {str(e)}"
        )


@router.delete("/{datasource_id}")
def remove_datasource(datasource_id: str, user: dict = Depends(require_user)):
    """
    Delete a saved datasource connection.
    """
    deleted = delete_datasource(datasource_id, str(user["id"]))
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Datasource not found or access denied"
        )
    return {"message": "Datasource deleted", "status": "success"}
