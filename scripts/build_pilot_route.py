# -*- coding: utf-8 -*-
from __future__ import annotations

import csv
import hashlib
import json
import math
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import pandas as pd


PILOT_DATE = "2026-02-05"
PILOT_TRANSPORT = "11443209"
PILOT_ROUTE_REAL = "DR0040"
START_MINUTE = 8 * 60
TRUCK_ZONES = 8
FUEL_EQUIVALENT_MIN_PER_KM = 0.30
WAIT_PENALTY_FACTOR = 0.50
LATE_PENALTY_FACTOR = 10.0
PRIORITY_DELAY_FACTOR = 0.08
LOAD_ACCESS_FACTOR = 1.60


def ascii_key(value: Any) -> str:
    text = "" if pd.isna(value) else str(value)
    text = text.replace("\xa0", " ")
    return "".join(
        char for char in unicodedata.normalize("NFKD", text) if not unicodedata.combining(char)
    ).upper()


def clean_text(value: Any) -> str:
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", str(value).replace("\xa0", " ")).strip()


def norm_text(value: Any) -> str:
    return clean_text(value).upper()


def col_like(
    dataframe: pd.DataFrame,
    *,
    includes: tuple[str, ...] = (),
    starts: str | None = None,
    ends: str | None = None,
    exact: str | None = None,
    nth: int = 0,
) -> str:
    matches: list[str] = []
    for column in dataframe.columns:
        key = ascii_key(column)
        if exact and key != ascii_key(exact):
            continue
        if starts and not key.startswith(ascii_key(starts)):
            continue
        if ends and not key.endswith(ascii_key(ends)):
            continue
        if includes and not all(ascii_key(part) in key for part in includes):
            continue
        matches.append(column)

    if len(matches) <= nth:
        raise KeyError(
            f"No column match for exact={exact}, starts={starts}, ends={ends}, includes={includes}"
        )
    return matches[nth]


def product_type(description: Any, unit: Any) -> str:
    text = f"{norm_text(description)} {norm_text(unit)}"
    if any(token in text for token in ("BARRIL", "KEG", "BAG IN BOX", "BIB")):
        return "barril"
    if any(token in text for token in ("LATA", "SLEEK")):
        return "lata"
    if any(token in text for token in ("RETORN", "ENVASE", "VACIA", "VACIO")):
        return "retornable"
    if any(token in text for token in ("CAJA", "CAJ", "BOTELLA", "PACK", "BOTELLIN")):
        return "caja"
    return "otros"


def number(value: Any, default: float = 0) -> float:
    if pd.isna(value):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def int_string(value: Any) -> str:
    if pd.isna(value):
        return ""
    try:
        return str(int(float(value)))
    except (TypeError, ValueError):
        return clean_text(value)


def postal_code(value: Any) -> str:
    if pd.isna(value):
        return ""
    try:
        return f"{int(float(value)):05d}"
    except (TypeError, ValueError):
        return clean_text(value)


def round_float(value: float, digits: int = 3) -> float:
    return round(float(value), digits)


def format_minutes(total_minutes: float | None) -> str:
    if total_minutes is None:
        return "Sin horario"
    total = int(round(total_minutes))
    hour = (total // 60) % 24
    minute = total % 60
    return f"{hour:02d}:{minute:02d}"


def parse_time_to_minutes(value: Any) -> int | None:
    text = clean_text(value)
    if not text:
        return None
    match = re.match(r"^(\d{1,2}):(\d{2})", text)
    if not match:
        return None
    return int(match.group(1)) * 60 + int(match.group(2))


def haversine_meters(a: dict[str, float], b: dict[str, float]) -> float:
    radius = 6_371_000
    lat1 = math.radians(a["lat"])
    lat2 = math.radians(b["lat"])
    delta_lat = math.radians(b["lat"] - a["lat"])
    delta_lng = math.radians(b["lng"] - a["lng"])
    step = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lng / 2) ** 2
    )
    return 2 * radius * math.asin(math.sqrt(step))


def url_json(url: str, timeout: int = 25) -> Any | None:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "HackemateRoutePilot/1.0 local hackathon demo"},
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:  # noqa: BLE001
        print(f"Network fallback for {url[:80]}... ({exc})")
        return None


def deterministic_jitter(key: str, scale: float = 0.0032) -> tuple[float, float]:
    digest = hashlib.sha256(key.encode("utf-8")).digest()
    raw_a = int.from_bytes(digest[:4], "big") / 0xFFFFFFFF
    raw_b = int.from_bytes(digest[4:8], "big") / 0xFFFFFFFF
    return (raw_a - 0.5) * scale, (raw_b - 0.5) * scale


