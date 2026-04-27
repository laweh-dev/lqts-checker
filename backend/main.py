import base64
import os

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingredient_checker import check_medicine

load_dotenv()

app = FastAPI(title="LQTS Medicine Checker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextRequest(BaseModel):
    medicine: str


class ImageRequest(BaseModel):
    image: str


@app.post("/check/text")
def check_text(request: TextRequest):
    try:
        result = check_medicine(request.medicine)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}


#running locally:
# uvicorn main:app --reload
# Then open http://localhost:8000/docs to test endpoints