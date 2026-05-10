# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import time
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

import pandas as pd

from build_pilot_route import (
    build_material_lookup,
    build_schedule_lookup,
    build_zone_map,
    clean_text,
    col_like,
    estimate_service_minutes,
    infer_priority,
    int_string,
    load_difficulty,
    material_dimensions,
    material_metrics,
    match_schedule,
    norm_text,
    number,
    postal_code,
    product_type,
    round_float,
)


TRUCK_TYPES = [
    {
        "id": "van-3p",
        "label": "Furgoneta 3 palets",
        "shortLabel": "3 palets",
        "palletCapacity": 3,
        "defaultAvailable": 1,
        "fixedCostMinutes": 22,
        "source": "INTERHACK Barcelona 2026.pptx",
    },
    {
        "id": "truck-6p",
        "label": "Camión 6 palets",
        "shortLabel": "6 palets",
        "palletCapacity": 6,
        "defaultAvailable": 11,
        "fixedCostMinutes": 35,
        "source": "INTERHACK Barcelona 2026.pptx",
    },
    {
        "id": "truck-8p",
        "label": "Camión 8 palets",
        "shortLabel": "8 palets",
        "palletCapacity": 8,
        "defaultAvailable": 4,
        "fixedCostMinutes": 42,
        "source": "INTERHACK Barcelona 2026.pptx",
    },
]

DEPOT = {
    "id": "depot",
    "name": "DDI Mollet",
    "address": "Base DDI Mollet",
    "city": "Mollet del Vallès",
    "lat": 41.5407,
    "lng": 2.2135,
}

PRODUCT_TYPE_LABELS = {
    "barril": "Barriles",
    "caja": "Cajas",
    "lata": "Latas",
    "otros": "Otros",
    "retornable": "Retornables",
}

CITY_CENTERS = {
    "BARCELONA": (41.3874, 2.1686),
    "BELLAVISTA": (41.616, 2.298),
    "BIGUES I RIELLS": (41.677, 2.223),
    "CALDES DE MONTBUI": (41.633, 2.162),
    "CALLDETENES": (41.925, 2.284),
    "CANOVELLES": (41.617, 2.283),
    "CORRO D'AVALL": (41.621, 2.298),
    "CORRO D´AVALL": (41.621, 2.298),
    "FOLGUEROLES": (41.938, 2.318),
    "FRANQUESES DEL VALLES (LES)": (41.619, 2.299),
    "GRANOLLERS": (41.608, 2.287),
    "GURB": (41.956, 2.235),
    "LA ROCA DEL VALLES": (41.590, 2.326),
    "LA ROCA DEL VALLÈS": (41.590, 2.326),
    "LES FRANQUESES DEL VALLES": (41.619, 2.299),
    "LES FRANQUESES DEL VALLÈS": (41.619, 2.299),
    "LES MASIES DE RODA": (41.989, 2.314),
    "LES MASIES DE VOLTREGA": (42.019, 2.237),
    "LES MASIES DE VOLTREGÀ": (42.019, 2.237),
    "LLIÇA D'AMUNT": (41.608, 2.239),
    "LLIÇA DE VALL": (41.592, 2.241),
    "LLIÇÀ D'AMUNT": (41.608, 2.239),
    "LLIÇÀ DE VALL": (41.592, 2.241),
    "MANLLEU": (42.002, 2.284),
    "MARTORELLES": (41.525, 2.243),
    "MOLLET DEL VALLES": (41.5407, 2.2135),
    "MOLLET DEL VALLÈS": (41.5407, 2.2135),
    "MONTESQUIU": (42.109, 2.210),
    "MONTCADA I REIXAC": (41.483, 2.188),
    "MONTMELO": (41.551, 2.249),
    "MONTMELÓ": (41.551, 2.249),
    "MONTORNES DEL VALLES": (41.543, 2.267),
    "MONTORNÈS DEL VALLÈS": (41.543, 2.267),
    "PARETS DEL VALLES": (41.5736, 2.2332),
    "PARETS DEL VALLÈS": (41.5736, 2.2332),
    "ROCA DEL VALLES (LA)": (41.590, 2.326),
    "RODA DE TER": (41.984, 2.309),
    "SABADELL": (41.546, 2.108),
    "SANT FOST DE CAMPSENTELLE": (41.518, 2.234),
    "SANT FOST DE CAMPSENTELLES": (41.518, 2.234),
    "SANT HIPOLIT DE VOLTREGA": (42.016, 2.236),
    "SANT HIPÒLIT DE VOLTREGÀ": (42.016, 2.236),
    "SANT JULIA DE VILATORTA": (41.922, 2.325),
    "SANT JULIÀ DE VILATORTA": (41.922, 2.325),
    "SANT PERE DE TORELLO": (42.076, 2.296),
    "SANT PERE DE TORELLÓ": (42.076, 2.296),
    "SANT QUIRZE DE BESORA": (42.100, 2.223),
    "SANTA EUGENIA DE BERGA": (41.900, 2.283),
    "SANTA EUGÈNIA DE BERGA": (41.900, 2.283),
    "SANTA EULALIA DE RIUPRIMER": (41.911, 2.189),
    "SANTA EULÀLIA DE RIUPRIMER": (41.911, 2.189),
    "SANTA EULALIA DE RONÇANA": (41.650, 2.230),
    "SANTA EULÀLIA DE RONÇANA": (41.650, 2.230),
    "SANTA MARIA DE BESORA": (42.127, 2.259),
    "TAVÈRNOLES": (41.953, 2.326),
    "TERRASSA": (41.563, 2.008),
    "TONA": (41.852, 2.228),
    "TORELLO": (42.049, 2.263),
    "TORELLÓ": (42.049, 2.263),
    "VIC": (41.930, 2.254),
}