def fallback_coordinate(client_name: str, address: str, city: str) -> dict[str, Any]:
    centers = {
        "PARETS DEL VALLES": (41.5736, 2.2332),
        "PARETS DEL VALLÈS": (41.5736, 2.2332),
        "MOLLET DEL VALLES": (41.5407, 2.2135),
        "MOLLET DEL VALLÈS": (41.5407, 2.2135),
    }
    center = centers.get(clean_text(city).upper(), (41.5507, 2.225))
    delta_lat, delta_lng = deterministic_jitter(f"{client_name}|{address}|{city}")
    return {
        "lat": round(center[0] + delta_lat, 6),
        "lng": round(center[1] + delta_lng, 6),
        "source": "centroide local",
    }


def geocode(
    cache: dict[str, Any],
    client_name: str,
    address: str,
    cp: str,
    city: str,
    *,
    pause: float = 1.0,
) -> dict[str, Any]:
    key = f"{address}|{cp}|{city}"
    if key in cache:
        return cache[key]

    queries = [
        f"{address}, {cp} {city}, Barcelona, España",
        f"{address}, {city}, Barcelona, España",
        f"{client_name}, {address}, {city}, España",
    ]
    for query in queries:
        params = urllib.parse.urlencode(
            {
                "q": query,
                "format": "jsonv2",
                "limit": 1,
                "countrycodes": "es",
            }
        )
        result = url_json(f"https://nominatim.openstreetmap.org/search?{params}", timeout=20)
        time.sleep(pause)
        if isinstance(result, list) and result:
            item = result[0]
            geocoded = {
                "lat": round(float(item["lat"]), 6),
                "lng": round(float(item["lon"]), 6),
                "source": "Nominatim",
            }
            cache[key] = geocoded
            return geocoded

    geocoded = fallback_coordinate(client_name, address, city)
    cache[key] = geocoded
    return geocoded


def build_zone_map(zones: pd.DataFrame) -> dict[str, str]:
    normalized = zones.copy()
    for column in normalized.columns:
        if normalized[column].dtype == object:
            normalized[column] = normalized[column].map(lambda value: norm_text(value) if pd.notna(value) else value)

    zone_map: dict[str, str] = {}
    for _, row in normalized.iterrows():
        route_real = row.get("RutReal")
        if pd.isna(route_real):
            continue
        for key_column in ("ZONAS", "ZonaTransp.1", "ZonaTransp"):
            if key_column not in normalized.columns:
                continue
            key = row.get(key_column)
            if isinstance(key, str) and key:
                zone_map[key] = clean_text(route_real)
    return zone_map


def build_material_lookup(zm040: pd.DataFrame) -> tuple[dict[tuple[str, str], Any], dict[str, Any]]:
    zm040 = zm040.copy()
    zm040["mat_norm"] = zm040["Material"].map(norm_text)
    zm040["uma_norm"] = zm040["UMA"].map(norm_text)
    zm040["vol_m3_raw"] = pd.to_numeric(zm040["Volumen"], errors="coerce").fillna(0) / 1000
    zm040["peso_kg_raw"] = pd.to_numeric(zm040["Peso bruto"], errors="coerce").fillna(0)
    zm040["contador_num"] = pd.to_numeric(zm040["Contador"], errors="coerce")

    by_material_unit = {
        (row.mat_norm, row.uma_norm): row for row in zm040.itertuples(index=False)
    }
    pallet_by_material: dict[str, Any] = {}
    for row in zm040[zm040["uma_norm"].eq("PAL")].itertuples(index=False):
        pallet_by_material.setdefault(row.mat_norm, row)
    return by_material_unit, pallet_by_material


