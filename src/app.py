"""Receipt management API."""

from datetime import date
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.responses import RedirectResponse


class ReceiptCreate(BaseModel):
    merchant: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0)
    date: date
    category: str = Field(..., min_length=1, max_length=50)
    notes: Optional[str] = Field(default="", max_length=500)


class Receipt(ReceiptCreate):
    id: int


app = FastAPI(title="Receipt Manager API", description="Manage personal receipts")
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=current_dir / "static"), name="static")

receipts: dict[int, Receipt] = {}
next_receipt_id = 1


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/receipts", response_model=list[Receipt])
def get_receipts(category: Optional[str] = None):
    items = list(receipts.values())
    if category:
        items = [receipt for receipt in items if receipt.category == category]
    return sorted(items, key=lambda receipt: receipt.date, reverse=True)


@app.get("/receipts/{receipt_id}", response_model=Receipt)
def get_receipt(receipt_id: int):
    if receipt_id not in receipts:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return receipts[receipt_id]


@app.post("/receipts", response_model=Receipt, status_code=201)
def create_receipt(receipt_data: ReceiptCreate):
    global next_receipt_id
    receipt = Receipt(id=next_receipt_id, **receipt_data.model_dump())
    receipts[next_receipt_id] = receipt
    next_receipt_id += 1
    return receipt


@app.delete("/receipts/{receipt_id}")
def delete_receipt(receipt_id: int):
    if receipt_id not in receipts:
        raise HTTPException(status_code=404, detail="Receipt not found")
    del receipts[receipt_id]
    return {"message": "Receipt deleted"}
