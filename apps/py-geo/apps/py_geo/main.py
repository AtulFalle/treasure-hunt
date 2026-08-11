"""FastAPI entrypoint for py-geo map packs."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from apps.py_geo.map_packs import MAP_PACKS

app = FastAPI(title="py-geo", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/map-packs/{pack_id}")
def get_map_pack(pack_id: str):
    pack = MAP_PACKS.get(pack_id)
    if pack is None:
        raise HTTPException(status_code=404, detail=f"Map pack '{pack_id}' not found")
    return pack