def material_metrics(
    material: Any,
    unit: Any,
    quantity: Any,
    by_material_unit: dict[tuple[str, str], Any],
    pallet_by_material: dict[str, Any],
) -> dict[str, Any]:
    material_key = norm_text(material)
    unit_key = norm_text(unit)
    qty = number(quantity)
    direct = by_material_unit.get((material_key, unit_key))
    pallet = pallet_by_material.get(material_key)

    unit_weight = 0.0
    unit_volume = 0.0
    source = "sin ZM040"
    if direct is not None and (direct.peso_kg_raw > 0 or direct.vol_m3_raw > 0):
        unit_weight = float(direct.peso_kg_raw)
        unit_volume = float(direct.vol_m3_raw)
        source = "ZM040 directa"
    elif (
        pallet is not None
        and not math.isnan(number(pallet.contador_num, math.nan))
        and number(pallet.contador_num) > 0
    ):
        unit_weight = float(pallet.peso_kg_raw) / float(pallet.contador_num)
        unit_volume = float(pallet.vol_m3_raw) / float(pallet.contador_num)
        source = "PAL prorrateado"
    elif direct is not None:
        source = "ZM040 sin peso/volumen"

    if unit_key == "PAL":
        pallets = qty
    elif (
        pallet is not None
        and not math.isnan(number(pallet.contador_num, math.nan))
        and number(pallet.contador_num) > 0
    ):
        pallets = qty / float(pallet.contador_num)
    elif unit_volume > 0:
        pallets = (qty * unit_volume) / 1.2
    else:
        pallets = 0.0

    return {
        "weightKg": unit_weight * qty,
        "volumeM3": unit_volume * qty,
        "pallets": pallets,
        "source": source,
    }


def build_schedule_lookup(horarios: pd.DataFrame, pilot_date: str) -> dict[str, dict[str, Any]]:
    name_column = col_like(horarios, exact="Nombre 1")
    day_column = col_like(horarios, starts="Dia semana")
    start_column = col_like(horarios, starts="Horario inicia")
    end_column = col_like(horarios, starts="Horario termina")

    delivery_day = pd.to_datetime(pilot_date).dayofweek + 1
    day_rows = horarios[pd.to_numeric(horarios[day_column], errors="coerce").eq(delivery_day)].copy()
    day_rows["name_norm"] = day_rows[name_column].map(norm_text)
    day_rows["start_minute"] = day_rows[start_column].map(parse_time_to_minutes)
    day_rows["end_minute"] = day_rows[end_column].map(parse_time_to_minutes)

    lookup: dict[str, dict[str, Any]] = {}
    for name, group in day_rows.groupby("name_norm"):
        windows = []
        for _, row in group.iterrows():
            start = row["start_minute"]
            end = row["end_minute"]
            if start is None or end is None or pd.isna(start) or pd.isna(end):
                continue
            if start == 0 and end == 0:
                continue
            windows.append((int(start), int(end)))
        if not windows:
            continue
        start_minute = min(start for start, _ in windows)
        end_minute = max(end for _, end in windows)
        lookup[name] = {
            "label": f"{format_minutes(start_minute)}-{format_minutes(end_minute)}",
            "startMinute": start_minute,
            "endMinute": end_minute,
            "source": "Horarios Entrega",
        }
    return lookup


def match_schedule(client_name: str, schedule_lookup: dict[str, dict[str, Any]]) -> dict[str, Any]:
    name = norm_text(client_name)
    if name in schedule_lookup:
        return schedule_lookup[name]

    for schedule_name, window in schedule_lookup.items():
        if len(schedule_name) >= 6 and (schedule_name in name or name in schedule_name):
            return window

    return {
        "label": "Sin horario",
        "startMinute": None,
        "endMinute": None,
        "source": "No encontrado",
    }


def osrm_table(points: list[dict[str, Any]]) -> tuple[list[list[float]], list[list[float]], str]:
    coords = ";".join(f"{point['lng']},{point['lat']}" for point in points)
    url = (
        "https://router.project-osrm.org/table/v1/driving/"
        f"{coords}?annotations=distance,duration"
    )
    result = url_json(url, timeout=30)
    if isinstance(result, dict) and result.get("code") == "Ok":
        return result["distances"], result["durations"], "OSRM driving table"

    distances: list[list[float]] = []
    durations: list[list[float]] = []
    for origin in points:
        distance_row = []
        duration_row = []
        for destination in points:
            distance = haversine_meters(origin, destination) * 1.32
            distance_row.append(distance)
            duration_row.append(distance / 28_000 * 3600)
        distances.append(distance_row)
        durations.append(duration_row)
    return distances, durations, "Haversine x1.32 fallback"


def sequence_distance(sequence: list[int], distances: list[list[float]]) -> float:
    path = [0, *sequence, 0]
    return sum(distances[path[index]][path[index + 1]] for index in range(len(path) - 1))


def estimate_service_minutes(client: dict[str, Any]) -> float:
    return (
        5
        + client["lines"] * 0.20
        + client["pallets"] * 4.0
        + (client["weightKg"] / 1000) * 1.5
        + client["returnableUnits"] * 0.08
        + len(client["productTypes"]) * 0.80
    )