def ascii_key(value: Any) -> str:
    text = "" if pd.isna(value) else str(value)
    text = text.replace("\xa0", " ")
    return "".join(
        char for char in unicodedata.normalize("NFKD", text) if not unicodedata.combining(char)
    ).upper()


def deterministic_jitter(key: str, scale: float = 0.006) -> tuple[float, float]:
    digest = unicodedata.normalize("NFKD", key).encode("utf-8")
    first = sum(digest[::2]) % 1000 / 1000
    second = sum(digest[1::2]) % 1000 / 1000
    return (first - 0.5) * scale, (second - 0.5) * scale


def fallback_coordinate(client_name: str, address: str, city: str) -> dict[str, Any]:
    center = CITY_CENTERS.get(ascii_key(city), (41.650, 2.250))
    delta_lat, delta_lng = deterministic_jitter(f"{client_name}|{address}|{city}")
    return {
        "lat": round(center[0] + delta_lat, 6),
        "lng": round(center[1] + delta_lng, 6),
        "source": "centroide local",
    }


def cached_coordinate(
    cache: dict[str, Any],
    client_name: str,
    address: str,
    postal: str,
    city: str,
) -> dict[str, Any]:
    key = f"{address}|{postal}|{city}"
    cached = cache.get(key)
    if cached:
        return cached
    return fallback_coordinate(client_name, address, city)


def compact_metric_sources(sources: Counter[str]) -> str:
    if not sources:
        return "sin métrica"
    return ", ".join(f"{source}: {count}" for source, count in sources.most_common(2))