def infer_priority(client: dict[str, Any]) -> dict[str, Any]:
    score = 1.0
    reasons: list[str] = []
    window = client["window"]
    window_start = window["startMinute"]
    window_end = window["endMinute"]

    if window_start is not None and window_end is not None:
        score += 2.0
        reasons.append("horario")
        if window_end - window_start <= 360:
            score += 1.0
            reasons.append("ventana estrecha")

    if client["hasReturnables"]:
        score += 1.0
        reasons.append("retornables")
    if client["pallets"] >= 0.75:
        score += 1.0
        reasons.append("carga alta")
    if client["weightKg"] >= 500:
        score += 0.5
        reasons.append("peso alto")
    if client["lines"] >= 15:
        score += 0.5
        reasons.append("muchas líneas")

    if score >= 5:
        label = "Alta"
    elif score >= 3:
        label = "Media"
    else:
        label = "Normal"

    return {
        "score": round_float(score, 1),
        "label": label,
        "reasons": reasons or ["sin restricción explícita"],
    }


def load_difficulty(client: dict[str, Any]) -> float:
    return (
        1
        + client["pallets"] * 3.0
        + client["returnableUnits"] * 0.10
        + len(client["productTypes"]) * 0.45
        + client["lines"] * 0.04
    )


def nearest_neighbor(distances: list[list[float]]) -> list[int]:
    unvisited = set(range(1, len(distances)))
    current = 0
    route: list[int] = []
    while unvisited:
        next_stop = min(unvisited, key=lambda index: distances[current][index])
        route.append(next_stop)
        unvisited.remove(next_stop)
        current = next_stop
    return route


def greedy_operational_route(
    distances: list[list[float]],
    durations: list[list[float]],
    clients_by_point_index: dict[int, dict[str, Any]],
) -> list[int]:
    unvisited = set(clients_by_point_index.keys())
    current = 0
    current_minute = START_MINUTE
    route: list[int] = []

    while unvisited:
        best_candidate = min(
            unvisited,
            key=lambda candidate: incremental_operational_cost(
                current,
                candidate,
                len(route) + 1,
                len(clients_by_point_index),
                current_minute,
                distances,
                durations,
                clients_by_point_index[candidate],
            ),
        )
        client = clients_by_point_index[best_candidate]
        current_minute += durations[current][best_candidate] / 60
        window_start = client["window"]["startMinute"]
        if window_start is not None and current_minute < window_start:
            current_minute = window_start
        current_minute += client["serviceMinutes"]
        route.append(best_candidate)
        unvisited.remove(best_candidate)
        current = best_candidate

    return route


def incremental_operational_cost(
    origin: int,
    destination: int,
    stop_number: int,
    total_stops: int,
    current_minute: float,
    distances: list[list[float]],
    durations: list[list[float]],
    client: dict[str, Any],
) -> float:
    drive_minutes = durations[origin][destination] / 60
    arrival = current_minute + drive_minutes
    window_start = client["window"]["startMinute"]
    window_end = client["window"]["endMinute"]
    wait_minutes = 0.0
    late_minutes = 0.0
    if window_start is not None and arrival < window_start:
        wait_minutes = window_start - arrival
        arrival = window_start
    if window_end is not None and arrival > window_end:
        late_minutes = arrival - window_end

    priority_delay = max(0, arrival - START_MINUTE) * client["priorityScore"] * PRIORITY_DELAY_FACTOR
    load_position = (stop_number - 1) / max(1, total_stops - 1)
    load_penalty = client["loadDifficulty"] * load_position * LOAD_ACCESS_FACTOR
    fuel_penalty = distances[origin][destination] / 1000 * FUEL_EQUIVALENT_MIN_PER_KM

    return (
        drive_minutes
        + fuel_penalty
        + wait_minutes * WAIT_PENALTY_FACTOR
        + late_minutes * LATE_PENALTY_FACTOR
        + priority_delay
        + load_penalty
        + client["serviceMinutes"] * 0.15
    )


def sequence_operational_score(
    sequence: list[int],
    points: list[dict[str, Any]],
    clients_by_point_index: dict[int, dict[str, Any]],
    distances: list[list[float]],
    durations: list[list[float]],
) -> float:
    return evaluate_sequence(sequence, points, clients_by_point_index, distances, durations)[
        "operationalScore"
    ]