def build_dataset() -> dict[str, Any]:
    script_dir = Path(__file__).resolve().parent
    frontend_root = script_dir.parent
    project_root = frontend_root.parent.parent
    data_dir = project_root / "DATA"

    detail = pd.read_excel(data_dir / "Hackaton.xlsx", sheet_name="Detalle entrega")
    zones = pd.read_excel(data_dir / "Hackaton.xlsx", sheet_name="ZONAS")
    zm040 = pd.read_excel(data_dir / "ZM040.XLSX")
    horarios = pd.read_excel(data_dir / "Horarios Entrega.XLSX")

    fecha_col = col_like(detail, exact="FECHA")
    transport_col = col_like(detail, exact="Transporte")
    route_col = col_like(detail, exact="Ruta")
    delivery_col = col_like(detail, exact="Entrega")
    material_col = col_like(detail, exact="Material")
    description_col = col_like(detail, exact="Denominacion")
    quantity_col = col_like(detail, includes=("Cantidad", "entrega"))
    unit_col = col_like(detail, includes=("Un.medida", "venta"))
    client_col = col_like(detail, starts="Destinatario", ends=".1")
    client_name_col = col_like(detail, exact="Nombre 1")
    street_col = col_like(detail, exact="Calle")
    postal_col = col_like(detail, exact="CP")
    city_col = col_like(detail, starts="Poblacion")
    zone_col = col_like(detail, exact="ZonaTransp")

    detail = detail.copy()
    detail["fecha_iso"] = pd.to_datetime(detail[fecha_col], dayfirst=True, errors="coerce").dt.strftime("%Y-%m-%d")
    detail["client_id"] = detail[client_col].map(int_string)
    detail["transport_str"] = detail[transport_col].map(int_string)
    zone_map = build_zone_map(zones)
    detail["route_real"] = detail[zone_col].map(lambda value: zone_map.get(norm_text(value), ""))
    detail = detail[detail["fecha_iso"].notna() & detail["client_id"].ne("")].copy()
    detail = detail.reset_index(drop=False).rename(columns={"index": "sourceRow"})

    by_material_unit, pallet_by_material = build_material_lookup(zm040)
    cache_path = script_dir / "geocode_cache.json"
    cache = json.loads(cache_path.read_text(encoding="utf-8")) if cache_path.exists() else {}

    schedule_by_date = {
        date: build_schedule_lookup(horarios, date)
        for date in sorted(detail["fecha_iso"].dropna().unique())
    }

    clients_by_date: dict[str, dict[str, dict[str, Any]]] = defaultdict(dict)
    rows_by_date_client_type: dict[tuple[str, str, str], dict[str, Any]] = {}
    product_names_by_group: dict[tuple[str, str, str], Counter[str]] = defaultdict(Counter)
    material_counts_by_group: dict[tuple[str, str, str], Counter[str]] = defaultdict(Counter)
    material_quantities_by_group: dict[tuple[str, str, str], Counter[str]] = defaultdict(Counter)
    metric_sources_by_group: dict[tuple[str, str, str], Counter[str]] = defaultdict(Counter)
    date_product_totals: dict[str, Counter[str]] = defaultdict(Counter)
    date_materials: dict[str, set[str]] = defaultdict(set)
    date_deliveries: dict[str, set[str]] = defaultdict(set)
    date_returnable_lines: Counter[str] = Counter()

    for row_number, row in detail.iterrows():
        date = clean_text(row["fecha_iso"])
        client_id = int_string(row[client_col])
        client_name = clean_text(row[client_name_col])
        address = clean_text(row[street_col])
        postal = postal_code(row[postal_col])
        city = clean_text(row[city_col])
        delivery_id = int_string(row[delivery_col])
        material = clean_text(row[material_col])
        product = clean_text(row[description_col])
        unit = clean_text(row[unit_col])
        quantity = round_float(number(row[quantity_col]), 2)
        metrics = material_metrics(
            row[material_col],
            row[unit_col],
            row[quantity_col],
            by_material_unit,
            pallet_by_material,
        )
        dimensions = material_dimensions(
            row[material_col],
            row[unit_col],
            by_material_unit,
            pallet_by_material,
        )
        type_name = product_type(row[description_col], row[unit_col])
        is_returnable = type_name == "retornable"

        client = clients_by_date[date].setdefault(
            client_id,
            {
                "clientId": client_id,
                "name": client_name,
                "address": address,
                "postalCode": postal,
                "city": city,
                "currentSequence": len(clients_by_date[date]) + 1,
                "firstSourceRow": int(row["sourceRow"]),
                "deliveries": set(),
                "lines": 0,
                "weightKg": 0.0,
                "volumeM3": 0.0,
                "pallets": 0.0,
                "returnableUnits": 0.0,
                "hasReturnables": False,
                "productTypes": set(),
            },
        )
        client["deliveries"].add(delivery_id)
        client["lines"] += 1
        client["weightKg"] += metrics["weightKg"]
        client["volumeM3"] += metrics["volumeM3"]
        client["pallets"] += metrics["pallets"]
        client["productTypes"].add(type_name)
        if is_returnable:
            client["returnableUnits"] += quantity
            client["hasReturnables"] = True

        group_key = (date, client_id, type_name)
        grouped_row = rows_by_date_client_type.setdefault(
            group_key,
            {
                "lineId": f"{date}-{client_id}-{type_name}",
                "clientId": client_id,
                "clientName": client_name,
                "material": type_name,
                "product": PRODUCT_TYPE_LABELS.get(type_name, type_name),
                "quantity": 0.0,
                "unit": "uds",
                "productType": type_name,
                "weightKg": 0.0,
                "volumeM3": 0.0,
                "pallets": 0.0,
                "lengthCm": 0.0,
                "widthCm": 0.0,
                "heightCm": 0.0,
                "_dimensionWeight": 0.0,
                "returnable": is_returnable,
                "metricSource": "",
                "dimensionSource": "",
            },
        )
        grouped_row["quantity"] += quantity
        grouped_row["weightKg"] += metrics["weightKg"]
        grouped_row["volumeM3"] += metrics["volumeM3"]
        grouped_row["pallets"] += metrics["pallets"]
        if dimensions["dimensionSource"] == "ZM040 dimensiones directas":
            dimension_weight = max(quantity, 1.0)
            grouped_row["lengthCm"] += dimensions["lengthCm"] * dimension_weight
            grouped_row["widthCm"] += dimensions["widthCm"] * dimension_weight
            grouped_row["heightCm"] += dimensions["heightCm"] * dimension_weight
            grouped_row["_dimensionWeight"] += dimension_weight
        product_names_by_group[group_key][product] += quantity
        material_counts_by_group[group_key][material] += 1
        material_quantities_by_group[group_key][material] += quantity
        metric_sources_by_group[group_key][metrics["source"]] += 1
        metric_sources_by_group[(group_key, "dimensions")][dimensions["dimensionSource"]] += 1
        date_product_totals[date][product] += quantity
        date_materials[date].add(material)
        date_deliveries[date].add(delivery_id)
        if is_returnable:
            date_returnable_lines[date] += 1

    for group_key, grouped_row in rows_by_date_client_type.items():
        top_products = [product for product, _ in product_names_by_group[group_key].most_common(3)]
        top_materials = [material for material, _ in material_counts_by_group[group_key].most_common(4)]
        grouped_row["product"] = " + ".join(top_products) if top_products else grouped_row["product"]
        grouped_row["material"] = ", ".join(top_materials) if top_materials else grouped_row["material"]
        grouped_row["materialBreakdown"] = [
            {
                "material": material,
                "quantity": round_float(quantity, 2),
            }
            for material, quantity in material_quantities_by_group[group_key].most_common()
        ]
        grouped_row["quantity"] = round_float(grouped_row["quantity"], 2)
        grouped_row["weightKg"] = round_float(grouped_row["weightKg"], 3)
        grouped_row["volumeM3"] = round_float(grouped_row["volumeM3"], 5)
        grouped_row["pallets"] = round_float(grouped_row["pallets"], 5)
        dimension_weight = grouped_row.pop("_dimensionWeight", 0.0)
        if dimension_weight > 0:
            grouped_row["lengthCm"] = round_float(grouped_row["lengthCm"] / dimension_weight, 2)
            grouped_row["widthCm"] = round_float(grouped_row["widthCm"] / dimension_weight, 2)
            grouped_row["heightCm"] = round_float(grouped_row["heightCm"] / dimension_weight, 2)
        else:
            grouped_row["lengthCm"] = 0.0
            grouped_row["widthCm"] = 0.0
            grouped_row["heightCm"] = 0.0
        grouped_row["metricSource"] = compact_metric_sources(metric_sources_by_group[group_key])
        grouped_row["dimensionSource"] = compact_metric_sources(metric_sources_by_group[(group_key, "dimensions")])

    days: dict[str, Any] = {}
    date_summaries = []
    for date in sorted(clients_by_date):
        schedule_lookup = schedule_by_date[date]
        clients = sorted(clients_by_date[date].values(), key=lambda item: item["firstSourceRow"])
        for index, client in enumerate(clients, start=1):
            geocoded = cached_coordinate(
                cache,
                client["name"],
                client["address"],
                client["postalCode"],
                client["city"],
            )
            window = match_schedule(client["name"], schedule_lookup)
            priority = infer_priority({**client, "window": window})
            service_minutes = estimate_service_minutes(client)
            difficulty = load_difficulty(client)
            client.update(
                {
                    "currentSequence": index,
                    "deliveries": sorted(client["deliveries"]),
                    "weightKg": round_float(client["weightKg"], 1),
                    "volumeM3": round_float(client["volumeM3"], 3),
                    "pallets": round_float(client["pallets"], 2),
                    "returnableUnits": round_float(client["returnableUnits"], 1),
                    "productTypes": sorted(client["productTypes"]),
                    "lat": geocoded["lat"],
                    "lng": geocoded["lng"],
                    "geocodeSource": geocoded["source"],
                    "window": window,
                    "serviceMinutes": round_float(service_minutes, 1),
                    "priorityScore": priority["score"],
                    "priorityLabel": priority["label"],
                    "priorityReasons": priority["reasons"],
                    "loadDifficulty": round_float(difficulty, 1),
                }
            )
            del client["firstSourceRow"]

        master_rows = [
            row
            for (row_date, _, _), row in rows_by_date_client_type.items()
            if row_date == date
        ]
        master_rows.sort(key=lambda item: (item["clientId"], item["productType"]))
        total_weight = sum(client["weightKg"] for client in clients)
        total_volume = sum(client["volumeM3"] for client in clients)
        total_pallets = sum(client["pallets"] for client in clients)
        line_count = sum(client["lines"] for client in clients)
        returnable_share = date_returnable_lines[date] / line_count if line_count else 0
        summary = {
            "date": date,
            "clients": len(clients),
            "lines": line_count,
            "deliveries": len(date_deliveries[date]),
            "materials": len(date_materials[date]),
            "weightKg": round_float(total_weight, 1),
            "volumeM3": round_float(total_volume, 3),
            "pallets": round_float(total_pallets, 2),
            "returnableShare": round_float(returnable_share, 3),
        }
        days[date] = {
            "date": date,
            "summary": summary,
            "clients": clients,
            "masterRows": master_rows,
        }
        date_summaries.append(summary)

    return {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source": "Hackaton.xlsx, ZM040.XLSX, Horarios Entrega.XLSX e INTERHACK Barcelona 2026.pptx",
        "depot": DEPOT,
        "truckTypes": TRUCK_TYPES,
        "dates": date_summaries,
        "days": days,
    }


def main() -> None:
    frontend_root = Path(__file__).resolve().parent.parent
    payload = build_dataset()
    json_target = frontend_root / "src" / "data" / "planningData.generated.json"
    json_target.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

    target = frontend_root / "src" / "data" / "planningData.ts"
    target.write_text(
        "import type { PlanningDataset } from '@/types/planning'\n\n"
        "import planningData from './planningData.generated.json'\n\n"
        "export const planningDataset = planningData as PlanningDataset\n",
        encoding="utf-8",
    )
    print(
        f"Generated {json_target} with {len(payload['dates'])} dates and "
        f"{sum(day['summary']['clients'] for day in payload['days'].values())} day-clients."
    )


if __name__ == "__main__":
    main()