def improve_operational_route(
    route: list[int],
    points: list[dict[str, Any]],
    clients_by_point_index: dict[int, dict[str, Any]],
    distances: list[list[float]],
    durations: list[list[float]],
) -> list[int]:
    best = route[:]
    best_score = sequence_operational_score(best, points, clients_by_point_index, distances, durations)
    improved = True
    while improved:
        improved = False

        for i in range(1, len(best) - 1):
            for j in range(i + 1, len(best)):
                if j - i == 1:
                    continue
                candidate = best[:i] + best[i:j][::-1] + best[j:]
                candidate_score = sequence_operational_score(
                    candidate, points, clients_by_point_index, distances, durations
                )
                if candidate_score + 0.1 < best_score:
                    best = candidate
                    best_score = candidate_score
                    improved = True

        for i in range(len(best)):
            for j in range(i + 1, len(best)):
                candidate = best[:]
                candidate[i], candidate[j] = candidate[j], candidate[i]
                candidate_score = sequence_operational_score(
                    candidate, points, clients_by_point_index, distances, durations
                )
                if candidate_score + 0.1 < best_score:
                    best = candidate
                    best_score = candidate_score
                    improved = True

        for i in range(len(best)):
            moved = best[i]
            without = best[:i] + best[i + 1 :]
            for j in range(len(without) + 1):
                if j == i:
                    continue
                candidate = without[:j] + [moved] + without[j:]
                candidate_score = sequence_operational_score(
                    candidate, points, clients_by_point_index, distances, durations
                )
                if candidate_score + 0.1 < best_score:
                    best = candidate
                    best_score = candidate_score
                    improved = True

    return best


def optimize_operational_route(
    original_sequence: list[int],
    points: list[dict[str, Any]],
    clients_by_point_index: dict[int, dict[str, Any]],
    distances: list[list[float]],
    durations: list[list[float]],
) -> list[int]:
    nearest = nearest_neighbor(distances)
    greedy = greedy_operational_route(distances, durations, clients_by_point_index)
    priority_first = sorted(
        clients_by_point_index.keys(),
        key=lambda index: (
            -clients_by_point_index[index]["priorityScore"],
            clients_by_point_index[index]["window"]["startMinute"] or 24 * 60,
            distances[0][index],
        ),
    )

    candidates = [original_sequence, nearest, greedy, priority_first]
    improved = [
        improve_operational_route(candidate, points, clients_by_point_index, distances, durations)
        for candidate in candidates
    ]
    return min(
        improved,
        key=lambda sequence: sequence_operational_score(
            sequence, points, clients_by_point_index, distances, durations
        ),
    )


def osrm_route_geometry(points: list[dict[str, Any]], sequence: list[int]) -> tuple[list[dict[str, float]], str]:
    ordered = [points[0], *[points[index] for index in sequence], points[0]]
    coords = ";".join(f"{point['lng']},{point['lat']}" for point in ordered)
    url = (
        "https://router.project-osrm.org/route/v1/driving/"
        f"{coords}?overview=full&geometries=geojson"
    )
    result = url_json(url, timeout=30)
    if (
        isinstance(result, dict)
        and result.get("code") == "Ok"
        and result.get("routes")
        and result["routes"][0].get("geometry")
    ):
        coordinates = result["routes"][0]["geometry"]["coordinates"]
        return (
            [{"lat": round(lat, 6), "lng": round(lng, 6)} for lng, lat in coordinates],
            "OSRM route geometry",
        )

    return (
        [{"lat": round(point["lat"], 6), "lng": round(point["lng"], 6)} for point in ordered],
        "Straight-line fallback",
    )


def evaluate_sequence(
    sequence: list[int],
    points: list[dict[str, Any]],
    clients_by_point_index: dict[int, dict[str, Any]],
    distances: list[list[float]],
    durations: list[list[float]],
) -> dict[str, Any]:
    path = [0, *sequence, 0]
    total_distance = 0.0
    total_drive_seconds = 0.0
    total_wait_minutes = 0.0
    total_late_minutes = 0.0
    total_priority_penalty = 0.0
    total_load_penalty = 0.0
    total_fuel_penalty = 0.0
    current_minute = START_MINUTE
    stops = []

    for index in range(len(path) - 1):
        origin = path[index]
        destination = path[index + 1]
        total_distance += distances[origin][destination]
        drive_seconds = durations[origin][destination]
        total_drive_seconds += drive_seconds
        current_minute += drive_seconds / 60

        if destination == 0:
            continue

        client = clients_by_point_index[destination]
        window_start = client["window"]["startMinute"]
        window_end = client["window"]["endMinute"]
        status = "ok"
        wait_minutes = 0.0
        late_minutes = 0.0
        if window_start is not None and current_minute < window_start:
            wait_minutes = window_start - current_minute
            current_minute = window_start
            status = "espera"
        if window_end is not None and current_minute > window_end:
            late_minutes = current_minute - window_end
            status = "tarde"

        service_minutes = client["serviceMinutes"]
        stop_number = index + 1
        priority_penalty = (
            max(0, current_minute - START_MINUTE)
            * client["priorityScore"]
            * PRIORITY_DELAY_FACTOR
        )
        load_position = (stop_number - 1) / max(1, len(sequence) - 1)
        load_penalty = client["loadDifficulty"] * load_position * LOAD_ACCESS_FACTOR
        total_wait_minutes += wait_minutes
        total_late_minutes += late_minutes
        total_priority_penalty += priority_penalty
        total_load_penalty += load_penalty
        stops.append(
            {
                "clientId": client["clientId"],
                "arrival": format_minutes(current_minute),
                "serviceMinutes": round_float(service_minutes, 1),
                "waitMinutes": round_float(wait_minutes, 1),
                "lateMinutes": round_float(late_minutes, 1),
                "priorityPenalty": round_float(priority_penalty, 1),
                "loadPenalty": round_float(load_penalty, 1),
                "windowStatus": status,
            }
        )
        current_minute += service_minutes

    service_total = sum(client["serviceMinutes"] for client in clients_by_point_index.values())
    total_fuel_penalty = (total_distance / 1000) * FUEL_EQUIVALENT_MIN_PER_KM
    elapsed_minutes = current_minute - START_MINUTE
    operational_score = (
        total_drive_seconds / 60
        + service_total
        + total_wait_minutes * WAIT_PENALTY_FACTOR
        + total_late_minutes * LATE_PENALTY_FACTOR
        + total_priority_penalty
        + total_load_penalty
        + total_fuel_penalty
    )
    return {
        "distanceKm": round_float(total_distance / 1000, 1),
        "driveMinutes": round_float(total_drive_seconds / 60, 0),
        "serviceMinutes": round_float(service_total, 0),
        "waitMinutes": round_float(total_wait_minutes, 0),
        "lateMinutes": round_float(total_late_minutes, 0),
        "priorityPenalty": round_float(total_priority_penalty, 1),
        "loadPenalty": round_float(total_load_penalty, 1),
        "fuelPenalty": round_float(total_fuel_penalty, 1),
        "operationalScore": round_float(operational_score, 1),
        "totalMinutes": round_float(elapsed_minutes, 0),
        "finish": format_minutes(current_minute),
        "stops": stops,
    }


def build_payload() -> dict[str, Any]:
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
    driver_col = col_like(detail, exact="Repartidor")
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
    detail["transport_str"] = detail[transport_col].map(int_string)
    detail["client_id"] = detail[client_col].map(int_string)
    zone_map = build_zone_map(zones)
    detail["route_real"] = detail[zone_col].map(lambda value: zone_map.get(norm_text(value), ""))

    filtered = detail[
        detail["fecha_iso"].eq(PILOT_DATE)
        & detail["transport_str"].eq(PILOT_TRANSPORT)
        & detail["route_real"].eq(PILOT_ROUTE_REAL)
    ].copy()
    filtered = filtered.reset_index(drop=False).rename(columns={"index": "sourceRow"})
    if filtered.empty:
        raise RuntimeError("No rows found for the configured pilot route")

    by_material_unit, pallet_by_material = build_material_lookup(zm040)
    schedule_lookup = build_schedule_lookup(horarios, PILOT_DATE)

    master_rows: list[dict[str, Any]] = []
    for row_number, row in filtered.iterrows():
        metrics = material_metrics(
            row[material_col],
            row[unit_col],
            row[quantity_col],
            by_material_unit,
            pallet_by_material,
        )
        type_name = product_type(row[description_col], row[unit_col])
        master_rows.append(
            {
                "lineId": f"{int_string(row[delivery_col])}-{clean_text(row[material_col])}-{row_number + 1}",
                "date": PILOT_DATE,
                "transport": PILOT_TRANSPORT,
                "routeReal": PILOT_ROUTE_REAL,
                "route": clean_text(row[route_col]),
                "driver": int_string(row[driver_col]),
                "deliveryId": int_string(row[delivery_col]),
                "clientId": int_string(row[client_col]),
                "clientName": clean_text(row[client_name_col]),
                "address": clean_text(row[street_col]),
                "postalCode": postal_code(row[postal_col]),
                "city": clean_text(row[city_col]),
                "material": clean_text(row[material_col]),
                "product": clean_text(row[description_col]),
                "quantity": round_float(number(row[quantity_col]), 2),
                "unit": clean_text(row[unit_col]),
                "productType": type_name,
                "weightKg": round_float(metrics["weightKg"], 3),
                "volumeM3": round_float(metrics["volumeM3"], 5),
                "pallets": round_float(metrics["pallets"], 5),
                "returnable": type_name == "retornable",
                "metricSource": metrics["source"],
            }
        )

    cache_path = script_dir / "geocode_cache.json"
    if cache_path.exists():
        cache = json.loads(cache_path.read_text(encoding="utf-8"))
    else:
        cache = {}

    grouped: dict[str, dict[str, Any]] = {}
    for row in master_rows:
        client = grouped.setdefault(
            row["clientId"],
            {
                "clientId": row["clientId"],
                "name": row["clientName"],
                "address": row["address"],
                "postalCode": row["postalCode"],
                "city": row["city"],
                "currentSequence": len(grouped) + 1,
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
        client["deliveries"].add(row["deliveryId"])
        client["lines"] += 1
        client["weightKg"] += row["weightKg"]
        client["volumeM3"] += row["volumeM3"]
        client["pallets"] += row["pallets"]
        client["productTypes"].add(row["productType"])
        if row["returnable"]:
            client["returnableUnits"] += row["quantity"]
            client["hasReturnables"] = True

    clients = list(grouped.values())
    for client in clients:
        geocoded = geocode(
            cache,
            client["name"],
            client["address"],
            client["postalCode"],
            client["city"],
        )
        window = match_schedule(client["name"], schedule_lookup)
        client["window"] = window
        priority = infer_priority(client)
        service_minutes = estimate_service_minutes(client)
        difficulty = load_difficulty(client)
        client.update(
            {
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

    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    depot = {
        "id": "depot",
        "name": "DDI Mollet",
        "address": "Base DDI Mollet",
        "city": "Mollet del Vallès",
        "lat": 41.5407,
        "lng": 2.2135,
    }

    points = [depot, *clients]
    distances, durations, routing_source = osrm_table(points)
    original_sequence = [client["currentSequence"] for client in clients]
    clients_by_point_index = {index + 1: client for index, client in enumerate(clients)}
    optimized_sequence = optimize_operational_route(
        original_sequence, points, clients_by_point_index, distances, durations
    )
    original_eval = evaluate_sequence(original_sequence, points, clients_by_point_index, distances, durations)
    optimized_eval = evaluate_sequence(optimized_sequence, points, clients_by_point_index, distances, durations)
    optimized_geometry, optimized_geometry_source = osrm_route_geometry(points, optimized_sequence)
    original_geometry, original_geometry_source = osrm_route_geometry(points, original_sequence)

    optimized_stop_by_client = {
        clients_by_point_index[point_index]["clientId"]: stop_number
        for stop_number, point_index in enumerate(optimized_sequence, start=1)
    }
    arrival_by_client = {
        stop["clientId"]: stop for stop in optimized_eval["stops"]
    }
    for client in clients:
        client["optimizedSequence"] = optimized_stop_by_client[client["clientId"]]
        stop = arrival_by_client[client["clientId"]]
        client["arrival"] = stop["arrival"]
        client["windowStatus"] = stop["windowStatus"]
        client["waitMinutes"] = stop["waitMinutes"]
        client["lateMinutes"] = stop["lateMinutes"]
        client["routePriorityPenalty"] = stop["priorityPenalty"]
        client["routeLoadPenalty"] = stop["loadPenalty"]
        client["loadZone"] = min(
            TRUCK_ZONES,
            max(1, math.ceil(client["optimizedSequence"] * TRUCK_ZONES / len(clients))),
        )

    clients.sort(key=lambda client: client["optimizedSequence"])
    zone_rows = []
    for zone in range(1, TRUCK_ZONES + 1):
        zone_clients = [client for client in clients if client["loadZone"] == zone]
        zone_rows.append(
            {
                "zone": zone,
                "label": f"Z{zone}",
                "position": "Puerta / primeras descargas" if zone == 1 else ("Frontal / últimas descargas" if zone == TRUCK_ZONES else "Intermedia"),
                "clients": [client["name"] for client in zone_clients],
                "pallets": round_float(sum(client["pallets"] for client in zone_clients), 2),
                "weightKg": round_float(sum(client["weightKg"] for client in zone_clients), 1),
                "returnableStops": sum(1 for client in zone_clients if client["hasReturnables"]),
            }
        )

    clients_by_id = {client["clientId"]: client for client in clients}
    for row in master_rows:
        client = clients_by_id[row["clientId"]]
        row["priority"] = client["priorityLabel"]
        row["priorityScore"] = client["priorityScore"]
        row["serviceMinutesClient"] = client["serviceMinutes"]
        row["optimizedSequence"] = client["optimizedSequence"]
        row["loadZone"] = client["loadZone"]

    total_weight = sum(row["weightKg"] for row in master_rows)
    total_volume = sum(row["volumeM3"] for row in master_rows)
    total_pallets = sum(row["pallets"] for row in master_rows)
    returnable_lines = sum(1 for row in master_rows if row["returnable"])
    returnable_share = returnable_lines / len(master_rows)
    recommended_truck = "8 palets" if total_pallets > 5 or total_weight > 2500 or returnable_share > 0.15 else "6 palets"
    savings_km = original_eval["distanceKm"] - optimized_eval["distanceKm"]
    savings_percent = savings_km / original_eval["distanceKm"] * 100 if original_eval["distanceKm"] else 0
    savings_minutes = original_eval["totalMinutes"] - optimized_eval["totalMinutes"]
    score_improvement = original_eval["operationalScore"] - optimized_eval["operationalScore"]
    score_improvement_percent = (
        score_improvement / original_eval["operationalScore"] * 100
        if original_eval["operationalScore"]
        else 0
    )

    csv_dir = frontend_root / "public" / "data"
    csv_dir.mkdir(parents=True, exist_ok=True)
    csv_path = csv_dir / "master_route_DR0040_2026-02-05.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(master_rows[0].keys()))
        writer.writeheader()
        writer.writerows(master_rows)

    return {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pilot": {
            "date": PILOT_DATE,
            "transport": PILOT_TRANSPORT,
            "routeReal": PILOT_ROUTE_REAL,
            "route": clean_text(filtered.iloc[0][route_col]),
            "driver": int_string(filtered.iloc[0][driver_col]),
            "clients": len(clients),
            "lines": len(master_rows),
            "deliveries": len({row["deliveryId"] for row in master_rows}),
            "materials": len({row["material"] for row in master_rows}),
            "weightKg": round_float(total_weight, 1),
            "volumeM3": round_float(total_volume, 3),
            "pallets": round_float(total_pallets, 2),
            "returnableShare": round_float(returnable_share, 3),
            "recommendedTruck": recommended_truck,
            "routingSource": routing_source,
            "geometrySource": f"{optimized_geometry_source}; original {original_geometry_source}",
            "masterCsv": "/data/master_route_DR0040_2026-02-05.csv",
        },
        "depot": depot,
        "clients": clients,
        "masterRows": master_rows,
        "route": {
            "originalSequence": [
                clients_by_point_index[index]["clientId"] for index in original_sequence
            ],
            "optimizedSequence": [
                clients_by_point_index[index]["clientId"] for index in optimized_sequence
            ],
            "original": original_eval,
            "optimized": optimized_eval,
            "optimizedPolyline": optimized_geometry,
            "originalPolyline": original_geometry,
            "savingsKm": round_float(savings_km, 1),
            "savingsPercent": round_float(savings_percent, 1),
            "savingsMinutes": round_float(savings_minutes, 0),
            "scoreImprovement": round_float(score_improvement, 1),
            "scoreImprovementPercent": round_float(score_improvement_percent, 1),
        },
        "truckZones": zone_rows,
        "algorithm": [
            "Tabla maestra filtrada por fecha, transporte y ruta real.",
            "Peso/volumen desde ZM040 por material y unidad; si falta la unidad se prorratea desde PAL.",
            "Coordenadas por dirección; fallback local por municipio si no hay geocoding.",
            "Matriz de carretera OSRM; fallback Haversine x1.32.",
            "Función objetivo operativa: conducción + descarga + esperas + retrasos + prioridad + fricción de carga + coste de km.",
            "Descarga estimada por líneas, palets, peso, retornables y variedad de producto.",
            "Prioridad inferida por horario, retornables, carga alta, peso alto y muchas líneas porque no hay una columna de prioridad explícita.",
            "Búsqueda: rutas iniciales por cercanía, coste incremental y prioridad; mejora local con 2-opt, swaps y recolocaciones.",
            "Carga por zonas: primeras paradas cerca de la puerta y últimas paradas hacia el frontal.",
        ],
    }


def main() -> None:
    frontend_root = Path(__file__).resolve().parent.parent
    payload = build_payload()
    target = frontend_root / "src" / "data" / "pilotRoute.ts"
    target.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "export const pilotRoute = "
        + json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False)
        + " as const\n"
    )
    target.write_text(content, encoding="utf-8")
    print(
        f"Generated {target} with {payload['pilot']['clients']} clients, "
        f"{payload['pilot']['lines']} lines and "
        f"{payload['route']['scoreImprovement']} operational points improved."
    )


if __name__ == "__main__":
    main()
