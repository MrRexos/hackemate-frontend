export const pilotRoute = {
  "generatedAt": "2026-05-09T13:42:18Z",
  "pilot": {
    "date": "2026-02-05",
    "transport": "11443209",
    "routeReal": "DR0040",
    "route": "DR0023",
    "driver": "850013",
    "clients": 15,
    "lines": 157,
    "deliveries": 16,
    "materials": 80,
    "weightKg": 3541.4,
    "volumeM3": 2.308,
    "pallets": 5.44,
    "returnableShare": 0.185,
    "recommendedTruck": "8 palets",
    "routingSource": "OSRM driving table",
    "geometrySource": "OSRM route geometry; original OSRM route geometry",
    "masterCsv": "/data/master_route_DR0040_2026-02-05.csv"
  },
  "depot": {
    "id": "depot",
    "name": "DDI Mollet",
    "address": "Base DDI Mollet",
    "city": "Mollet del Vallès",
    "lat": 41.5407,
    "lng": 2.2135
  },
  "clients": [
    {
      "clientId": "9100692245",
      "name": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 3,
      "deliveries": [
        "827963196"
      ],
      "lines": 13,
      "weightKg": 742.9,
      "volumeM3": 0.555,
      "pallets": 0.88,
      "returnableUnits": 20.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "00:00-18:00",
        "startMinute": 0,
        "endMinute": 1080,
        "source": "Horarios Entrega"
      },
      "lat": 41.556835,
      "lng": 2.226768,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 16.2,
      "priorityScore": 5.5,
      "priorityLabel": "Alta",
      "priorityReasons": [
        "horario",
        "retornables",
        "carga alta",
        "peso alto"
      ],
      "loadDifficulty": 7.5,
      "optimizedSequence": 1,
      "arrival": "08:05",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 2.2,
      "routeLoadPenalty": 0.0,
      "loadZone": 1
    },
    {
      "clientId": "9100661113",
      "name": "BAR LA ESQUINITA",
      "address": "Avinguda de Catalunya 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 5,
      "deliveries": [
        "827963198"
      ],
      "lines": 4,
      "weightKg": 34.0,
      "volumeM3": 0.016,
      "pallets": 0.03,
      "returnableUnits": 2.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.556835,
      "lng": 2.226768,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 7.7,
      "priorityScore": 2.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables"
      ],
      "loadDifficulty": 2.4,
      "optimizedSequence": 2,
      "arrival": "08:21",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 3.4,
      "routeLoadPenalty": 0.3,
      "loadZone": 2
    },
    {
      "clientId": "9100041543",
      "name": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 14,
      "deliveries": [
        "827963209"
      ],
      "lines": 6,
      "weightKg": 138.6,
      "volumeM3": 0.106,
      "pallets": 0.28,
      "returnableUnits": 2.0,
      "hasReturnables": true,
      "productTypes": [
        "barril",
        "caja",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.561669,
      "lng": 2.228238,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 10.1,
      "priorityScore": 2.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables"
      ],
      "loadDifficulty": 3.6,
      "optimizedSequence": 3,
      "arrival": "08:30",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 4.8,
      "routeLoadPenalty": 0.8,
      "loadZone": 2
    },
    {
      "clientId": "9100041393",
      "name": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 15,
      "deliveries": [
        "827963210"
      ],
      "lines": 8,
      "weightKg": 67.6,
      "volumeM3": 0.035,
      "pallets": 0.08,
      "returnableUnits": 2.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.565323,
      "lng": 2.229146,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 8.8,
      "priorityScore": 2.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables"
      ],
      "loadDifficulty": 2.7,
      "optimizedSequence": 4,
      "arrival": "08:41",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 6.5,
      "routeLoadPenalty": 0.9,
      "loadZone": 3
    },
    {
      "clientId": "9100669500",
      "name": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 4,
      "deliveries": [
        "827963197"
      ],
      "lines": 7,
      "weightKg": 174.7,
      "volumeM3": 0.129,
      "pallets": 0.21,
      "returnableUnits": 6.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "00:00-18:00",
        "startMinute": 0,
        "endMinute": 1080,
        "source": "Horarios Entrega"
      },
      "lat": 41.565083,
      "lng": 2.22723,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 10.4,
      "priorityScore": 4.0,
      "priorityLabel": "Media",
      "priorityReasons": [
        "horario",
        "retornables"
      ],
      "loadDifficulty": 3.9,
      "optimizedSequence": 5,
      "arrival": "08:50",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 16.1,
      "routeLoadPenalty": 1.8,
      "loadZone": 3
    },
    {
      "clientId": "9100150711",
      "name": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 13,
      "deliveries": [
        "827963208"
      ],
      "lines": 19,
      "weightKg": 288.8,
      "volumeM3": 0.187,
      "pallets": 0.32,
      "returnableUnits": 12.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.565858,
      "lng": 2.225023,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 13.9,
      "priorityScore": 2.5,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables",
        "muchas líneas"
      ],
      "loadDifficulty": 5.3,
      "optimizedSequence": 6,
      "arrival": "09:01",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 12.3,
      "routeLoadPenalty": 3.0,
      "loadZone": 4
    },
    {
      "clientId": "9100700812",
      "name": "SUPER NABILA PARETS",
      "address": "Carrer de Conestable de Portugal 8",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 2,
      "deliveries": [
        "827963195"
      ],
      "lines": 4,
      "weightKg": 164.7,
      "volumeM3": 0.075,
      "pallets": 0.16,
      "returnableUnits": 10.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "retornable"
      ],
      "window": {
        "label": "00:00-18:00",
        "startMinute": 0,
        "endMinute": 1080,
        "source": "Horarios Entrega"
      },
      "lat": 41.573633,
      "lng": 2.234153,
      "geocodeSource": "centroide local",
      "serviceMinutes": 9.1,
      "priorityScore": 4.0,
      "priorityLabel": "Media",
      "priorityReasons": [
        "horario",
        "retornables"
      ],
      "loadDifficulty": 3.5,
      "optimizedSequence": 7,
      "arrival": "09:19",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 25.1,
      "routeLoadPenalty": 2.4,
      "loadZone": 4
    },
    {
      "clientId": "9100617475",
      "name": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 6,
      "deliveries": [
        "827963199"
      ],
      "lines": 39,
      "weightKg": 905.2,
      "volumeM3": 0.559,
      "pallets": 1.56,
      "returnableUnits": 15.0,
      "hasReturnables": true,
      "productTypes": [
        "barril",
        "caja",
        "lata",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.573595,
      "lng": 2.23318,
      "geocodeSource": "centroide local",
      "serviceMinutes": 25.6,
      "priorityScore": 4.0,
      "priorityLabel": "Media",
      "priorityReasons": [
        "retornables",
        "carga alta",
        "peso alto",
        "muchas líneas"
      ],
      "loadDifficulty": 11.0,
      "optimizedSequence": 8,
      "arrival": "09:28",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 28.1,
      "routeLoadPenalty": 8.8,
      "loadZone": 5
    },
    {
      "clientId": "9100227177",
      "name": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 11,
      "deliveries": [
        "827963206"
      ],
      "lines": 9,
      "weightKg": 242.2,
      "volumeM3": 0.107,
      "pallets": 0.25,
      "returnableUnits": 11.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.574124,
      "lng": 2.232232,
      "geocodeSource": "centroide local",
      "serviceMinutes": 11.4,
      "priorityScore": 2.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables"
      ],
      "loadDifficulty": 4.6,
      "optimizedSequence": 9,
      "arrival": "09:55",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 18.3,
      "routeLoadPenalty": 4.2,
      "loadZone": 5
    },
    {
      "clientId": "9100569006",
      "name": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 8,
      "deliveries": [
        "827963201"
      ],
      "lines": 9,
      "weightKg": 99.1,
      "volumeM3": 0.087,
      "pallets": 0.14,
      "returnableUnits": 0.0,
      "hasReturnables": false,
      "productTypes": [
        "caja"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.572299,
      "lng": 2.233987,
      "geocodeSource": "centroide local",
      "serviceMinutes": 8.3,
      "priorityScore": 1.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "sin restricción explícita"
      ],
      "loadDifficulty": 2.2,
      "optimizedSequence": 10,
      "arrival": "10:08",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 10.3,
      "routeLoadPenalty": 2.3,
      "loadZone": 6
    },
    {
      "clientId": "9100574514",
      "name": "COREFO (BAR)",
      "address": "AVENIDA CATALUNYA 24",
      "postalCode": "08150",
      "city": "PARETS DEL VALLÈS",
      "currentSequence": 7,
      "deliveries": [
        "827963200"
      ],
      "lines": 4,
      "weightKg": 68.0,
      "volumeM3": 0.032,
      "pallets": 0.07,
      "returnableUnits": 4.0,
      "hasReturnables": true,
      "productTypes": [
        "caja",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.572898,
      "lng": 2.233152,
      "geocodeSource": "centroide local",
      "serviceMinutes": 8.1,
      "priorityScore": 2.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables"
      ],
      "loadDifficulty": 2.7,
      "optimizedSequence": 11,
      "arrival": "10:18",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 22.0,
      "routeLoadPenalty": 3.1,
      "loadZone": 6
    },
    {
      "clientId": "9100158102",
      "name": "LA NORIA BAKERY",
      "address": "CALLE BUTJOSA 58",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 12,
      "deliveries": [
        "827963207"
      ],
      "lines": 5,
      "weightKg": 32.3,
      "volumeM3": 0.032,
      "pallets": 0.06,
      "returnableUnits": 0.0,
      "hasReturnables": false,
      "productTypes": [
        "caja",
        "otros"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.573057,
      "lng": 2.232971,
      "geocodeSource": "centroide local",
      "serviceMinutes": 7.9,
      "priorityScore": 1.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "sin restricción explícita"
      ],
      "loadDifficulty": 2.3,
      "optimizedSequence": 12,
      "arrival": "10:26",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 11.7,
      "routeLoadPenalty": 2.9,
      "loadZone": 7
    },
    {
      "clientId": "9100281245",
      "name": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 9,
      "deliveries": [
        "827963204"
      ],
      "lines": 14,
      "weightKg": 211.8,
      "volumeM3": 0.096,
      "pallets": 0.34,
      "returnableUnits": 4.0,
      "hasReturnables": true,
      "productTypes": [
        "barril",
        "caja",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.565323,
      "lng": 2.229146,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 13.0,
      "priorityScore": 2.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "retornables"
      ],
      "loadDifficulty": 4.8,
      "optimizedSequence": 13,
      "arrival": "10:36",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 25.0,
      "routeLoadPenalty": 6.6,
      "loadZone": 7
    },
    {
      "clientId": "9100230870",
      "name": "THE JOSE'S BAR PARETS",
      "address": "LA SALUT 37 A",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "currentSequence": 10,
      "deliveries": [
        "827963205"
      ],
      "lines": 2,
      "weightKg": 3.3,
      "volumeM3": 0.002,
      "pallets": 0.02,
      "returnableUnits": 0.0,
      "hasReturnables": false,
      "productTypes": [
        "caja",
        "otros"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.560674,
      "lng": 2.219275,
      "geocodeSource": "Nominatim",
      "serviceMinutes": 7.1,
      "priorityScore": 1.0,
      "priorityLabel": "Normal",
      "priorityReasons": [
        "sin restricción explícita"
      ],
      "loadDifficulty": 2.0,
      "optimizedSequence": 14,
      "arrival": "10:52",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 13.8,
      "routeLoadPenalty": 3.0,
      "loadZone": 8
    },
    {
      "clientId": "9100733609",
      "name": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "currentSequence": 1,
      "deliveries": [
        "827963194",
        "841033663"
      ],
      "lines": 14,
      "weightKg": 368.2,
      "volumeM3": 0.291,
      "pallets": 1.05,
      "returnableUnits": 2.0,
      "hasReturnables": true,
      "productTypes": [
        "barril",
        "caja",
        "lata",
        "otros",
        "retornable"
      ],
      "window": {
        "label": "Sin horario",
        "startMinute": null,
        "endMinute": null,
        "source": "No encontrado"
      },
      "lat": 41.539503,
      "lng": 2.214178,
      "geocodeSource": "centroide local",
      "serviceMinutes": 16.7,
      "priorityScore": 3.0,
      "priorityLabel": "Media",
      "priorityReasons": [
        "retornables",
        "carga alta"
      ],
      "loadDifficulty": 7.2,
      "optimizedSequence": 15,
      "arrival": "11:06",
      "windowStatus": "ok",
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "routePriorityPenalty": 44.5,
      "routeLoadPenalty": 11.5,
      "loadZone": 8
    }
  ],
  "masterRows": [
    {
      "lineId": "827963194-ED15LN-1",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "ED15LN",
      "product": "ESTRELLA DAMM 1/5 LN",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 28.68,
      "volumeM3": 0.012,
      "pallets": 0.02857,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-CJ15-2",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "CJ15",
      "product": "CAJA DAMM+BOT.1/5RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-ED30-3",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "ED30",
      "product": "ESTRELLA DAMM BARRIL 30",
      "quantity": 4.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 171.152,
      "volumeM3": 0.12,
      "pallets": 0.66667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-BRL30V-4",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "BRL30V",
      "product": "BARRIL INOX 30L. EURONORMA",
      "quantity": 4.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-VE12SP-5",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "VE12SP",
      "product": "AGUA VERI 1/2 PET CAJA 24U. T.TH",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 25.8,
      "volumeM3": 0.024,
      "pallets": 0.03175,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-0RF0020-6",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "0RF0020",
      "product": "/-FANTA NARANJA LATA 33CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "lata",
      "weightKg": 8.6,
      "volumeM3": 0.00792,
      "pallets": 0.00926,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-0RF0022-7",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "0RF0022",
      "product": "/-AQUARIUS LIMON 33CL LATA 24U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "lata",
      "weightKg": 17.2,
      "volumeM3": 0.01584,
      "pallets": 0.01852,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-0RF1697-8",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "0RF1697",
      "product": "/-COCA COLA IMPORT LATA33 24U",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "lata",
      "weightKg": 25.8,
      "volumeM3": 0.02376,
      "pallets": 0.0303,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-DL20-9",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "DL20",
      "product": "DAMM LEMON BARRIL 20L.",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 27.596,
      "volumeM3": 0.02,
      "pallets": 0.06667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-BRL20V-10",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "BRL20V",
      "product": "BARRIL INOX 20L. TANQUETA A16",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-UE902-11",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "UE902",
      "product": "COPA GRANDE ED",
      "quantity": 12.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 3.096,
      "volumeM3": 0.02167,
      "pallets": 0.0125,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963194-0RF1698-12",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963194",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "0RF1698",
      "product": "/-COCA COLA ZERO IMPORT LATA33 24U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "lata",
      "weightKg": 17.2,
      "volumeM3": 0.01584,
      "pallets": 0.0202,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "827963195-ED13-13",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963195",
      "clientId": "9100700812",
      "clientName": "SUPER NABILA PARETS",
      "address": "Carrer de Conestable de Portugal 8",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 8.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 136.0,
      "volumeM3": 0.06336,
      "pallets": 0.13333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 9.1,
      "optimizedSequence": 7,
      "loadZone": 4
    },
    {
      "lineId": "827963195-CJ13-14",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963195",
      "clientId": "9100700812",
      "clientName": "SUPER NABILA PARETS",
      "address": "Carrer de Conestable de Portugal 8",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 8.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 9.1,
      "optimizedSequence": 7,
      "loadZone": 4
    },
    {
      "lineId": "827963195-ED15LN-15",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963195",
      "clientId": "9100700812",
      "clientName": "SUPER NABILA PARETS",
      "address": "Carrer de Conestable de Portugal 8",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED15LN",
      "product": "ESTRELLA DAMM 1/5 LN",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 28.68,
      "volumeM3": 0.012,
      "pallets": 0.02857,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 9.1,
      "optimizedSequence": 7,
      "loadZone": 4
    },
    {
      "lineId": "827963195-CJ15-16",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963195",
      "clientId": "9100700812",
      "clientName": "SUPER NABILA PARETS",
      "address": "Carrer de Conestable de Portugal 8",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ15",
      "product": "CAJA DAMM+BOT.1/5RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 9.1,
      "optimizedSequence": 7,
      "loadZone": 4
    },
    {
      "lineId": "827963196-ED13-17",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 20.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 340.0,
      "volumeM3": 0.1584,
      "pallets": 0.33333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-CJ13-18",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 20.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0AG0007-19",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AG0007",
      "product": "FONT D.OR NATURAL 1,5L PET 12U",
      "quantity": 10.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 190.0,
      "volumeM3": 0.18,
      "pallets": 0.25,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0AG0004-20",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AG0004",
      "product": "FONT D.OR NATURAL 1/2 PET 24U",
      "quantity": 10.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 130.0,
      "volumeM3": 0.12,
      "pallets": 0.15873,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0LT0235-21",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0235",
      "product": "LA LEVANTINA AVENA ESP.HOST 1L 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.5,
      "volumeM3": 0.006,
      "pallets": 0.00833,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0LI0204-22",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0204",
      "product": "J&B RARE WHISKY 1L",
      "quantity": 6.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.006,
      "pallets": 0.005,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0LI0692-23",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0692",
      "product": "JOHNNIE WALKER RED LAB WHISKY 1L",
      "quantity": 3.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 4.44,
      "volumeM3": 0.003,
      "pallets": 0.00595,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0AM1282-24",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM1282",
      "product": "BARGALLO OLI GIRASOL 5L",
      "quantity": 3.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 15.0,
      "volumeM3": 0.0,
      "pallets": 0.02,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0AM0292-25",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM0292",
      "product": "BISCUITS GALICIA MINI MAGD CHOCO 1,5KG",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.05114,
      "pallets": 0.03571,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0LM1712-26",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LM1712",
      "product": "BALNIC LAVAVAJILLAS MANUAL PH NEUTRO 5KG",
      "quantity": 4.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 20.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0LM0091-27",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LM0091",
      "product": "TOALLA SECAMANOS 2C 20/230U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 5.0,
      "volumeM3": 1e-05,
      "pallets": 0.02222,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0AG0004-28",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AG0004",
      "product": "FONT D.OR NATURAL 1/2 PET 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 13.0,
      "volumeM3": 0.012,
      "pallets": 0.01587,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963196-0AG0007-29",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963196",
      "clientId": "9100692245",
      "clientName": "Bar 20 PA K",
      "address": "Avinguda de Catalunya 133",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AG0007",
      "product": "FONT D.OR NATURAL 1,5L PET 12U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 19.0,
      "volumeM3": 0.018,
      "pallets": 0.025,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Alta",
      "priorityScore": 5.5,
      "serviceMinutesClient": 16.2,
      "optimizedSequence": 1,
      "loadZone": 1
    },
    {
      "lineId": "827963197-ED13-30",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 6.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 102.0,
      "volumeM3": 0.04752,
      "pallets": 0.1,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963197-CJ13-31",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 6.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963197-VE12SP-32",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE12SP",
      "product": "AGUA VERI 1/2 PET CAJA 24U. T.TH",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 25.8,
      "volumeM3": 0.024,
      "pallets": 0.03175,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963197-0LT0235-33",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0235",
      "product": "LA LEVANTINA AVENA ESP.HOST 1L 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.5,
      "volumeM3": 0.006,
      "pallets": 0.00833,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963197-0LT0033-34",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0033",
      "product": "LETONA GRAN CREME PET 1,5L PET 6U",
      "quantity": 4.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 36.0,
      "volumeM3": 0.036,
      "pallets": 0.05,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963197-0AM0783-35",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM0783",
      "product": "LOTUS BISCOFF 300U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 4.36,
      "volumeM3": 0.01505,
      "pallets": 0.0119,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963197-0AM0783-36",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963197",
      "clientId": "9100669500",
      "clientName": "Bar Restaurant Tres Roses",
      "address": "Carrer de Mary Santpere 1",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM0783",
      "product": "LOTUS BISCOFF 300U",
      "quantity": 1.0,
      "unit": "ZPR",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.00595,
      "returnable": false,
      "metricSource": "PAL prorrateado",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 10.4,
      "optimizedSequence": 5,
      "loadZone": 3
    },
    {
      "lineId": "827963198-FDT13-37",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963198",
      "clientId": "9100661113",
      "clientName": "BAR LA ESQUINITA",
      "address": "Avinguda de Catalunya 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDT13",
      "product": "FREE DAMM TOSTADA 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 7.7,
      "optimizedSequence": 2,
      "loadZone": 2
    },
    {
      "lineId": "827963198-CJ13-38",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963198",
      "clientId": "9100661113",
      "clientName": "BAR LA ESQUINITA",
      "address": "Avinguda de Catalunya 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 7.7,
      "optimizedSequence": 2,
      "loadZone": 2
    },
    {
      "lineId": "827963198-FDT13-39",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963198",
      "clientId": "9100661113",
      "clientName": "BAR LA ESQUINITA",
      "address": "Avinguda de Catalunya 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDT13",
      "product": "FREE DAMM TOSTADA 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 7.7,
      "optimizedSequence": 2,
      "loadZone": 2
    },
    {
      "lineId": "827963198-CJ13-40",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963198",
      "clientId": "9100661113",
      "clientName": "BAR LA ESQUINITA",
      "address": "Avinguda de Catalunya 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 7.7,
      "optimizedSequence": 2,
      "loadZone": 2
    },
    {
      "lineId": "827963199-ED13-41",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 9.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 153.0,
      "volumeM3": 0.07128,
      "pallets": 0.15,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ13-42",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 9.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-ED15LN-43",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED15LN",
      "product": "ESTRELLA DAMM 1/5 LN",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 14.34,
      "volumeM3": 0.006,
      "pallets": 0.01429,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ15-44",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ15",
      "product": "CAJA DAMM+BOT.1/5RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-FDL13-45",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDL13",
      "product": "FREE DAMM LIMON 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ13-46",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-FDT13-47",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDT13",
      "product": "FREE DAMM TOSTADA 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ13-48",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-DL20-49",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "DL20",
      "product": "DAMM LEMON BARRIL 20L.",
      "quantity": 2.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 55.192,
      "volumeM3": 0.04,
      "pallets": 0.13333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-BRL20V-50",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "BRL20V",
      "product": "BARRIL INOX 20L. TANQUETA A16",
      "quantity": 2.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-ED30-51",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED30",
      "product": "ESTRELLA DAMM BARRIL 30",
      "quantity": 3.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 128.364,
      "volumeM3": 0.09,
      "pallets": 0.5,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-BRL30V-52",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "BRL30V",
      "product": "BARRIL INOX 30L. EURONORMA",
      "quantity": 3.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-TU20-53",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "TU20",
      "product": "TURIA BARRIL 20L.",
      "quantity": 2.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 54.784,
      "volumeM3": 0.04,
      "pallets": 0.13333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-BRL20V-54",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "BRL20V",
      "product": "BARRIL INOX 20L. TANQUETA A16",
      "quantity": 2.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-VE12-55",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE12",
      "product": "AGUA VERI 1/2 VIDRIO RET.",
      "quantity": 6.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 122.436,
      "volumeM3": 0.06,
      "pallets": 0.12,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ12V-56",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ12V",
      "product": "CAJAS COMPLETAS 1/2 V",
      "quantity": 6.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-VE32SP-57",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE32SP",
      "product": "AGUA VERI 1,5L PET CAJA 12U.",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 39.12,
      "volumeM3": 0.036,
      "pallets": 0.04444,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0AG0183-58",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AG0183",
      "product": "VICHY CATALAN GAS 30CL RET 24U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 28.2,
      "volumeM3": 0.0144,
      "pallets": 0.04167,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-3ENV0236-59",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV0236",
      "product": "C.C. AGUA 1/3 VICHY-FONT D'OR",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0LT0235-60",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0235",
      "product": "LA LEVANTINA AVENA ESP.HOST 1L 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.5,
      "volumeM3": 0.006,
      "pallets": 0.00833,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0LT0009-61",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0009",
      "product": "LETONA GRAN CREME 1L VR 12U",
      "quantity": 4.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 91.0,
      "volumeM3": 0.048,
      "pallets": 0.125,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-3ENV1281-62",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV1281",
      "product": "C.C. LECHE LETONA (NUEVO)",
      "quantity": 4.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0RF0124-63",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0RF0124",
      "product": "/-COCA COLA 2L PET 6U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 24.0,
      "volumeM3": 0.024,
      "pallets": 0.03125,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0RF0019-64",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0RF0019",
      "product": "/-COCA COLA LATA 33CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "lata",
      "weightKg": 8.6,
      "volumeM3": 0.00792,
      "pallets": 0.00926,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-NTL13B24-65",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "NTL13B24",
      "product": "NESTEA LIMON 1/3 SR BANDEJA 24U. P.HT",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 13.861,
      "volumeM3": 0.00792,
      "pallets": 0.01587,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0ZU0031-66",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0ZU0031",
      "product": "JUVER NECTAR MELOCOTON 20CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 9.0,
      "volumeM3": 0.0048,
      "pallets": 0.01136,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0ZU0032-67",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0ZU0032",
      "product": "JUVER NECTAR PIÑA 20CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 9.0,
      "volumeM3": 0.0048,
      "pallets": 0.01136,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0LI0719-68",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0719",
      "product": "LAGAR DO FRADE ORUJO DE HIERBAS PET 3L",
      "quantity": 1.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.003,
      "pallets": 0.00417,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0LI0572-69",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0572",
      "product": "FLOR DE CAÑA 5 AÑOS 70CL",
      "quantity": 2.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "ZM040 sin peso/volumen",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0AM0783-70",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM0783",
      "product": "LOTUS BISCOFF 300U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 2.18,
      "volumeM3": 0.00752,
      "pallets": 0.00595,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-TB8-71",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "TB8",
      "product": "BOTELLAS CARBONICO 8 KILOS",
      "quantity": 1.0,
      "unit": "TB",
      "productType": "caja",
      "weightKg": 26.0,
      "volumeM3": 0.008,
      "pallets": 0.04,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-TB8V-72",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "TB8V",
      "product": "BOTELLAS CARBONICO 8 KG.VACIOS",
      "quantity": 1.0,
      "unit": "TB",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0AM0359-73",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM0359",
      "product": "REDONDO ACEITUNA PARTIDA 9 KG.",
      "quantity": 1.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.00694,
      "returnable": false,
      "metricSource": "PAL prorrateado",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-0AM5394-74",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM5394",
      "product": "PROEZA ATUN A.GIRASOL BOLSA 1KG",
      "quantity": 16.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.01852,
      "returnable": false,
      "metricSource": "PAL prorrateado",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-FDT13-75",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDT13",
      "product": "FREE DAMM TOSTADA 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ13-76",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-FDL13-77",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDL13",
      "product": "FREE DAMM LIMON 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-CJ13-78",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963199-VE12SP-79",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963199",
      "clientId": "9100617475",
      "clientName": "VERMUTERIA Y TAPERIA CAMACHO",
      "address": "AVENIDA PEDRA DEL DIABLE 28",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE12SP",
      "product": "AGUA VERI 1/2 PET CAJA 24U. T.TH",
      "quantity": 4.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 51.6,
      "volumeM3": 0.048,
      "pallets": 0.06349,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 4.0,
      "serviceMinutesClient": 25.6,
      "optimizedSequence": 8,
      "loadZone": 5
    },
    {
      "lineId": "827963200-XI13-80",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963200",
      "clientId": "9100574514",
      "clientName": "COREFO (BAR)",
      "address": "AVENIDA CATALUNYA 24",
      "postalCode": "08150",
      "city": "PARETS DEL VALLÈS",
      "material": "XI13",
      "product": "XIBECA 5% 1/3 RET",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 34.0,
      "volumeM3": 0.01584,
      "pallets": 0.03333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.1,
      "optimizedSequence": 11,
      "loadZone": 6
    },
    {
      "lineId": "827963200-CJ13-81",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963200",
      "clientId": "9100574514",
      "clientName": "COREFO (BAR)",
      "address": "AVENIDA CATALUNYA 24",
      "postalCode": "08150",
      "city": "PARETS DEL VALLÈS",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.1,
      "optimizedSequence": 11,
      "loadZone": 6
    },
    {
      "lineId": "827963200-XI13-82",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963200",
      "clientId": "9100574514",
      "clientName": "COREFO (BAR)",
      "address": "AVENIDA CATALUNYA 24",
      "postalCode": "08150",
      "city": "PARETS DEL VALLÈS",
      "material": "XI13",
      "product": "XIBECA 5% 1/3 RET",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 34.0,
      "volumeM3": 0.01584,
      "pallets": 0.03333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.1,
      "optimizedSequence": 11,
      "loadZone": 6
    },
    {
      "lineId": "827963200-CJ13-83",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963200",
      "clientId": "9100574514",
      "clientName": "COREFO (BAR)",
      "address": "AVENIDA CATALUNYA 24",
      "postalCode": "08150",
      "city": "PARETS DEL VALLÈS",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.1,
      "optimizedSequence": 11,
      "loadZone": 6
    },
    {
      "lineId": "827963201-VE12SP-84",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE12SP",
      "product": "AGUA VERI 1/2 PET CAJA 24U. T.TH",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 12.9,
      "volumeM3": 0.012,
      "pallets": 0.01587,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-VE32SP-85",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE32SP",
      "product": "AGUA VERI 1,5L PET CAJA 12U.",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 19.56,
      "volumeM3": 0.018,
      "pallets": 0.02222,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-0LT0032-86",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0032",
      "product": "CACAOLAT VIDRIO 20CL RET 30U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 7.8,
      "volumeM3": 0.006,
      "pallets": 0.02083,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-3ENV0029-87",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV0029",
      "product": "C.C. CACAOLAT 30 U.",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-0LT0235-88",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0235",
      "product": "LA LEVANTINA AVENA ESP.HOST 1L 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.5,
      "volumeM3": 0.006,
      "pallets": 0.00833,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-0LT0009-89",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0009",
      "product": "LETONA GRAN CREME 1L VR 12U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 45.5,
      "volumeM3": 0.024,
      "pallets": 0.0625,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-3ENV1281-90",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV1281",
      "product": "C.C. LECHE LETONA (NUEVO)",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-0LT0090-91",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0090",
      "product": "LETONA SEMI SIN LACTOSA 1L PET 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.5,
      "volumeM3": 0.006,
      "pallets": 0.00952,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963201-0AM1634-92",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963201",
      "clientId": "9100569006",
      "clientName": "PASTISSERIA JOAN",
      "address": "AVENIDA PEDRA DEL DIABLE 6",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM1634",
      "product": "XPLICIT EDULCORANTE 1G 150U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.3,
      "volumeM3": 0.015,
      "pallets": 0.00185,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 8.3,
      "optimizedSequence": 10,
      "loadZone": 6
    },
    {
      "lineId": "827963204-ED13-93",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 34.0,
      "volumeM3": 0.01584,
      "pallets": 0.03333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-CJ13-94",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-TU30-95",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "TU30",
      "product": "TURIA BARRIL 30L.",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 42.788,
      "volumeM3": 0.03,
      "pallets": 0.16667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-BRL30V-96",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "BRL30V",
      "product": "BARRIL INOX 30L. EURONORMA",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0AG0019-97",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AG0019",
      "product": "FONT D.OR MAXIMUM NATURAL 1/2 RET 20U",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 64.5,
      "volumeM3": 0.03,
      "pallets": 0.075,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-3ENV0058-98",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV0058",
      "product": "C.C. 1/2 FONT D'OR MAXIMUM",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0LI0046-99",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0046",
      "product": "VETERANO BRANDY 1L",
      "quantity": 1.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 1.502,
      "volumeM3": 0.001,
      "pallets": 0.00185,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0LI0102-100",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0102",
      "product": "CUTTY SARK WHISKY 70CL",
      "quantity": 1.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0007,
      "pallets": 0.00139,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0LI0138-101",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0138",
      "product": "BAILEYS ORIGINAL 1L",
      "quantity": 1.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 5.0,
      "volumeM3": 0.001,
      "pallets": 0.00083,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0LI0247-102",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0247",
      "product": "ANIS DEL MONO DULCE 70CL",
      "quantity": 1.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0007,
      "pallets": 0.00139,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0AM3565-103",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM3565",
      "product": "BARGALLO ACEITE GOURMET SOL GIRASOL 20L",
      "quantity": 1.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 30.0,
      "volumeM3": 0.0,
      "pallets": 0.02222,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-0LI0084-104",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0084",
      "product": "COINTREAU 70CL",
      "quantity": 1.0,
      "unit": "BOT",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.0007,
      "pallets": 0.00175,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-KE13-105",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "KE13",
      "product": "KELER 18 1/3 RET. PP",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 34.0,
      "volumeM3": 0.01584,
      "pallets": 0.03333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963204-CJ13-106",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963204",
      "clientId": "9100281245",
      "clientName": "BONATAPA",
      "address": "Avinguda de Catalunya 111",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 13.0,
      "optimizedSequence": 13,
      "loadZone": 7
    },
    {
      "lineId": "827963205-0VE0530-107",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963205",
      "clientId": "9100230870",
      "clientName": "THE JOSE'S BAR PARETS",
      "address": "LA SALUT 37 A",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0VE0530",
      "product": "RECAREDO TERRES BRUT NATURE 75CL 1U",
      "quantity": 3.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.00225,
      "pallets": 0.01,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.1,
      "optimizedSequence": 14,
      "loadZone": 8
    },
    {
      "lineId": "827963205-0AM0019-108",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963205",
      "clientId": "9100230870",
      "clientName": "THE JOSE'S BAR PARETS",
      "address": "LA SALUT 37 A",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM0019",
      "product": "CHOVI KETCHUP 10G 252U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 3.3,
      "volumeM3": 7e-05,
      "pallets": 0.00781,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.1,
      "optimizedSequence": 14,
      "loadZone": 8
    },
    {
      "lineId": "827963206-ED13-109",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 6.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 102.0,
      "volumeM3": 0.04752,
      "pallets": 0.1,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-CJ13-110",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 6.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-0VE0543-111",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0VE0543",
      "product": "IRREVERENTE TINTO ROBLE 75CL 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 7.5,
      "volumeM3": 0.0045,
      "pallets": 0.00952,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-NTL13B24-112",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "NTL13B24",
      "product": "NESTEA LIMON 1/3 SR BANDEJA 24U. P.HT",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 27.722,
      "volumeM3": 0.01584,
      "pallets": 0.03175,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-0AM5310-113",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM5310",
      "product": "BARGALLO RUGIN OLI FREGIR ALT OLEICO 20L",
      "quantity": 1.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 20.0,
      "volumeM3": 0.0,
      "pallets": 0.02222,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-VO13-114",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VO13",
      "product": "VOLL-DAMM 1/3 RET.",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 34.0,
      "volumeM3": 0.01584,
      "pallets": 0.03333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-CJ13-115",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-ED13-116",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 51.0,
      "volumeM3": 0.02376,
      "pallets": 0.05,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963206-CJ13-117",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963206",
      "clientId": "9100227177",
      "clientName": "BAR FRANKFURT INSBRUCK",
      "address": "CALLE INDEPENDENCIA 51",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 11.4,
      "optimizedSequence": 9,
      "loadZone": 5
    },
    {
      "lineId": "827963207-0LT0032-118",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963207",
      "clientId": "9100158102",
      "clientName": "LA NORIA BAKERY",
      "address": "CALLE BUTJOSA 58",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0032",
      "product": "CACAOLAT VIDRIO 20CL RET 30U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 7.8,
      "volumeM3": 0.006,
      "pallets": 0.02083,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.9,
      "optimizedSequence": 12,
      "loadZone": 7
    },
    {
      "lineId": "827963207-3ENV0029-119",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963207",
      "clientId": "9100158102",
      "clientName": "LA NORIA BAKERY",
      "address": "CALLE BUTJOSA 58",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV0029",
      "product": "C.C. CACAOLAT 30 U.",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.9,
      "optimizedSequence": 12,
      "loadZone": 7
    },
    {
      "lineId": "827963207-0LT0090-120",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963207",
      "clientId": "9100158102",
      "clientName": "LA NORIA BAKERY",
      "address": "CALLE BUTJOSA 58",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0090",
      "product": "LETONA SEMI SIN LACTOSA 1L PET 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.5,
      "volumeM3": 0.006,
      "pallets": 0.00952,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.9,
      "optimizedSequence": 12,
      "loadZone": 7
    },
    {
      "lineId": "827963207-0LT0033-121",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963207",
      "clientId": "9100158102",
      "clientName": "LA NORIA BAKERY",
      "address": "CALLE BUTJOSA 58",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0033",
      "product": "LETONA GRAN CREME PET 1,5L PET 6U",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 18.0,
      "volumeM3": 0.018,
      "pallets": 0.025,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.9,
      "optimizedSequence": 12,
      "loadZone": 7
    },
    {
      "lineId": "827963207-0LM0296-122",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963207",
      "clientId": "9100158102",
      "clientName": "LA NORIA BAKERY",
      "address": "CALLE BUTJOSA 58",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LM0296",
      "product": "BALNIC DESENGRASANTE PROF 1L",
      "quantity": 2.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 0.0,
      "volumeM3": 0.002,
      "pallets": 0.00167,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 1.0,
      "serviceMinutesClient": 7.9,
      "optimizedSequence": 12,
      "loadZone": 7
    },
    {
      "lineId": "827963208-ED13-123",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 8.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 136.0,
      "volumeM3": 0.06336,
      "pallets": 0.13333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-CJ13-124",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 8.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-ED15LN-125",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED15LN",
      "product": "ESTRELLA DAMM 1/5 LN",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 14.34,
      "volumeM3": 0.006,
      "pallets": 0.01429,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-CJ15-126",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ15",
      "product": "CAJA DAMM+BOT.1/5RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-FD13-127",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FD13",
      "product": "FREE DAMM 1/3 RET.",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-CJ13-128",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-FDT13-129",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "FDT13",
      "product": "FREE DAMM TOSTADA 1/3 RET. PP",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-CJ13-130",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-VO13-131",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VO13",
      "product": "VOLL-DAMM 1/3 RET.",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-CJ13-132",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-VE12SP-133",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE12SP",
      "product": "AGUA VERI 1/2 PET CAJA 24U. T.TH",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 25.8,
      "volumeM3": 0.024,
      "pallets": 0.03175,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0LT0033-134",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0033",
      "product": "LETONA GRAN CREME PET 1,5L PET 6U",
      "quantity": 3.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 27.0,
      "volumeM3": 0.027,
      "pallets": 0.0375,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0VE0524-135",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0VE0524",
      "product": "SEÑORIO DE LIZIA VERDEJO RUEDA 75CL 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 7.5,
      "volumeM3": 0.0045,
      "pallets": 0.008,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0VE0506-136",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0VE0506",
      "product": "HALLAZGO JOVEN 75CL 6U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 7.5,
      "volumeM3": 0.0045,
      "pallets": 0.00952,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0CF0080-137",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0CF0080",
      "product": "XPLICIT NATURAL CREMOSO 1KG",
      "quantity": 4.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 4.0,
      "volumeM3": 0.004,
      "pallets": 0.0125,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0RF0287-138",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0RF0287",
      "product": "/-COCA COLA VR237 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 6.4,
      "volumeM3": 0.02526,
      "pallets": 0.02083,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-3ENV0021-139",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "3ENV0021",
      "product": "CAJA+BOTELLA COLA VR237",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0LI0510-140",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LI0510",
      "product": "PANIZO ORUJO HIERBAS 70CL",
      "quantity": 6.0,
      "unit": "UN",
      "productType": "otros",
      "weightKg": 9.3,
      "volumeM3": 0.00419,
      "pallets": 0.00349,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963208-0AM1291-141",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963208",
      "clientId": "9100150711",
      "clientName": "LA PERGOLA",
      "address": "PAU CASALS 33",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0AM1291",
      "product": "AZUCAR BLANCO BOLSITA 7GR ''BARES''1000U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "ZM040 sin peso/volumen",
      "priority": "Normal",
      "priorityScore": 2.5,
      "serviceMinutesClient": 13.9,
      "optimizedSequence": 6,
      "loadZone": 4
    },
    {
      "lineId": "827963209-ED13-142",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963209",
      "clientId": "9100041543",
      "clientName": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED13",
      "product": "ESTRELLA DAMM 1/3 RET. PP",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 34.0,
      "volumeM3": 0.01584,
      "pallets": 0.03333,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 10.1,
      "optimizedSequence": 3,
      "loadZone": 2
    },
    {
      "lineId": "827963209-CJ13-143",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963209",
      "clientId": "9100041543",
      "clientName": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 10.1,
      "optimizedSequence": 3,
      "loadZone": 2
    },
    {
      "lineId": "827963209-ED30-144",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963209",
      "clientId": "9100041543",
      "clientName": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "ED30",
      "product": "ESTRELLA DAMM BARRIL 30",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 42.788,
      "volumeM3": 0.03,
      "pallets": 0.16667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 10.1,
      "optimizedSequence": 3,
      "loadZone": 2
    },
    {
      "lineId": "827963209-BRL30V-145",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963209",
      "clientId": "9100041543",
      "clientName": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "BRL30V",
      "product": "BARRIL INOX 30L. EURONORMA",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 10.1,
      "optimizedSequence": 3,
      "loadZone": 2
    },
    {
      "lineId": "827963209-VE12SP-146",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963209",
      "clientId": "9100041543",
      "clientName": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "VE12SP",
      "product": "AGUA VERI 1/2 PET CAJA 24U. T.TH",
      "quantity": 2.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 25.8,
      "volumeM3": 0.024,
      "pallets": 0.03175,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 10.1,
      "optimizedSequence": 3,
      "loadZone": 2
    },
    {
      "lineId": "827963209-0LT0033-147",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963209",
      "clientId": "9100041543",
      "clientName": "BAR LOS GALLEGOS",
      "address": "Avinguda de Catalunya 92",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0LT0033",
      "product": "LETONA GRAN CREME PET 1,5L PET 6U",
      "quantity": 4.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 36.0,
      "volumeM3": 0.036,
      "pallets": 0.05,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 10.1,
      "optimizedSequence": 3,
      "loadZone": 2
    },
    {
      "lineId": "827963210-XI13-148",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "XI13",
      "product": "XIBECA 5% 1/3 RET",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-CJ13-149",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-0ZU0021-150",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0ZU0021",
      "product": "GRANINI NARANJA 20CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 8.4,
      "volumeM3": 0.0048,
      "pallets": 0.01111,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-0ZU0024-151",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0ZU0024",
      "product": "GRANINI PIÑA 20CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 8.4,
      "volumeM3": 0.0048,
      "pallets": 0.01111,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-XI13-152",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "XI13",
      "product": "XIBECA 5% 1/3 RET",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 17.0,
      "volumeM3": 0.00792,
      "pallets": 0.01667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-CJ13-153",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "CJ13",
      "product": "CAJA DAMM+BOT.1/3RET VACIO EN P.PLAS.A13",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "retornable",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": true,
      "metricSource": "sin ZM040",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-0ZU0020-154",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0ZU0020",
      "product": "GRANINI MELOCOTON 20CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 8.4,
      "volumeM3": 0.0048,
      "pallets": 0.01111,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "827963210-0ZU0271-155",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "827963210",
      "clientId": "9100041393",
      "clientName": "BAR LAS COLUMNAS",
      "address": "CATALUNYA 102",
      "postalCode": "08150",
      "city": "PARETS DEL VALLES",
      "material": "0ZU0271",
      "product": "GRANINI LIMONADA 20CL 24U",
      "quantity": 1.0,
      "unit": "CAJ",
      "productType": "caja",
      "weightKg": 8.4,
      "volumeM3": 0.0048,
      "pallets": 0.01111,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Normal",
      "priorityScore": 2.0,
      "serviceMinutesClient": 8.8,
      "optimizedSequence": 4,
      "loadZone": 3
    },
    {
      "lineId": "841033663-DL30-156",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "841033663",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "DL30",
      "product": "DAMM LEMON BARRIL 30",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 43.095,
      "volumeM3": 0.03,
      "pallets": 0.16667,
      "returnable": false,
      "metricSource": "ZM040 directa",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    },
    {
      "lineId": "841033663-BRL30V-157",
      "date": "2026-02-05",
      "transport": "11443209",
      "routeReal": "DR0040",
      "route": "DR0023",
      "driver": "850013",
      "deliveryId": "841033663",
      "clientId": "9100733609",
      "clientName": "BAR FUTBOL LOURDES",
      "address": "CAMINO CAN VILA S/N",
      "postalCode": "08100",
      "city": "MOLLET DEL VALLES",
      "material": "BRL30V",
      "product": "BARRIL INOX 30L. EURONORMA",
      "quantity": 1.0,
      "unit": "BRL",
      "productType": "barril",
      "weightKg": 0.0,
      "volumeM3": 0.0,
      "pallets": 0.0,
      "returnable": false,
      "metricSource": "sin ZM040",
      "priority": "Media",
      "priorityScore": 3.0,
      "serviceMinutesClient": 16.7,
      "optimizedSequence": 15,
      "loadZone": 8
    }
  ],
  "route": {
    "originalSequence": [
      "9100733609",
      "9100700812",
      "9100692245",
      "9100669500",
      "9100661113",
      "9100617475",
      "9100574514",
      "9100569006",
      "9100281245",
      "9100230870",
      "9100227177",
      "9100158102",
      "9100150711",
      "9100041543",
      "9100041393"
    ],
    "optimizedSequence": [
      "9100692245",
      "9100661113",
      "9100041543",
      "9100041393",
      "9100669500",
      "9100150711",
      "9100700812",
      "9100617475",
      "9100227177",
      "9100569006",
      "9100574514",
      "9100158102",
      "9100281245",
      "9100230870",
      "9100733609"
    ],
    "original": {
      "distanceKm": 26.6,
      "driveMinutes": 54.0,
      "serviceMinutes": 174.0,
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "priorityPenalty": 288.3,
      "loadPenalty": 46.0,
      "fuelPenalty": 8.0,
      "operationalScore": 570.2,
      "totalMinutes": 228.0,
      "finish": "11:48",
      "stops": [
        {
          "clientId": "9100733609",
          "arrival": "08:02",
          "serviceMinutes": 16.7,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 0.6,
          "loadPenalty": 0.0,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100700812",
          "arrival": "08:27",
          "serviceMinutes": 9.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 8.8,
          "loadPenalty": 0.4,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100692245",
          "arrival": "08:40",
          "serviceMinutes": 16.2,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 17.5,
          "loadPenalty": 1.7,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100669500",
          "arrival": "08:59",
          "serviceMinutes": 10.4,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 18.7,
          "loadPenalty": 1.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100661113",
          "arrival": "09:12",
          "serviceMinutes": 7.7,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 11.5,
          "loadPenalty": 1.1,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100617475",
          "arrival": "09:23",
          "serviceMinutes": 25.6,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 26.6,
          "loadPenalty": 6.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100574514",
          "arrival": "09:52",
          "serviceMinutes": 8.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 17.9,
          "loadPenalty": 1.9,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100569006",
          "arrival": "10:03",
          "serviceMinutes": 8.3,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 9.8,
          "loadPenalty": 1.8,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100281245",
          "arrival": "10:12",
          "serviceMinutes": 13.0,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 21.1,
          "loadPenalty": 4.4,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100230870",
          "arrival": "10:28",
          "serviceMinutes": 7.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 11.8,
          "loadPenalty": 2.1,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100227177",
          "arrival": "10:41",
          "serviceMinutes": 11.4,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 25.8,
          "loadPenalty": 5.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100158102",
          "arrival": "10:56",
          "serviceMinutes": 7.9,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 14.1,
          "loadPenalty": 2.9,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100150711",
          "arrival": "11:08",
          "serviceMinutes": 13.9,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 37.5,
          "loadPenalty": 7.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100041543",
          "arrival": "11:23",
          "serviceMinutes": 10.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 32.5,
          "loadPenalty": 5.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100041393",
          "arrival": "11:34",
          "serviceMinutes": 8.8,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 34.2,
          "loadPenalty": 4.3,
          "windowStatus": "ok"
        }
      ]
    },
    "optimized": {
      "distanceKm": 14.8,
      "driveMinutes": 30.0,
      "serviceMinutes": 174.0,
      "waitMinutes": 0.0,
      "lateMinutes": 0.0,
      "priorityPenalty": 244.1,
      "loadPenalty": 51.6,
      "fuelPenalty": 4.4,
      "operationalScore": 504.2,
      "totalMinutes": 204.0,
      "finish": "11:24",
      "stops": [
        {
          "clientId": "9100692245",
          "arrival": "08:05",
          "serviceMinutes": 16.2,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 2.2,
          "loadPenalty": 0.0,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100661113",
          "arrival": "08:21",
          "serviceMinutes": 7.7,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 3.4,
          "loadPenalty": 0.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100041543",
          "arrival": "08:30",
          "serviceMinutes": 10.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 4.8,
          "loadPenalty": 0.8,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100041393",
          "arrival": "08:41",
          "serviceMinutes": 8.8,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 6.5,
          "loadPenalty": 0.9,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100669500",
          "arrival": "08:50",
          "serviceMinutes": 10.4,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 16.1,
          "loadPenalty": 1.8,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100150711",
          "arrival": "09:01",
          "serviceMinutes": 13.9,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 12.3,
          "loadPenalty": 3.0,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100700812",
          "arrival": "09:19",
          "serviceMinutes": 9.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 25.1,
          "loadPenalty": 2.4,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100617475",
          "arrival": "09:28",
          "serviceMinutes": 25.6,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 28.1,
          "loadPenalty": 8.8,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100227177",
          "arrival": "09:55",
          "serviceMinutes": 11.4,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 18.3,
          "loadPenalty": 4.2,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100569006",
          "arrival": "10:08",
          "serviceMinutes": 8.3,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 10.3,
          "loadPenalty": 2.3,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100574514",
          "arrival": "10:18",
          "serviceMinutes": 8.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 22.0,
          "loadPenalty": 3.1,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100158102",
          "arrival": "10:26",
          "serviceMinutes": 7.9,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 11.7,
          "loadPenalty": 2.9,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100281245",
          "arrival": "10:36",
          "serviceMinutes": 13.0,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 25.0,
          "loadPenalty": 6.6,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100230870",
          "arrival": "10:52",
          "serviceMinutes": 7.1,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 13.8,
          "loadPenalty": 3.0,
          "windowStatus": "ok"
        },
        {
          "clientId": "9100733609",
          "arrival": "11:06",
          "serviceMinutes": 16.7,
          "waitMinutes": 0.0,
          "lateMinutes": 0.0,
          "priorityPenalty": 44.5,
          "loadPenalty": 11.5,
          "windowStatus": "ok"
        }
      ]
    },
    "optimizedPolyline": [
      {
        "lat": 41.540682,
        "lng": 2.21346
      },
      {
        "lat": 41.540694,
        "lng": 2.213451
      },
      {
        "lat": 41.540756,
        "lng": 2.213446
      },
      {
        "lat": 41.540732,
        "lng": 2.213344
      },
      {
        "lat": 41.540586,
        "lng": 2.213466
      },
      {
        "lat": 41.540529,
        "lng": 2.213512
      },
      {
        "lat": 41.540669,
        "lng": 2.213633
      },
      {
        "lat": 41.540783,
        "lng": 2.213731
      },
      {
        "lat": 41.541378,
        "lng": 2.214186
      },
      {
        "lat": 41.541684,
        "lng": 2.214418
      },
      {
        "lat": 41.541735,
        "lng": 2.214457
      },
      {
        "lat": 41.541962,
        "lng": 2.214675
      },
      {
        "lat": 41.542473,
        "lng": 2.215198
      },
      {
        "lat": 41.542548,
        "lng": 2.215275
      },
      {
        "lat": 41.542967,
        "lng": 2.215697
      },
      {
        "lat": 41.543023,
        "lng": 2.215754
      },
      {
        "lat": 41.543136,
        "lng": 2.215865
      },
      {
        "lat": 41.543553,
        "lng": 2.216279
      },
      {
        "lat": 41.544148,
        "lng": 2.216884
      },
      {
        "lat": 41.544209,
        "lng": 2.216947
      },
      {
        "lat": 41.544193,
        "lng": 2.216989
      },
      {
        "lat": 41.544181,
        "lng": 2.217044
      },
      {
        "lat": 41.544181,
        "lng": 2.217083
      },
      {
        "lat": 41.5442,
        "lng": 2.217152
      },
      {
        "lat": 41.544234,
        "lng": 2.217205
      },
      {
        "lat": 41.5443,
        "lng": 2.217228
      },
      {
        "lat": 41.544328,
        "lng": 2.217225
      },
      {
        "lat": 41.544394,
        "lng": 2.217196
      },
      {
        "lat": 41.5445,
        "lng": 2.217311
      },
      {
        "lat": 41.544563,
        "lng": 2.217379
      },
      {
        "lat": 41.544926,
        "lng": 2.217752
      },
      {
        "lat": 41.544992,
        "lng": 2.21782
      },
      {
        "lat": 41.545059,
        "lng": 2.217889
      },
      {
        "lat": 41.545591,
        "lng": 2.218429
      },
      {
        "lat": 41.54572,
        "lng": 2.218559
      },
      {
        "lat": 41.545815,
        "lng": 2.218656
      },
      {
        "lat": 41.54578,
        "lng": 2.218712
      },
      {
        "lat": 41.545734,
        "lng": 2.218801
      },
      {
        "lat": 41.54548,
        "lng": 2.219257
      },
      {
        "lat": 41.5454,
        "lng": 2.2194
      },
      {
        "lat": 41.545323,
        "lng": 2.219532
      },
      {
        "lat": 41.545124,
        "lng": 2.219866
      },
      {
        "lat": 41.545041,
        "lng": 2.220005
      },
      {
        "lat": 41.544867,
        "lng": 2.220334
      },
      {
        "lat": 41.544789,
        "lng": 2.220481
      },
      {
        "lat": 41.544736,
        "lng": 2.22044
      },
      {
        "lat": 41.544676,
        "lng": 2.220431
      },
      {
        "lat": 41.544617,
        "lng": 2.220454
      },
      {
        "lat": 41.54457,
        "lng": 2.220505
      },
      {
        "lat": 41.544546,
        "lng": 2.220561
      },
      {
        "lat": 41.544537,
        "lng": 2.220625
      },
      {
        "lat": 41.544542,
        "lng": 2.220686
      },
      {
        "lat": 41.544561,
        "lng": 2.220743
      },
      {
        "lat": 41.544592,
        "lng": 2.220789
      },
      {
        "lat": 41.544631,
        "lng": 2.220821
      },
      {
        "lat": 41.544676,
        "lng": 2.220835
      },
      {
        "lat": 41.544721,
        "lng": 2.220831
      },
      {
        "lat": 41.544764,
        "lng": 2.220809
      },
      {
        "lat": 41.544806,
        "lng": 2.22076
      },
      {
        "lat": 41.544901,
        "lng": 2.220853
      },
      {
        "lat": 41.544967,
        "lng": 2.220917
      },
      {
        "lat": 41.544993,
        "lng": 2.220944
      },
      {
        "lat": 41.545614,
        "lng": 2.221569
      },
      {
        "lat": 41.545661,
        "lng": 2.221617
      },
      {
        "lat": 41.545693,
        "lng": 2.221649
      },
      {
        "lat": 41.546056,
        "lng": 2.222016
      },
      {
        "lat": 41.546421,
        "lng": 2.222415
      },
      {
        "lat": 41.546559,
        "lng": 2.222581
      },
      {
        "lat": 41.546882,
        "lng": 2.222982
      },
      {
        "lat": 41.547354,
        "lng": 2.223632
      },
      {
        "lat": 41.547628,
        "lng": 2.223838
      },
      {
        "lat": 41.547891,
        "lng": 2.223958
      },
      {
        "lat": 41.547927,
        "lng": 2.223975
      },
      {
        "lat": 41.547925,
        "lng": 2.22409
      },
      {
        "lat": 41.547957,
        "lng": 2.224198
      },
      {
        "lat": 41.548019,
        "lng": 2.22428
      },
      {
        "lat": 41.548084,
        "lng": 2.224319
      },
      {
        "lat": 41.548155,
        "lng": 2.224327
      },
      {
        "lat": 41.548225,
        "lng": 2.224303
      },
      {
        "lat": 41.548285,
        "lng": 2.22425
      },
      {
        "lat": 41.548328,
        "lng": 2.224174
      },
      {
        "lat": 41.548348,
        "lng": 2.224104
      },
      {
        "lat": 41.548354,
        "lng": 2.224029
      },
      {
        "lat": 41.548344,
        "lng": 2.223954
      },
      {
        "lat": 41.548402,
        "lng": 2.223842
      },
      {
        "lat": 41.548441,
        "lng": 2.223777
      },
      {
        "lat": 41.548477,
        "lng": 2.223736
      },
      {
        "lat": 41.548537,
        "lng": 2.223685
      },
      {
        "lat": 41.548623,
        "lng": 2.223638
      },
      {
        "lat": 41.548745,
        "lng": 2.2236
      },
      {
        "lat": 41.548859,
        "lng": 2.223576
      },
      {
        "lat": 41.549146,
        "lng": 2.223545
      },
      {
        "lat": 41.549436,
        "lng": 2.223533
      },
      {
        "lat": 41.549677,
        "lng": 2.223533
      },
      {
        "lat": 41.549783,
        "lng": 2.223542
      },
      {
        "lat": 41.549874,
        "lng": 2.223556
      },
      {
        "lat": 41.550051,
        "lng": 2.223586
      },
      {
        "lat": 41.5502,
        "lng": 2.223621
      },
      {
        "lat": 41.55032,
        "lng": 2.22366
      },
      {
        "lat": 41.550595,
        "lng": 2.223717
      },
      {
        "lat": 41.550703,
        "lng": 2.223778
      },
      {
        "lat": 41.550958,
        "lng": 2.223937
      },
      {
        "lat": 41.55116,
        "lng": 2.22409
      },
      {
        "lat": 41.551381,
        "lng": 2.224279
      },
      {
        "lat": 41.551736,
        "lng": 2.22463
      },
      {
        "lat": 41.552459,
        "lng": 2.225355
      },
      {
        "lat": 41.553075,
        "lng": 2.226009
      },
      {
        "lat": 41.553589,
        "lng": 2.226587
      },
      {
        "lat": 41.553744,
        "lng": 2.226783
      },
      {
        "lat": 41.553893,
        "lng": 2.227016
      },
      {
        "lat": 41.554072,
        "lng": 2.227268
      },
      {
        "lat": 41.554442,
        "lng": 2.227698
      },
      {
        "lat": 41.554632,
        "lng": 2.227938
      },
      {
        "lat": 41.554726,
        "lng": 2.228067
      },
      {
        "lat": 41.554751,
        "lng": 2.228121
      },
      {
        "lat": 41.554775,
        "lng": 2.228193
      },
      {
        "lat": 41.554788,
        "lng": 2.228245
      },
      {
        "lat": 41.554794,
        "lng": 2.228322
      },
      {
        "lat": 41.554792,
        "lng": 2.228381
      },
      {
        "lat": 41.554781,
        "lng": 2.228452
      },
      {
        "lat": 41.554741,
        "lng": 2.228564
      },
      {
        "lat": 41.554634,
        "lng": 2.228787
      },
      {
        "lat": 41.55458,
        "lng": 2.228877
      },
      {
        "lat": 41.554515,
        "lng": 2.229007
      },
      {
        "lat": 41.554497,
        "lng": 2.229079
      },
      {
        "lat": 41.554479,
        "lng": 2.229178
      },
      {
        "lat": 41.554484,
        "lng": 2.229269
      },
      {
        "lat": 41.554511,
        "lng": 2.229389
      },
      {
        "lat": 41.554541,
        "lng": 2.229463
      },
      {
        "lat": 41.554592,
        "lng": 2.229528
      },
      {
        "lat": 41.554652,
        "lng": 2.229582
      },
      {
        "lat": 41.554726,
        "lng": 2.229625
      },
      {
        "lat": 41.554912,
        "lng": 2.229664
      },
      {
        "lat": 41.554992,
        "lng": 2.229739
      },
      {
        "lat": 41.555036,
        "lng": 2.229739
      },
      {
        "lat": 41.555065,
        "lng": 2.229732
      },
      {
        "lat": 41.55507,
        "lng": 2.229729
      },
      {
        "lat": 41.555104,
        "lng": 2.229707
      },
      {
        "lat": 41.555136,
        "lng": 2.229484
      },
      {
        "lat": 41.555219,
        "lng": 2.228878
      },
      {
        "lat": 41.555283,
        "lng": 2.228632
      },
      {
        "lat": 41.55533,
        "lng": 2.228488
      },
      {
        "lat": 41.555402,
        "lng": 2.228313
      },
      {
        "lat": 41.555627,
        "lng": 2.227872
      },
      {
        "lat": 41.555715,
        "lng": 2.227702
      },
      {
        "lat": 41.555959,
        "lng": 2.22726
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.556835,
        "lng": 2.226768
      },
      {
        "lat": 41.556835,
        "lng": 2.226768
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.561669,
        "lng": 2.228238
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563536,
        "lng": 2.228882
      },
      {
        "lat": 41.563534,
        "lng": 2.228941
      },
      {
        "lat": 41.563569,
        "lng": 2.22904
      },
      {
        "lat": 41.563584,
        "lng": 2.229054
      },
      {
        "lat": 41.563611,
        "lng": 2.22907
      },
      {
        "lat": 41.563652,
        "lng": 2.229081
      },
      {
        "lat": 41.563694,
        "lng": 2.229073
      },
      {
        "lat": 41.563731,
        "lng": 2.229046
      },
      {
        "lat": 41.563759,
        "lng": 2.229004
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565323,
        "lng": 2.229146
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565795,
        "lng": 2.229182
      },
      {
        "lat": 41.565831,
        "lng": 2.229088
      },
      {
        "lat": 41.566216,
        "lng": 2.228073
      },
      {
        "lat": 41.565708,
        "lng": 2.227821
      },
      {
        "lat": 41.565186,
        "lng": 2.227563
      },
      {
        "lat": 41.565266,
        "lng": 2.227355
      },
      {
        "lat": 41.565829,
        "lng": 2.22589
      },
      {
        "lat": 41.565563,
        "lng": 2.225715
      },
      {
        "lat": 41.565925,
        "lng": 2.225093
      },
      {
        "lat": 41.56599,
        "lng": 2.224981
      },
      {
        "lat": 41.566007,
        "lng": 2.224987
      },
      {
        "lat": 41.566024,
        "lng": 2.224984
      },
      {
        "lat": 41.56604,
        "lng": 2.224973
      },
      {
        "lat": 41.566052,
        "lng": 2.224956
      },
      {
        "lat": 41.566058,
        "lng": 2.224934
      },
      {
        "lat": 41.566059,
        "lng": 2.224911
      },
      {
        "lat": 41.566054,
        "lng": 2.224889
      },
      {
        "lat": 41.567161,
        "lng": 2.224798
      },
      {
        "lat": 41.567306,
        "lng": 2.22488
      },
      {
        "lat": 41.567314,
        "lng": 2.224907
      },
      {
        "lat": 41.567329,
        "lng": 2.22493
      },
      {
        "lat": 41.567349,
        "lng": 2.224943
      },
      {
        "lat": 41.56737,
        "lng": 2.224947
      },
      {
        "lat": 41.567391,
        "lng": 2.22494
      },
      {
        "lat": 41.56741,
        "lng": 2.224924
      },
      {
        "lat": 41.567518,
        "lng": 2.225189
      },
      {
        "lat": 41.567723,
        "lng": 2.226405
      },
      {
        "lat": 41.567723,
        "lng": 2.226984
      },
      {
        "lat": 41.567659,
        "lng": 2.227585
      },
      {
        "lat": 41.567354,
        "lng": 2.22884
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.569172,
        "lng": 2.231486
      },
      {
        "lat": 41.569283,
        "lng": 2.231672
      },
      {
        "lat": 41.569318,
        "lng": 2.231731
      },
      {
        "lat": 41.569583,
        "lng": 2.232381
      },
      {
        "lat": 41.569688,
        "lng": 2.232633
      },
      {
        "lat": 41.569812,
        "lng": 2.232819
      },
      {
        "lat": 41.569988,
        "lng": 2.232968
      },
      {
        "lat": 41.570168,
        "lng": 2.233083
      },
      {
        "lat": 41.570384,
        "lng": 2.233177
      },
      {
        "lat": 41.570822,
        "lng": 2.233291
      },
      {
        "lat": 41.571104,
        "lng": 2.233409
      },
      {
        "lat": 41.571279,
        "lng": 2.233515
      },
      {
        "lat": 41.571633,
        "lng": 2.233762
      },
      {
        "lat": 41.571673,
        "lng": 2.233793
      },
      {
        "lat": 41.571988,
        "lng": 2.234064
      },
      {
        "lat": 41.572126,
        "lng": 2.234172
      },
      {
        "lat": 41.57229,
        "lng": 2.2343
      },
      {
        "lat": 41.572339,
        "lng": 2.234338
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573629,
        "lng": 2.234155
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.573411,
        "lng": 2.233414
      },
      {
        "lat": 41.573438,
        "lng": 2.233151
      },
      {
        "lat": 41.573579,
        "lng": 2.231799
      },
      {
        "lat": 41.573628,
        "lng": 2.23143
      },
      {
        "lat": 41.573649,
        "lng": 2.231321
      },
      {
        "lat": 41.573711,
        "lng": 2.230998
      },
      {
        "lat": 41.573719,
        "lng": 2.230931
      },
      {
        "lat": 41.574717,
        "lng": 2.231124
      },
      {
        "lat": 41.574671,
        "lng": 2.231531
      },
      {
        "lat": 41.574664,
        "lng": 2.231598
      },
      {
        "lat": 41.574623,
        "lng": 2.231968
      },
      {
        "lat": 41.574613,
        "lng": 2.232059
      },
      {
        "lat": 41.574594,
        "lng": 2.232224
      },
      {
        "lat": 41.574134,
        "lng": 2.232138
      },
      {
        "lat": 41.573975,
        "lng": 2.232108
      },
      {
        "lat": 41.574003,
        "lng": 2.231848
      },
      {
        "lat": 41.574043,
        "lng": 2.23148
      },
      {
        "lat": 41.573628,
        "lng": 2.23143
      },
      {
        "lat": 41.573649,
        "lng": 2.231321
      },
      {
        "lat": 41.572441,
        "lng": 2.231911
      },
      {
        "lat": 41.571246,
        "lng": 2.232513
      },
      {
        "lat": 41.571391,
        "lng": 2.233238
      },
      {
        "lat": 41.570875,
        "lng": 2.233063
      },
      {
        "lat": 41.570189,
        "lng": 2.232931
      },
      {
        "lat": 41.569931,
        "lng": 2.232748
      },
      {
        "lat": 41.569583,
        "lng": 2.232381
      },
      {
        "lat": 41.569688,
        "lng": 2.232633
      },
      {
        "lat": 41.569812,
        "lng": 2.232819
      },
      {
        "lat": 41.569988,
        "lng": 2.232968
      },
      {
        "lat": 41.570168,
        "lng": 2.233083
      },
      {
        "lat": 41.570384,
        "lng": 2.233177
      },
      {
        "lat": 41.570822,
        "lng": 2.233291
      },
      {
        "lat": 41.571104,
        "lng": 2.233409
      },
      {
        "lat": 41.571279,
        "lng": 2.233515
      },
      {
        "lat": 41.571633,
        "lng": 2.233762
      },
      {
        "lat": 41.571673,
        "lng": 2.233793
      },
      {
        "lat": 41.571988,
        "lng": 2.234064
      },
      {
        "lat": 41.572126,
        "lng": 2.234172
      },
      {
        "lat": 41.572195,
        "lng": 2.234226
      },
      {
        "lat": 41.57229,
        "lng": 2.2343
      },
      {
        "lat": 41.572339,
        "lng": 2.234338
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572661,
        "lng": 2.234364
      },
      {
        "lat": 41.573076,
        "lng": 2.23408
      },
      {
        "lat": 41.573098,
        "lng": 2.234063
      },
      {
        "lat": 41.573096,
        "lng": 2.23396
      },
      {
        "lat": 41.573085,
        "lng": 2.233918
      },
      {
        "lat": 41.572999,
        "lng": 2.233584
      },
      {
        "lat": 41.572871,
        "lng": 2.233167
      },
      {
        "lat": 41.572846,
        "lng": 2.233087
      },
      {
        "lat": 41.572647,
        "lng": 2.232442
      },
      {
        "lat": 41.572616,
        "lng": 2.232345
      },
      {
        "lat": 41.572441,
        "lng": 2.231911
      },
      {
        "lat": 41.571246,
        "lng": 2.232513
      },
      {
        "lat": 41.571057,
        "lng": 2.231884
      },
      {
        "lat": 41.570497,
        "lng": 2.232137
      },
      {
        "lat": 41.570333,
        "lng": 2.232129
      },
      {
        "lat": 41.570184,
        "lng": 2.232071
      },
      {
        "lat": 41.569967,
        "lng": 2.231868
      },
      {
        "lat": 41.569682,
        "lng": 2.231422
      },
      {
        "lat": 41.569596,
        "lng": 2.231337
      },
      {
        "lat": 41.569493,
        "lng": 2.231323
      },
      {
        "lat": 41.56942,
        "lng": 2.231312
      },
      {
        "lat": 41.569338,
        "lng": 2.231332
      },
      {
        "lat": 41.569182,
        "lng": 2.231317
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.566663,
        "lng": 2.22997
      },
      {
        "lat": 41.566598,
        "lng": 2.229915
      },
      {
        "lat": 41.566209,
        "lng": 2.229578
      },
      {
        "lat": 41.566133,
        "lng": 2.22953
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565323,
        "lng": 2.229146
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.563776,
        "lng": 2.228895
      },
      {
        "lat": 41.563763,
        "lng": 2.228841
      },
      {
        "lat": 41.563738,
        "lng": 2.228796
      },
      {
        "lat": 41.563702,
        "lng": 2.228766
      },
      {
        "lat": 41.563661,
        "lng": 2.228754
      },
      {
        "lat": 41.563619,
        "lng": 2.228761
      },
      {
        "lat": 41.563582,
        "lng": 2.228786
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561759,
        "lng": 2.227155
      },
      {
        "lat": 41.561787,
        "lng": 2.226141
      },
      {
        "lat": 41.562064,
        "lng": 2.226072
      },
      {
        "lat": 41.561943,
        "lng": 2.225218
      },
      {
        "lat": 41.561935,
        "lng": 2.22516
      },
      {
        "lat": 41.561846,
        "lng": 2.22446
      },
      {
        "lat": 41.56175,
        "lng": 2.223834
      },
      {
        "lat": 41.561743,
        "lng": 2.223786
      },
      {
        "lat": 41.56163,
        "lng": 2.223057
      },
      {
        "lat": 41.561544,
        "lng": 2.222422
      },
      {
        "lat": 41.561534,
        "lng": 2.222349
      },
      {
        "lat": 41.56144,
        "lng": 2.221655
      },
      {
        "lat": 41.561312,
        "lng": 2.22097
      },
      {
        "lat": 41.560914,
        "lng": 2.219912
      },
      {
        "lat": 41.560894,
        "lng": 2.219858
      },
      {
        "lat": 41.560674,
        "lng": 2.219275
      },
      {
        "lat": 41.560613,
        "lng": 2.219114
      },
      {
        "lat": 41.560589,
        "lng": 2.219062
      },
      {
        "lat": 41.56013,
        "lng": 2.219342
      },
      {
        "lat": 41.559566,
        "lng": 2.219696
      },
      {
        "lat": 41.55879,
        "lng": 2.219745
      },
      {
        "lat": 41.558724,
        "lng": 2.219752
      },
      {
        "lat": 41.558827,
        "lng": 2.220368
      },
      {
        "lat": 41.558839,
        "lng": 2.220439
      },
      {
        "lat": 41.558951,
        "lng": 2.221138
      },
      {
        "lat": 41.559046,
        "lng": 2.221753
      },
      {
        "lat": 41.559045,
        "lng": 2.221844
      },
      {
        "lat": 41.558952,
        "lng": 2.222556
      },
      {
        "lat": 41.55886,
        "lng": 2.223202
      },
      {
        "lat": 41.558855,
        "lng": 2.223263
      },
      {
        "lat": 41.558756,
        "lng": 2.22398
      },
      {
        "lat": 41.558665,
        "lng": 2.224648
      },
      {
        "lat": 41.558659,
        "lng": 2.224696
      },
      {
        "lat": 41.558569,
        "lng": 2.225411
      },
      {
        "lat": 41.558477,
        "lng": 2.226073
      },
      {
        "lat": 41.55847,
        "lng": 2.226125
      },
      {
        "lat": 41.558014,
        "lng": 2.226044
      },
      {
        "lat": 41.557966,
        "lng": 2.22593
      },
      {
        "lat": 41.557916,
        "lng": 2.225882
      },
      {
        "lat": 41.557886,
        "lng": 2.22587
      },
      {
        "lat": 41.557809,
        "lng": 2.225859
      },
      {
        "lat": 41.55772,
        "lng": 2.225858
      },
      {
        "lat": 41.557645,
        "lng": 2.225904
      },
      {
        "lat": 41.557627,
        "lng": 2.225968
      },
      {
        "lat": 41.557612,
        "lng": 2.226147
      },
      {
        "lat": 41.557647,
        "lng": 2.226293
      },
      {
        "lat": 41.557374,
        "lng": 2.226602
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.555959,
        "lng": 2.22726
      },
      {
        "lat": 41.555715,
        "lng": 2.227702
      },
      {
        "lat": 41.555627,
        "lng": 2.227872
      },
      {
        "lat": 41.555402,
        "lng": 2.228313
      },
      {
        "lat": 41.55496,
        "lng": 2.227838
      },
      {
        "lat": 41.554584,
        "lng": 2.22745
      },
      {
        "lat": 41.554205,
        "lng": 2.227054
      },
      {
        "lat": 41.553886,
        "lng": 2.226744
      },
      {
        "lat": 41.553797,
        "lng": 2.226686
      },
      {
        "lat": 41.553235,
        "lng": 2.226005
      },
      {
        "lat": 41.551841,
        "lng": 2.224581
      },
      {
        "lat": 41.551415,
        "lng": 2.224169
      },
      {
        "lat": 41.551207,
        "lng": 2.223988
      },
      {
        "lat": 41.551103,
        "lng": 2.223909
      },
      {
        "lat": 41.550982,
        "lng": 2.223824
      },
      {
        "lat": 41.550723,
        "lng": 2.223669
      },
      {
        "lat": 41.550631,
        "lng": 2.223615
      },
      {
        "lat": 41.550458,
        "lng": 2.223533
      },
      {
        "lat": 41.550226,
        "lng": 2.223444
      },
      {
        "lat": 41.549991,
        "lng": 2.22337
      },
      {
        "lat": 41.549857,
        "lng": 2.223334
      },
      {
        "lat": 41.549741,
        "lng": 2.223315
      },
      {
        "lat": 41.549525,
        "lng": 2.223281
      },
      {
        "lat": 41.54931,
        "lng": 2.223269
      },
      {
        "lat": 41.549132,
        "lng": 2.22326
      },
      {
        "lat": 41.548522,
        "lng": 2.223263
      },
      {
        "lat": 41.547273,
        "lng": 2.223287
      },
      {
        "lat": 41.547139,
        "lng": 2.223298
      },
      {
        "lat": 41.546898,
        "lng": 2.223329
      },
      {
        "lat": 41.546736,
        "lng": 2.223368
      },
      {
        "lat": 41.546222,
        "lng": 2.223505
      },
      {
        "lat": 41.545505,
        "lng": 2.223731
      },
      {
        "lat": 41.545252,
        "lng": 2.223813
      },
      {
        "lat": 41.544592,
        "lng": 2.223944
      },
      {
        "lat": 41.543824,
        "lng": 2.223982
      },
      {
        "lat": 41.543217,
        "lng": 2.223951
      },
      {
        "lat": 41.542734,
        "lng": 2.223862
      },
      {
        "lat": 41.542285,
        "lng": 2.223756
      },
      {
        "lat": 41.54219,
        "lng": 2.223723
      },
      {
        "lat": 41.54177,
        "lng": 2.223581
      },
      {
        "lat": 41.541172,
        "lng": 2.223279
      },
      {
        "lat": 41.540547,
        "lng": 2.222874
      },
      {
        "lat": 41.539172,
        "lng": 2.221835
      },
      {
        "lat": 41.538294,
        "lng": 2.221159
      },
      {
        "lat": 41.537343,
        "lng": 2.220428
      },
      {
        "lat": 41.537265,
        "lng": 2.22033
      },
      {
        "lat": 41.537187,
        "lng": 2.22025
      },
      {
        "lat": 41.536999,
        "lng": 2.2201
      },
      {
        "lat": 41.536823,
        "lng": 2.219954
      },
      {
        "lat": 41.536666,
        "lng": 2.219816
      },
      {
        "lat": 41.53662,
        "lng": 2.219768
      },
      {
        "lat": 41.536575,
        "lng": 2.21971
      },
      {
        "lat": 41.536528,
        "lng": 2.219632
      },
      {
        "lat": 41.536493,
        "lng": 2.219541
      },
      {
        "lat": 41.536473,
        "lng": 2.21945
      },
      {
        "lat": 41.536463,
        "lng": 2.219359
      },
      {
        "lat": 41.536459,
        "lng": 2.219259
      },
      {
        "lat": 41.536475,
        "lng": 2.219147
      },
      {
        "lat": 41.536505,
        "lng": 2.21905
      },
      {
        "lat": 41.536542,
        "lng": 2.218956
      },
      {
        "lat": 41.536622,
        "lng": 2.218805
      },
      {
        "lat": 41.536866,
        "lng": 2.218434
      },
      {
        "lat": 41.537007,
        "lng": 2.218229
      },
      {
        "lat": 41.537024,
        "lng": 2.218208
      },
      {
        "lat": 41.537056,
        "lng": 2.218156
      },
      {
        "lat": 41.537074,
        "lng": 2.218173
      },
      {
        "lat": 41.537112,
        "lng": 2.218191
      },
      {
        "lat": 41.537151,
        "lng": 2.21819
      },
      {
        "lat": 41.537203,
        "lng": 2.218158
      },
      {
        "lat": 41.537229,
        "lng": 2.218118
      },
      {
        "lat": 41.537239,
        "lng": 2.218091
      },
      {
        "lat": 41.537245,
        "lng": 2.218037
      },
      {
        "lat": 41.537243,
        "lng": 2.218007
      },
      {
        "lat": 41.537228,
        "lng": 2.217958
      },
      {
        "lat": 41.537205,
        "lng": 2.217922
      },
      {
        "lat": 41.537163,
        "lng": 2.217892
      },
      {
        "lat": 41.537123,
        "lng": 2.217886
      },
      {
        "lat": 41.537255,
        "lng": 2.2177
      },
      {
        "lat": 41.537784,
        "lng": 2.216955
      },
      {
        "lat": 41.537858,
        "lng": 2.21685
      },
      {
        "lat": 41.538009,
        "lng": 2.216978
      },
      {
        "lat": 41.538089,
        "lng": 2.21702
      },
      {
        "lat": 41.538152,
        "lng": 2.217022
      },
      {
        "lat": 41.538215,
        "lng": 2.216975
      },
      {
        "lat": 41.538225,
        "lng": 2.21684
      },
      {
        "lat": 41.538205,
        "lng": 2.21681
      },
      {
        "lat": 41.538251,
        "lng": 2.216721
      },
      {
        "lat": 41.538531,
        "lng": 2.216065
      },
      {
        "lat": 41.538597,
        "lng": 2.21591
      },
      {
        "lat": 41.538648,
        "lng": 2.215796
      },
      {
        "lat": 41.539067,
        "lng": 2.214863
      },
      {
        "lat": 41.539115,
        "lng": 2.214756
      },
      {
        "lat": 41.539115,
        "lng": 2.214756
      },
      {
        "lat": 41.539042,
        "lng": 2.214707
      },
      {
        "lat": 41.538131,
        "lng": 2.214094
      },
      {
        "lat": 41.537652,
        "lng": 2.213776
      },
      {
        "lat": 41.537528,
        "lng": 2.213702
      },
      {
        "lat": 41.537627,
        "lng": 2.213391
      },
      {
        "lat": 41.537691,
        "lng": 2.21307
      },
      {
        "lat": 41.53773,
        "lng": 2.212892
      },
      {
        "lat": 41.537741,
        "lng": 2.212744
      },
      {
        "lat": 41.53782,
        "lng": 2.2117
      },
      {
        "lat": 41.537822,
        "lng": 2.211682
      },
      {
        "lat": 41.537835,
        "lng": 2.211512
      },
      {
        "lat": 41.537878,
        "lng": 2.211545
      },
      {
        "lat": 41.538144,
        "lng": 2.211747
      },
      {
        "lat": 41.53846,
        "lng": 2.211984
      },
      {
        "lat": 41.538749,
        "lng": 2.212199
      },
      {
        "lat": 41.539348,
        "lng": 2.21262
      },
      {
        "lat": 41.539427,
        "lng": 2.212679
      },
      {
        "lat": 41.539511,
        "lng": 2.212741
      },
      {
        "lat": 41.539847,
        "lng": 2.213006
      },
      {
        "lat": 41.539914,
        "lng": 2.213057
      },
      {
        "lat": 41.540107,
        "lng": 2.213206
      },
      {
        "lat": 41.540203,
        "lng": 2.213278
      },
      {
        "lat": 41.540476,
        "lng": 2.213474
      },
      {
        "lat": 41.540529,
        "lng": 2.213512
      },
      {
        "lat": 41.540602,
        "lng": 2.213526
      },
      {
        "lat": 41.540633,
        "lng": 2.2135
      },
      {
        "lat": 41.540682,
        "lng": 2.21346
      }
    ],
    "originalPolyline": [
      {
        "lat": 41.540682,
        "lng": 2.21346
      },
      {
        "lat": 41.540694,
        "lng": 2.213451
      },
      {
        "lat": 41.540756,
        "lng": 2.213446
      },
      {
        "lat": 41.540732,
        "lng": 2.213344
      },
      {
        "lat": 41.540586,
        "lng": 2.213466
      },
      {
        "lat": 41.540529,
        "lng": 2.213512
      },
      {
        "lat": 41.540669,
        "lng": 2.213633
      },
      {
        "lat": 41.540783,
        "lng": 2.213731
      },
      {
        "lat": 41.541378,
        "lng": 2.214186
      },
      {
        "lat": 41.541684,
        "lng": 2.214418
      },
      {
        "lat": 41.541735,
        "lng": 2.214457
      },
      {
        "lat": 41.541715,
        "lng": 2.214533
      },
      {
        "lat": 41.5416,
        "lng": 2.214982
      },
      {
        "lat": 41.541519,
        "lng": 2.215303
      },
      {
        "lat": 41.541505,
        "lng": 2.215358
      },
      {
        "lat": 41.541487,
        "lng": 2.215412
      },
      {
        "lat": 41.541289,
        "lng": 2.216009
      },
      {
        "lat": 41.540909,
        "lng": 2.216693
      },
      {
        "lat": 41.540901,
        "lng": 2.216707
      },
      {
        "lat": 41.540879,
        "lng": 2.216749
      },
      {
        "lat": 41.540854,
        "lng": 2.216795
      },
      {
        "lat": 41.540529,
        "lng": 2.217372
      },
      {
        "lat": 41.540522,
        "lng": 2.217383
      },
      {
        "lat": 41.540491,
        "lng": 2.217438
      },
      {
        "lat": 41.540449,
        "lng": 2.217516
      },
      {
        "lat": 41.54027,
        "lng": 2.217852
      },
      {
        "lat": 41.540252,
        "lng": 2.217888
      },
      {
        "lat": 41.540217,
        "lng": 2.217848
      },
      {
        "lat": 41.539848,
        "lng": 2.217417
      },
      {
        "lat": 41.539497,
        "lng": 2.216987
      },
      {
        "lat": 41.539465,
        "lng": 2.216947
      },
      {
        "lat": 41.539436,
        "lng": 2.216913
      },
      {
        "lat": 41.538902,
        "lng": 2.216272
      },
      {
        "lat": 41.538663,
        "lng": 2.215989
      },
      {
        "lat": 41.538597,
        "lng": 2.21591
      },
      {
        "lat": 41.538648,
        "lng": 2.215796
      },
      {
        "lat": 41.539067,
        "lng": 2.214863
      },
      {
        "lat": 41.539115,
        "lng": 2.214756
      },
      {
        "lat": 41.539115,
        "lng": 2.214756
      },
      {
        "lat": 41.539147,
        "lng": 2.214797
      },
      {
        "lat": 41.539871,
        "lng": 2.216213
      },
      {
        "lat": 41.539891,
        "lng": 2.216251
      },
      {
        "lat": 41.539945,
        "lng": 2.216358
      },
      {
        "lat": 41.540462,
        "lng": 2.217381
      },
      {
        "lat": 41.540491,
        "lng": 2.217438
      },
      {
        "lat": 41.540516,
        "lng": 2.217487
      },
      {
        "lat": 41.541027,
        "lng": 2.218506
      },
      {
        "lat": 41.541051,
        "lng": 2.218553
      },
      {
        "lat": 41.541083,
        "lng": 2.218633
      },
      {
        "lat": 41.541028,
        "lng": 2.218718
      },
      {
        "lat": 41.541009,
        "lng": 2.218804
      },
      {
        "lat": 41.541024,
        "lng": 2.218928
      },
      {
        "lat": 41.541046,
        "lng": 2.218965
      },
      {
        "lat": 41.541097,
        "lng": 2.219026
      },
      {
        "lat": 41.541115,
        "lng": 2.219035
      },
      {
        "lat": 41.541188,
        "lng": 2.219052
      },
      {
        "lat": 41.541264,
        "lng": 2.219023
      },
      {
        "lat": 41.541313,
        "lng": 2.21897
      },
      {
        "lat": 41.541316,
        "lng": 2.218961
      },
      {
        "lat": 41.541416,
        "lng": 2.218991
      },
      {
        "lat": 41.541993,
        "lng": 2.219166
      },
      {
        "lat": 41.542198,
        "lng": 2.219228
      },
      {
        "lat": 41.542234,
        "lng": 2.219239
      },
      {
        "lat": 41.542335,
        "lng": 2.219274
      },
      {
        "lat": 41.542741,
        "lng": 2.219422
      },
      {
        "lat": 41.54281,
        "lng": 2.219474
      },
      {
        "lat": 41.542882,
        "lng": 2.219528
      },
      {
        "lat": 41.543029,
        "lng": 2.219642
      },
      {
        "lat": 41.543736,
        "lng": 2.220189
      },
      {
        "lat": 41.543904,
        "lng": 2.220294
      },
      {
        "lat": 41.544143,
        "lng": 2.220442
      },
      {
        "lat": 41.544352,
        "lng": 2.220534
      },
      {
        "lat": 41.544537,
        "lng": 2.220625
      },
      {
        "lat": 41.544542,
        "lng": 2.220686
      },
      {
        "lat": 41.544561,
        "lng": 2.220743
      },
      {
        "lat": 41.544592,
        "lng": 2.220789
      },
      {
        "lat": 41.544631,
        "lng": 2.220821
      },
      {
        "lat": 41.544676,
        "lng": 2.220835
      },
      {
        "lat": 41.544721,
        "lng": 2.220831
      },
      {
        "lat": 41.544764,
        "lng": 2.220809
      },
      {
        "lat": 41.544806,
        "lng": 2.22076
      },
      {
        "lat": 41.544901,
        "lng": 2.220853
      },
      {
        "lat": 41.544967,
        "lng": 2.220917
      },
      {
        "lat": 41.544993,
        "lng": 2.220944
      },
      {
        "lat": 41.545614,
        "lng": 2.221569
      },
      {
        "lat": 41.545661,
        "lng": 2.221617
      },
      {
        "lat": 41.545693,
        "lng": 2.221649
      },
      {
        "lat": 41.546056,
        "lng": 2.222016
      },
      {
        "lat": 41.546421,
        "lng": 2.222415
      },
      {
        "lat": 41.546559,
        "lng": 2.222581
      },
      {
        "lat": 41.546882,
        "lng": 2.222982
      },
      {
        "lat": 41.547354,
        "lng": 2.223632
      },
      {
        "lat": 41.547628,
        "lng": 2.223838
      },
      {
        "lat": 41.547891,
        "lng": 2.223958
      },
      {
        "lat": 41.547927,
        "lng": 2.223975
      },
      {
        "lat": 41.547925,
        "lng": 2.22409
      },
      {
        "lat": 41.547957,
        "lng": 2.224198
      },
      {
        "lat": 41.548019,
        "lng": 2.22428
      },
      {
        "lat": 41.548084,
        "lng": 2.224319
      },
      {
        "lat": 41.548155,
        "lng": 2.224327
      },
      {
        "lat": 41.548225,
        "lng": 2.224303
      },
      {
        "lat": 41.548285,
        "lng": 2.22425
      },
      {
        "lat": 41.548328,
        "lng": 2.224174
      },
      {
        "lat": 41.548348,
        "lng": 2.224104
      },
      {
        "lat": 41.548354,
        "lng": 2.224029
      },
      {
        "lat": 41.548344,
        "lng": 2.223954
      },
      {
        "lat": 41.548402,
        "lng": 2.223842
      },
      {
        "lat": 41.548441,
        "lng": 2.223777
      },
      {
        "lat": 41.548477,
        "lng": 2.223736
      },
      {
        "lat": 41.548537,
        "lng": 2.223685
      },
      {
        "lat": 41.548623,
        "lng": 2.223638
      },
      {
        "lat": 41.548745,
        "lng": 2.2236
      },
      {
        "lat": 41.548859,
        "lng": 2.223576
      },
      {
        "lat": 41.549146,
        "lng": 2.223545
      },
      {
        "lat": 41.549436,
        "lng": 2.223533
      },
      {
        "lat": 41.549677,
        "lng": 2.223533
      },
      {
        "lat": 41.549783,
        "lng": 2.223542
      },
      {
        "lat": 41.549874,
        "lng": 2.223556
      },
      {
        "lat": 41.550051,
        "lng": 2.223586
      },
      {
        "lat": 41.5502,
        "lng": 2.223621
      },
      {
        "lat": 41.55032,
        "lng": 2.22366
      },
      {
        "lat": 41.550595,
        "lng": 2.223717
      },
      {
        "lat": 41.550703,
        "lng": 2.223778
      },
      {
        "lat": 41.550958,
        "lng": 2.223937
      },
      {
        "lat": 41.55116,
        "lng": 2.22409
      },
      {
        "lat": 41.551381,
        "lng": 2.224279
      },
      {
        "lat": 41.551736,
        "lng": 2.22463
      },
      {
        "lat": 41.552459,
        "lng": 2.225355
      },
      {
        "lat": 41.553075,
        "lng": 2.226009
      },
      {
        "lat": 41.553589,
        "lng": 2.226587
      },
      {
        "lat": 41.553744,
        "lng": 2.226783
      },
      {
        "lat": 41.553893,
        "lng": 2.227016
      },
      {
        "lat": 41.554072,
        "lng": 2.227268
      },
      {
        "lat": 41.554442,
        "lng": 2.227698
      },
      {
        "lat": 41.554632,
        "lng": 2.227938
      },
      {
        "lat": 41.554726,
        "lng": 2.228067
      },
      {
        "lat": 41.554751,
        "lng": 2.228121
      },
      {
        "lat": 41.554775,
        "lng": 2.228193
      },
      {
        "lat": 41.554788,
        "lng": 2.228245
      },
      {
        "lat": 41.554794,
        "lng": 2.228322
      },
      {
        "lat": 41.554792,
        "lng": 2.228381
      },
      {
        "lat": 41.554781,
        "lng": 2.228452
      },
      {
        "lat": 41.554741,
        "lng": 2.228564
      },
      {
        "lat": 41.554634,
        "lng": 2.228787
      },
      {
        "lat": 41.55458,
        "lng": 2.228877
      },
      {
        "lat": 41.554515,
        "lng": 2.229007
      },
      {
        "lat": 41.554497,
        "lng": 2.229079
      },
      {
        "lat": 41.554479,
        "lng": 2.229178
      },
      {
        "lat": 41.554484,
        "lng": 2.229269
      },
      {
        "lat": 41.554511,
        "lng": 2.229389
      },
      {
        "lat": 41.554541,
        "lng": 2.229463
      },
      {
        "lat": 41.554592,
        "lng": 2.229528
      },
      {
        "lat": 41.554652,
        "lng": 2.229582
      },
      {
        "lat": 41.554726,
        "lng": 2.229625
      },
      {
        "lat": 41.554912,
        "lng": 2.229664
      },
      {
        "lat": 41.554992,
        "lng": 2.229739
      },
      {
        "lat": 41.555036,
        "lng": 2.229739
      },
      {
        "lat": 41.555065,
        "lng": 2.229732
      },
      {
        "lat": 41.55507,
        "lng": 2.229729
      },
      {
        "lat": 41.555104,
        "lng": 2.229707
      },
      {
        "lat": 41.555136,
        "lng": 2.229484
      },
      {
        "lat": 41.555219,
        "lng": 2.228878
      },
      {
        "lat": 41.555283,
        "lng": 2.228632
      },
      {
        "lat": 41.55533,
        "lng": 2.228488
      },
      {
        "lat": 41.555402,
        "lng": 2.228313
      },
      {
        "lat": 41.555627,
        "lng": 2.227872
      },
      {
        "lat": 41.555715,
        "lng": 2.227702
      },
      {
        "lat": 41.555959,
        "lng": 2.22726
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563536,
        "lng": 2.228882
      },
      {
        "lat": 41.563534,
        "lng": 2.228941
      },
      {
        "lat": 41.563569,
        "lng": 2.22904
      },
      {
        "lat": 41.563584,
        "lng": 2.229054
      },
      {
        "lat": 41.563611,
        "lng": 2.22907
      },
      {
        "lat": 41.563652,
        "lng": 2.229081
      },
      {
        "lat": 41.563694,
        "lng": 2.229073
      },
      {
        "lat": 41.563731,
        "lng": 2.229046
      },
      {
        "lat": 41.563759,
        "lng": 2.229004
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.566133,
        "lng": 2.22953
      },
      {
        "lat": 41.566209,
        "lng": 2.229578
      },
      {
        "lat": 41.566598,
        "lng": 2.229915
      },
      {
        "lat": 41.566663,
        "lng": 2.22997
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.569172,
        "lng": 2.231486
      },
      {
        "lat": 41.569283,
        "lng": 2.231672
      },
      {
        "lat": 41.569318,
        "lng": 2.231731
      },
      {
        "lat": 41.569583,
        "lng": 2.232381
      },
      {
        "lat": 41.569688,
        "lng": 2.232633
      },
      {
        "lat": 41.569812,
        "lng": 2.232819
      },
      {
        "lat": 41.569988,
        "lng": 2.232968
      },
      {
        "lat": 41.570168,
        "lng": 2.233083
      },
      {
        "lat": 41.570384,
        "lng": 2.233177
      },
      {
        "lat": 41.570822,
        "lng": 2.233291
      },
      {
        "lat": 41.571104,
        "lng": 2.233409
      },
      {
        "lat": 41.571279,
        "lng": 2.233515
      },
      {
        "lat": 41.571633,
        "lng": 2.233762
      },
      {
        "lat": 41.571673,
        "lng": 2.233793
      },
      {
        "lat": 41.571988,
        "lng": 2.234064
      },
      {
        "lat": 41.572126,
        "lng": 2.234172
      },
      {
        "lat": 41.57229,
        "lng": 2.2343
      },
      {
        "lat": 41.572339,
        "lng": 2.234338
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573629,
        "lng": 2.234155
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.57363,
        "lng": 2.233748
      },
      {
        "lat": 41.573827,
        "lng": 2.233668
      },
      {
        "lat": 41.573867,
        "lng": 2.233223
      },
      {
        "lat": 41.573958,
        "lng": 2.233242
      },
      {
        "lat": 41.574026,
        "lng": 2.23362
      },
      {
        "lat": 41.573827,
        "lng": 2.233668
      },
      {
        "lat": 41.57363,
        "lng": 2.233748
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572339,
        "lng": 2.234338
      },
      {
        "lat": 41.57229,
        "lng": 2.2343
      },
      {
        "lat": 41.572126,
        "lng": 2.234172
      },
      {
        "lat": 41.571988,
        "lng": 2.234064
      },
      {
        "lat": 41.571673,
        "lng": 2.233793
      },
      {
        "lat": 41.571633,
        "lng": 2.233762
      },
      {
        "lat": 41.571279,
        "lng": 2.233515
      },
      {
        "lat": 41.571104,
        "lng": 2.233409
      },
      {
        "lat": 41.570822,
        "lng": 2.233291
      },
      {
        "lat": 41.570384,
        "lng": 2.233177
      },
      {
        "lat": 41.570168,
        "lng": 2.233083
      },
      {
        "lat": 41.569988,
        "lng": 2.232968
      },
      {
        "lat": 41.569812,
        "lng": 2.232819
      },
      {
        "lat": 41.569688,
        "lng": 2.232633
      },
      {
        "lat": 41.569583,
        "lng": 2.232381
      },
      {
        "lat": 41.569318,
        "lng": 2.231731
      },
      {
        "lat": 41.569283,
        "lng": 2.231672
      },
      {
        "lat": 41.569172,
        "lng": 2.231486
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.566663,
        "lng": 2.22997
      },
      {
        "lat": 41.566598,
        "lng": 2.229915
      },
      {
        "lat": 41.566209,
        "lng": 2.229578
      },
      {
        "lat": 41.566133,
        "lng": 2.22953
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.563776,
        "lng": 2.228895
      },
      {
        "lat": 41.563763,
        "lng": 2.228841
      },
      {
        "lat": 41.563738,
        "lng": 2.228796
      },
      {
        "lat": 41.563702,
        "lng": 2.228766
      },
      {
        "lat": 41.563661,
        "lng": 2.228754
      },
      {
        "lat": 41.563619,
        "lng": 2.228761
      },
      {
        "lat": 41.563582,
        "lng": 2.228786
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.556835,
        "lng": 2.226768
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.556564,
        "lng": 2.227981
      },
      {
        "lat": 41.556295,
        "lng": 2.228441
      },
      {
        "lat": 41.55626,
        "lng": 2.228501
      },
      {
        "lat": 41.555627,
        "lng": 2.227872
      },
      {
        "lat": 41.555715,
        "lng": 2.227702
      },
      {
        "lat": 41.555959,
        "lng": 2.22726
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563536,
        "lng": 2.228882
      },
      {
        "lat": 41.563534,
        "lng": 2.228941
      },
      {
        "lat": 41.563569,
        "lng": 2.22904
      },
      {
        "lat": 41.563584,
        "lng": 2.229054
      },
      {
        "lat": 41.563611,
        "lng": 2.22907
      },
      {
        "lat": 41.563652,
        "lng": 2.229081
      },
      {
        "lat": 41.563694,
        "lng": 2.229073
      },
      {
        "lat": 41.563731,
        "lng": 2.229046
      },
      {
        "lat": 41.563759,
        "lng": 2.229004
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565795,
        "lng": 2.229182
      },
      {
        "lat": 41.565831,
        "lng": 2.229088
      },
      {
        "lat": 41.566216,
        "lng": 2.228073
      },
      {
        "lat": 41.565708,
        "lng": 2.227821
      },
      {
        "lat": 41.565186,
        "lng": 2.227563
      },
      {
        "lat": 41.565266,
        "lng": 2.227355
      },
      {
        "lat": 41.565829,
        "lng": 2.22589
      },
      {
        "lat": 41.565563,
        "lng": 2.225715
      },
      {
        "lat": 41.564652,
        "lng": 2.227279
      },
      {
        "lat": 41.564638,
        "lng": 2.22726
      },
      {
        "lat": 41.564621,
        "lng": 2.227249
      },
      {
        "lat": 41.564602,
        "lng": 2.227246
      },
      {
        "lat": 41.564583,
        "lng": 2.227252
      },
      {
        "lat": 41.564567,
        "lng": 2.227265
      },
      {
        "lat": 41.564554,
        "lng": 2.227285
      },
      {
        "lat": 41.564548,
        "lng": 2.227309
      },
      {
        "lat": 41.564547,
        "lng": 2.227335
      },
      {
        "lat": 41.564553,
        "lng": 2.227359
      },
      {
        "lat": 41.564565,
        "lng": 2.22738
      },
      {
        "lat": 41.56458,
        "lng": 2.227394
      },
      {
        "lat": 41.564337,
        "lng": 2.227845
      },
      {
        "lat": 41.563763,
        "lng": 2.228841
      },
      {
        "lat": 41.563738,
        "lng": 2.228796
      },
      {
        "lat": 41.563702,
        "lng": 2.228766
      },
      {
        "lat": 41.563661,
        "lng": 2.228754
      },
      {
        "lat": 41.563619,
        "lng": 2.228761
      },
      {
        "lat": 41.563582,
        "lng": 2.228786
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.556835,
        "lng": 2.226768
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.556564,
        "lng": 2.227981
      },
      {
        "lat": 41.556295,
        "lng": 2.228441
      },
      {
        "lat": 41.55626,
        "lng": 2.228501
      },
      {
        "lat": 41.555627,
        "lng": 2.227872
      },
      {
        "lat": 41.555715,
        "lng": 2.227702
      },
      {
        "lat": 41.555959,
        "lng": 2.22726
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563536,
        "lng": 2.228882
      },
      {
        "lat": 41.563534,
        "lng": 2.228941
      },
      {
        "lat": 41.563569,
        "lng": 2.22904
      },
      {
        "lat": 41.563584,
        "lng": 2.229054
      },
      {
        "lat": 41.563611,
        "lng": 2.22907
      },
      {
        "lat": 41.563652,
        "lng": 2.229081
      },
      {
        "lat": 41.563694,
        "lng": 2.229073
      },
      {
        "lat": 41.563731,
        "lng": 2.229046
      },
      {
        "lat": 41.563759,
        "lng": 2.229004
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.566133,
        "lng": 2.22953
      },
      {
        "lat": 41.566209,
        "lng": 2.229578
      },
      {
        "lat": 41.566598,
        "lng": 2.229915
      },
      {
        "lat": 41.566663,
        "lng": 2.22997
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.569172,
        "lng": 2.231486
      },
      {
        "lat": 41.569283,
        "lng": 2.231672
      },
      {
        "lat": 41.569318,
        "lng": 2.231731
      },
      {
        "lat": 41.569583,
        "lng": 2.232381
      },
      {
        "lat": 41.569688,
        "lng": 2.232633
      },
      {
        "lat": 41.569812,
        "lng": 2.232819
      },
      {
        "lat": 41.569988,
        "lng": 2.232968
      },
      {
        "lat": 41.570168,
        "lng": 2.233083
      },
      {
        "lat": 41.570384,
        "lng": 2.233177
      },
      {
        "lat": 41.570822,
        "lng": 2.233291
      },
      {
        "lat": 41.571104,
        "lng": 2.233409
      },
      {
        "lat": 41.571279,
        "lng": 2.233515
      },
      {
        "lat": 41.571633,
        "lng": 2.233762
      },
      {
        "lat": 41.571673,
        "lng": 2.233793
      },
      {
        "lat": 41.571988,
        "lng": 2.234064
      },
      {
        "lat": 41.572126,
        "lng": 2.234172
      },
      {
        "lat": 41.57229,
        "lng": 2.2343
      },
      {
        "lat": 41.572339,
        "lng": 2.234338
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.573411,
        "lng": 2.233414
      },
      {
        "lat": 41.573438,
        "lng": 2.233151
      },
      {
        "lat": 41.573579,
        "lng": 2.231799
      },
      {
        "lat": 41.573628,
        "lng": 2.23143
      },
      {
        "lat": 41.573649,
        "lng": 2.231321
      },
      {
        "lat": 41.573711,
        "lng": 2.230998
      },
      {
        "lat": 41.573719,
        "lng": 2.230931
      },
      {
        "lat": 41.574717,
        "lng": 2.231124
      },
      {
        "lat": 41.574671,
        "lng": 2.231531
      },
      {
        "lat": 41.574664,
        "lng": 2.231598
      },
      {
        "lat": 41.574623,
        "lng": 2.231968
      },
      {
        "lat": 41.574613,
        "lng": 2.232059
      },
      {
        "lat": 41.574594,
        "lng": 2.232224
      },
      {
        "lat": 41.574551,
        "lng": 2.232594
      },
      {
        "lat": 41.574538,
        "lng": 2.232724
      },
      {
        "lat": 41.574509,
        "lng": 2.232991
      },
      {
        "lat": 41.574471,
        "lng": 2.233353
      },
      {
        "lat": 41.574463,
        "lng": 2.233432
      },
      {
        "lat": 41.574458,
        "lng": 2.233471
      },
      {
        "lat": 41.574147,
        "lng": 2.233577
      },
      {
        "lat": 41.574076,
        "lng": 2.233601
      },
      {
        "lat": 41.574026,
        "lng": 2.23362
      },
      {
        "lat": 41.573827,
        "lng": 2.233668
      },
      {
        "lat": 41.57363,
        "lng": 2.233748
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572661,
        "lng": 2.234364
      },
      {
        "lat": 41.573076,
        "lng": 2.23408
      },
      {
        "lat": 41.573098,
        "lng": 2.234063
      },
      {
        "lat": 41.573096,
        "lng": 2.23396
      },
      {
        "lat": 41.573085,
        "lng": 2.233918
      },
      {
        "lat": 41.572999,
        "lng": 2.233584
      },
      {
        "lat": 41.572871,
        "lng": 2.233167
      },
      {
        "lat": 41.572647,
        "lng": 2.232442
      },
      {
        "lat": 41.572616,
        "lng": 2.232345
      },
      {
        "lat": 41.573579,
        "lng": 2.231799
      },
      {
        "lat": 41.573628,
        "lng": 2.23143
      },
      {
        "lat": 41.573649,
        "lng": 2.231321
      },
      {
        "lat": 41.573711,
        "lng": 2.230998
      },
      {
        "lat": 41.573719,
        "lng": 2.230931
      },
      {
        "lat": 41.574717,
        "lng": 2.231124
      },
      {
        "lat": 41.574671,
        "lng": 2.231531
      },
      {
        "lat": 41.574664,
        "lng": 2.231598
      },
      {
        "lat": 41.574623,
        "lng": 2.231968
      },
      {
        "lat": 41.574613,
        "lng": 2.232059
      },
      {
        "lat": 41.574594,
        "lng": 2.232224
      },
      {
        "lat": 41.574551,
        "lng": 2.232594
      },
      {
        "lat": 41.574538,
        "lng": 2.232724
      },
      {
        "lat": 41.574509,
        "lng": 2.232991
      },
      {
        "lat": 41.574471,
        "lng": 2.233353
      },
      {
        "lat": 41.574463,
        "lng": 2.233432
      },
      {
        "lat": 41.574458,
        "lng": 2.233471
      },
      {
        "lat": 41.574147,
        "lng": 2.233577
      },
      {
        "lat": 41.574076,
        "lng": 2.233601
      },
      {
        "lat": 41.574026,
        "lng": 2.23362
      },
      {
        "lat": 41.573827,
        "lng": 2.233668
      },
      {
        "lat": 41.57363,
        "lng": 2.233748
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572339,
        "lng": 2.234338
      },
      {
        "lat": 41.57229,
        "lng": 2.2343
      },
      {
        "lat": 41.572195,
        "lng": 2.234226
      },
      {
        "lat": 41.572126,
        "lng": 2.234172
      },
      {
        "lat": 41.571988,
        "lng": 2.234064
      },
      {
        "lat": 41.571673,
        "lng": 2.233793
      },
      {
        "lat": 41.571633,
        "lng": 2.233762
      },
      {
        "lat": 41.571279,
        "lng": 2.233515
      },
      {
        "lat": 41.571104,
        "lng": 2.233409
      },
      {
        "lat": 41.570822,
        "lng": 2.233291
      },
      {
        "lat": 41.570384,
        "lng": 2.233177
      },
      {
        "lat": 41.570168,
        "lng": 2.233083
      },
      {
        "lat": 41.569988,
        "lng": 2.232968
      },
      {
        "lat": 41.569812,
        "lng": 2.232819
      },
      {
        "lat": 41.569688,
        "lng": 2.232633
      },
      {
        "lat": 41.569583,
        "lng": 2.232381
      },
      {
        "lat": 41.569318,
        "lng": 2.231731
      },
      {
        "lat": 41.569283,
        "lng": 2.231672
      },
      {
        "lat": 41.569172,
        "lng": 2.231486
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.566663,
        "lng": 2.22997
      },
      {
        "lat": 41.566598,
        "lng": 2.229915
      },
      {
        "lat": 41.566209,
        "lng": 2.229578
      },
      {
        "lat": 41.566133,
        "lng": 2.22953
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565323,
        "lng": 2.229146
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.563776,
        "lng": 2.228895
      },
      {
        "lat": 41.563763,
        "lng": 2.228841
      },
      {
        "lat": 41.563738,
        "lng": 2.228796
      },
      {
        "lat": 41.563702,
        "lng": 2.228766
      },
      {
        "lat": 41.563661,
        "lng": 2.228754
      },
      {
        "lat": 41.563619,
        "lng": 2.228761
      },
      {
        "lat": 41.563582,
        "lng": 2.228786
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561759,
        "lng": 2.227155
      },
      {
        "lat": 41.561787,
        "lng": 2.226141
      },
      {
        "lat": 41.562064,
        "lng": 2.226072
      },
      {
        "lat": 41.561943,
        "lng": 2.225218
      },
      {
        "lat": 41.561935,
        "lng": 2.22516
      },
      {
        "lat": 41.561846,
        "lng": 2.22446
      },
      {
        "lat": 41.56175,
        "lng": 2.223834
      },
      {
        "lat": 41.561743,
        "lng": 2.223786
      },
      {
        "lat": 41.56163,
        "lng": 2.223057
      },
      {
        "lat": 41.561544,
        "lng": 2.222422
      },
      {
        "lat": 41.561534,
        "lng": 2.222349
      },
      {
        "lat": 41.56144,
        "lng": 2.221655
      },
      {
        "lat": 41.561312,
        "lng": 2.22097
      },
      {
        "lat": 41.560914,
        "lng": 2.219912
      },
      {
        "lat": 41.560894,
        "lng": 2.219858
      },
      {
        "lat": 41.560674,
        "lng": 2.219275
      },
      {
        "lat": 41.560613,
        "lng": 2.219114
      },
      {
        "lat": 41.560589,
        "lng": 2.219062
      },
      {
        "lat": 41.560263,
        "lng": 2.218515
      },
      {
        "lat": 41.560981,
        "lng": 2.218062
      },
      {
        "lat": 41.561185,
        "lng": 2.218694
      },
      {
        "lat": 41.561473,
        "lng": 2.21963
      },
      {
        "lat": 41.561486,
        "lng": 2.219677
      },
      {
        "lat": 41.561875,
        "lng": 2.220932
      },
      {
        "lat": 41.561967,
        "lng": 2.221566
      },
      {
        "lat": 41.561973,
        "lng": 2.221613
      },
      {
        "lat": 41.562064,
        "lng": 2.222306
      },
      {
        "lat": 41.562214,
        "lng": 2.222969
      },
      {
        "lat": 41.562224,
        "lng": 2.223014
      },
      {
        "lat": 41.562408,
        "lng": 2.223709
      },
      {
        "lat": 41.562595,
        "lng": 2.224362
      },
      {
        "lat": 41.562608,
        "lng": 2.224407
      },
      {
        "lat": 41.562786,
        "lng": 2.225106
      },
      {
        "lat": 41.562931,
        "lng": 2.225761
      },
      {
        "lat": 41.563075,
        "lng": 2.225911
      },
      {
        "lat": 41.563212,
        "lng": 2.22589
      },
      {
        "lat": 41.56322,
        "lng": 2.227295
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563536,
        "lng": 2.228882
      },
      {
        "lat": 41.563534,
        "lng": 2.228941
      },
      {
        "lat": 41.563569,
        "lng": 2.22904
      },
      {
        "lat": 41.563584,
        "lng": 2.229054
      },
      {
        "lat": 41.563611,
        "lng": 2.22907
      },
      {
        "lat": 41.563652,
        "lng": 2.229081
      },
      {
        "lat": 41.563694,
        "lng": 2.229073
      },
      {
        "lat": 41.563731,
        "lng": 2.229046
      },
      {
        "lat": 41.563759,
        "lng": 2.229004
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.566133,
        "lng": 2.22953
      },
      {
        "lat": 41.566209,
        "lng": 2.229578
      },
      {
        "lat": 41.566598,
        "lng": 2.229915
      },
      {
        "lat": 41.566663,
        "lng": 2.22997
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.569172,
        "lng": 2.231486
      },
      {
        "lat": 41.569271,
        "lng": 2.231454
      },
      {
        "lat": 41.569427,
        "lng": 2.231387
      },
      {
        "lat": 41.569493,
        "lng": 2.231323
      },
      {
        "lat": 41.569596,
        "lng": 2.231337
      },
      {
        "lat": 41.569682,
        "lng": 2.231422
      },
      {
        "lat": 41.569967,
        "lng": 2.231868
      },
      {
        "lat": 41.570184,
        "lng": 2.232071
      },
      {
        "lat": 41.570333,
        "lng": 2.232129
      },
      {
        "lat": 41.570497,
        "lng": 2.232137
      },
      {
        "lat": 41.571057,
        "lng": 2.231884
      },
      {
        "lat": 41.57174,
        "lng": 2.231554
      },
      {
        "lat": 41.572106,
        "lng": 2.231378
      },
      {
        "lat": 41.573149,
        "lng": 2.230852
      },
      {
        "lat": 41.573528,
        "lng": 2.230928
      },
      {
        "lat": 41.573719,
        "lng": 2.230931
      },
      {
        "lat": 41.574717,
        "lng": 2.231124
      },
      {
        "lat": 41.574671,
        "lng": 2.231531
      },
      {
        "lat": 41.574664,
        "lng": 2.231598
      },
      {
        "lat": 41.574623,
        "lng": 2.231968
      },
      {
        "lat": 41.574613,
        "lng": 2.232059
      },
      {
        "lat": 41.574594,
        "lng": 2.232224
      },
      {
        "lat": 41.574134,
        "lng": 2.232138
      },
      {
        "lat": 41.573975,
        "lng": 2.232108
      },
      {
        "lat": 41.574003,
        "lng": 2.231848
      },
      {
        "lat": 41.574043,
        "lng": 2.23148
      },
      {
        "lat": 41.573628,
        "lng": 2.23143
      },
      {
        "lat": 41.573649,
        "lng": 2.231321
      },
      {
        "lat": 41.573711,
        "lng": 2.230998
      },
      {
        "lat": 41.573719,
        "lng": 2.230931
      },
      {
        "lat": 41.574717,
        "lng": 2.231124
      },
      {
        "lat": 41.574671,
        "lng": 2.231531
      },
      {
        "lat": 41.574664,
        "lng": 2.231598
      },
      {
        "lat": 41.574623,
        "lng": 2.231968
      },
      {
        "lat": 41.574613,
        "lng": 2.232059
      },
      {
        "lat": 41.574594,
        "lng": 2.232224
      },
      {
        "lat": 41.574551,
        "lng": 2.232594
      },
      {
        "lat": 41.574538,
        "lng": 2.232724
      },
      {
        "lat": 41.574509,
        "lng": 2.232991
      },
      {
        "lat": 41.574471,
        "lng": 2.233353
      },
      {
        "lat": 41.574463,
        "lng": 2.233432
      },
      {
        "lat": 41.574458,
        "lng": 2.233471
      },
      {
        "lat": 41.574147,
        "lng": 2.233577
      },
      {
        "lat": 41.574076,
        "lng": 2.233601
      },
      {
        "lat": 41.574026,
        "lng": 2.23362
      },
      {
        "lat": 41.573827,
        "lng": 2.233668
      },
      {
        "lat": 41.57363,
        "lng": 2.233748
      },
      {
        "lat": 41.573537,
        "lng": 2.2338
      },
      {
        "lat": 41.573652,
        "lng": 2.234242
      },
      {
        "lat": 41.573644,
        "lng": 2.234592
      },
      {
        "lat": 41.573589,
        "lng": 2.235103
      },
      {
        "lat": 41.573199,
        "lng": 2.234959
      },
      {
        "lat": 41.573062,
        "lng": 2.234864
      },
      {
        "lat": 41.572809,
        "lng": 2.234689
      },
      {
        "lat": 41.572711,
        "lng": 2.234619
      },
      {
        "lat": 41.572587,
        "lng": 2.234531
      },
      {
        "lat": 41.572509,
        "lng": 2.234468
      },
      {
        "lat": 41.572661,
        "lng": 2.234364
      },
      {
        "lat": 41.573076,
        "lng": 2.23408
      },
      {
        "lat": 41.573098,
        "lng": 2.234063
      },
      {
        "lat": 41.573096,
        "lng": 2.23396
      },
      {
        "lat": 41.573085,
        "lng": 2.233918
      },
      {
        "lat": 41.572999,
        "lng": 2.233584
      },
      {
        "lat": 41.572846,
        "lng": 2.233087
      },
      {
        "lat": 41.572647,
        "lng": 2.232442
      },
      {
        "lat": 41.572616,
        "lng": 2.232345
      },
      {
        "lat": 41.572441,
        "lng": 2.231911
      },
      {
        "lat": 41.571246,
        "lng": 2.232513
      },
      {
        "lat": 41.571057,
        "lng": 2.231884
      },
      {
        "lat": 41.570497,
        "lng": 2.232137
      },
      {
        "lat": 41.570333,
        "lng": 2.232129
      },
      {
        "lat": 41.570184,
        "lng": 2.232071
      },
      {
        "lat": 41.569967,
        "lng": 2.231868
      },
      {
        "lat": 41.569682,
        "lng": 2.231422
      },
      {
        "lat": 41.569596,
        "lng": 2.231337
      },
      {
        "lat": 41.569493,
        "lng": 2.231323
      },
      {
        "lat": 41.56942,
        "lng": 2.231312
      },
      {
        "lat": 41.569338,
        "lng": 2.231332
      },
      {
        "lat": 41.569182,
        "lng": 2.231317
      },
      {
        "lat": 41.569028,
        "lng": 2.231302
      },
      {
        "lat": 41.568884,
        "lng": 2.231202
      },
      {
        "lat": 41.568718,
        "lng": 2.23111
      },
      {
        "lat": 41.568446,
        "lng": 2.230986
      },
      {
        "lat": 41.56821,
        "lng": 2.230869
      },
      {
        "lat": 41.56794,
        "lng": 2.230748
      },
      {
        "lat": 41.567534,
        "lng": 2.230549
      },
      {
        "lat": 41.567266,
        "lng": 2.230431
      },
      {
        "lat": 41.567171,
        "lng": 2.230379
      },
      {
        "lat": 41.566999,
        "lng": 2.23025
      },
      {
        "lat": 41.567354,
        "lng": 2.22884
      },
      {
        "lat": 41.567659,
        "lng": 2.227585
      },
      {
        "lat": 41.567723,
        "lng": 2.226984
      },
      {
        "lat": 41.567723,
        "lng": 2.226405
      },
      {
        "lat": 41.567518,
        "lng": 2.225189
      },
      {
        "lat": 41.56741,
        "lng": 2.224924
      },
      {
        "lat": 41.567418,
        "lng": 2.224912
      },
      {
        "lat": 41.567427,
        "lng": 2.224886
      },
      {
        "lat": 41.567429,
        "lng": 2.224858
      },
      {
        "lat": 41.567424,
        "lng": 2.224829
      },
      {
        "lat": 41.567412,
        "lng": 2.224805
      },
      {
        "lat": 41.567396,
        "lng": 2.224789
      },
      {
        "lat": 41.567375,
        "lng": 2.22478
      },
      {
        "lat": 41.567354,
        "lng": 2.224782
      },
      {
        "lat": 41.567334,
        "lng": 2.224793
      },
      {
        "lat": 41.567312,
        "lng": 2.224823
      },
      {
        "lat": 41.567305,
        "lng": 2.224851
      },
      {
        "lat": 41.567306,
        "lng": 2.22488
      },
      {
        "lat": 41.567161,
        "lng": 2.224798
      },
      {
        "lat": 41.566054,
        "lng": 2.224889
      },
      {
        "lat": 41.566044,
        "lng": 2.22487
      },
      {
        "lat": 41.566029,
        "lng": 2.224858
      },
      {
        "lat": 41.566012,
        "lng": 2.224853
      },
      {
        "lat": 41.565995,
        "lng": 2.224856
      },
      {
        "lat": 41.565979,
        "lng": 2.224866
      },
      {
        "lat": 41.565967,
        "lng": 2.224883
      },
      {
        "lat": 41.565961,
        "lng": 2.224905
      },
      {
        "lat": 41.56596,
        "lng": 2.224928
      },
      {
        "lat": 41.565965,
        "lng": 2.22495
      },
      {
        "lat": 41.565975,
        "lng": 2.224969
      },
      {
        "lat": 41.56599,
        "lng": 2.224981
      },
      {
        "lat": 41.565925,
        "lng": 2.225093
      },
      {
        "lat": 41.565563,
        "lng": 2.225715
      },
      {
        "lat": 41.564652,
        "lng": 2.227279
      },
      {
        "lat": 41.564638,
        "lng": 2.22726
      },
      {
        "lat": 41.564621,
        "lng": 2.227249
      },
      {
        "lat": 41.564602,
        "lng": 2.227246
      },
      {
        "lat": 41.564583,
        "lng": 2.227252
      },
      {
        "lat": 41.564567,
        "lng": 2.227265
      },
      {
        "lat": 41.564554,
        "lng": 2.227285
      },
      {
        "lat": 41.564548,
        "lng": 2.227309
      },
      {
        "lat": 41.564547,
        "lng": 2.227335
      },
      {
        "lat": 41.564553,
        "lng": 2.227359
      },
      {
        "lat": 41.564565,
        "lng": 2.22738
      },
      {
        "lat": 41.56458,
        "lng": 2.227394
      },
      {
        "lat": 41.564337,
        "lng": 2.227845
      },
      {
        "lat": 41.563763,
        "lng": 2.228841
      },
      {
        "lat": 41.563738,
        "lng": 2.228796
      },
      {
        "lat": 41.563702,
        "lng": 2.228766
      },
      {
        "lat": 41.563661,
        "lng": 2.228754
      },
      {
        "lat": 41.563619,
        "lng": 2.228761
      },
      {
        "lat": 41.563582,
        "lng": 2.228786
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561759,
        "lng": 2.227155
      },
      {
        "lat": 41.561306,
        "lng": 2.227155
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.561669,
        "lng": 2.228238
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563536,
        "lng": 2.228882
      },
      {
        "lat": 41.563534,
        "lng": 2.228941
      },
      {
        "lat": 41.563569,
        "lng": 2.22904
      },
      {
        "lat": 41.563584,
        "lng": 2.229054
      },
      {
        "lat": 41.563611,
        "lng": 2.22907
      },
      {
        "lat": 41.563652,
        "lng": 2.229081
      },
      {
        "lat": 41.563694,
        "lng": 2.229073
      },
      {
        "lat": 41.563731,
        "lng": 2.229046
      },
      {
        "lat": 41.563759,
        "lng": 2.229004
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565323,
        "lng": 2.229146
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565795,
        "lng": 2.229182
      },
      {
        "lat": 41.566057,
        "lng": 2.229356
      },
      {
        "lat": 41.566019,
        "lng": 2.229458
      },
      {
        "lat": 41.565753,
        "lng": 2.229291
      },
      {
        "lat": 41.565583,
        "lng": 2.229223
      },
      {
        "lat": 41.565433,
        "lng": 2.229163
      },
      {
        "lat": 41.565267,
        "lng": 2.229138
      },
      {
        "lat": 41.565098,
        "lng": 2.229142
      },
      {
        "lat": 41.564792,
        "lng": 2.229164
      },
      {
        "lat": 41.564722,
        "lng": 2.229169
      },
      {
        "lat": 41.564535,
        "lng": 2.229187
      },
      {
        "lat": 41.564478,
        "lng": 2.229193
      },
      {
        "lat": 41.564265,
        "lng": 2.229149
      },
      {
        "lat": 41.564182,
        "lng": 2.229132
      },
      {
        "lat": 41.564009,
        "lng": 2.229055
      },
      {
        "lat": 41.563775,
        "lng": 2.228951
      },
      {
        "lat": 41.563776,
        "lng": 2.228895
      },
      {
        "lat": 41.563763,
        "lng": 2.228841
      },
      {
        "lat": 41.563738,
        "lng": 2.228796
      },
      {
        "lat": 41.563702,
        "lng": 2.228766
      },
      {
        "lat": 41.563661,
        "lng": 2.228754
      },
      {
        "lat": 41.563619,
        "lng": 2.228761
      },
      {
        "lat": 41.563582,
        "lng": 2.228786
      },
      {
        "lat": 41.563553,
        "lng": 2.228827
      },
      {
        "lat": 41.563457,
        "lng": 2.228791
      },
      {
        "lat": 41.56336,
        "lng": 2.228739
      },
      {
        "lat": 41.56322,
        "lng": 2.228663
      },
      {
        "lat": 41.562946,
        "lng": 2.228599
      },
      {
        "lat": 41.56262,
        "lng": 2.228524
      },
      {
        "lat": 41.562384,
        "lng": 2.228475
      },
      {
        "lat": 41.562305,
        "lng": 2.228459
      },
      {
        "lat": 41.561961,
        "lng": 2.228349
      },
      {
        "lat": 41.56173,
        "lng": 2.228275
      },
      {
        "lat": 41.561527,
        "lng": 2.228152
      },
      {
        "lat": 41.561309,
        "lng": 2.22802
      },
      {
        "lat": 41.560821,
        "lng": 2.227926
      },
      {
        "lat": 41.560718,
        "lng": 2.227925
      },
      {
        "lat": 41.56045,
        "lng": 2.227884
      },
      {
        "lat": 41.56018,
        "lng": 2.2279
      },
      {
        "lat": 41.559766,
        "lng": 2.227982
      },
      {
        "lat": 41.559744,
        "lng": 2.227986
      },
      {
        "lat": 41.558993,
        "lng": 2.228143
      },
      {
        "lat": 41.55865,
        "lng": 2.228101
      },
      {
        "lat": 41.55835,
        "lng": 2.227923
      },
      {
        "lat": 41.55824,
        "lng": 2.227836
      },
      {
        "lat": 41.557314,
        "lng": 2.227123
      },
      {
        "lat": 41.557279,
        "lng": 2.227095
      },
      {
        "lat": 41.557109,
        "lng": 2.226964
      },
      {
        "lat": 41.557086,
        "lng": 2.226946
      },
      {
        "lat": 41.556819,
        "lng": 2.226757
      },
      {
        "lat": 41.556696,
        "lng": 2.226694
      },
      {
        "lat": 41.55662,
        "lng": 2.226689
      },
      {
        "lat": 41.556553,
        "lng": 2.226719
      },
      {
        "lat": 41.556361,
        "lng": 2.226865
      },
      {
        "lat": 41.55632,
        "lng": 2.2269
      },
      {
        "lat": 41.556113,
        "lng": 2.227074
      },
      {
        "lat": 41.555959,
        "lng": 2.22726
      },
      {
        "lat": 41.555715,
        "lng": 2.227702
      },
      {
        "lat": 41.555627,
        "lng": 2.227872
      },
      {
        "lat": 41.555402,
        "lng": 2.228313
      },
      {
        "lat": 41.55496,
        "lng": 2.227838
      },
      {
        "lat": 41.554584,
        "lng": 2.22745
      },
      {
        "lat": 41.554205,
        "lng": 2.227054
      },
      {
        "lat": 41.553886,
        "lng": 2.226744
      },
      {
        "lat": 41.553797,
        "lng": 2.226686
      },
      {
        "lat": 41.553235,
        "lng": 2.226005
      },
      {
        "lat": 41.55307,
        "lng": 2.225778
      },
      {
        "lat": 41.552712,
        "lng": 2.225384
      },
      {
        "lat": 41.552244,
        "lng": 2.224876
      },
      {
        "lat": 41.551928,
        "lng": 2.224516
      },
      {
        "lat": 41.551755,
        "lng": 2.224335
      },
      {
        "lat": 41.551598,
        "lng": 2.2241
      },
      {
        "lat": 41.55147,
        "lng": 2.223967
      },
      {
        "lat": 41.551356,
        "lng": 2.223845
      },
      {
        "lat": 41.551125,
        "lng": 2.223641
      },
      {
        "lat": 41.550893,
        "lng": 2.223471
      },
      {
        "lat": 41.550785,
        "lng": 2.223382
      },
      {
        "lat": 41.550691,
        "lng": 2.223297
      },
      {
        "lat": 41.550632,
        "lng": 2.223215
      },
      {
        "lat": 41.550575,
        "lng": 2.223137
      },
      {
        "lat": 41.550535,
        "lng": 2.223055
      },
      {
        "lat": 41.550516,
        "lng": 2.222971
      },
      {
        "lat": 41.55053,
        "lng": 2.222822
      },
      {
        "lat": 41.550545,
        "lng": 2.22279
      },
      {
        "lat": 41.550557,
        "lng": 2.222756
      },
      {
        "lat": 41.55057,
        "lng": 2.222704
      },
      {
        "lat": 41.550576,
        "lng": 2.222649
      },
      {
        "lat": 41.550576,
        "lng": 2.222595
      },
      {
        "lat": 41.550569,
        "lng": 2.222541
      },
      {
        "lat": 41.55056,
        "lng": 2.222502
      },
      {
        "lat": 41.55054,
        "lng": 2.222447
      },
      {
        "lat": 41.550512,
        "lng": 2.222397
      },
      {
        "lat": 41.550478,
        "lng": 2.222354
      },
      {
        "lat": 41.550439,
        "lng": 2.222321
      },
      {
        "lat": 41.550396,
        "lng": 2.222297
      },
      {
        "lat": 41.55035,
        "lng": 2.222285
      },
      {
        "lat": 41.550304,
        "lng": 2.222283
      },
      {
        "lat": 41.550258,
        "lng": 2.222293
      },
      {
        "lat": 41.550214,
        "lng": 2.222314
      },
      {
        "lat": 41.550174,
        "lng": 2.222345
      },
      {
        "lat": 41.550044,
        "lng": 2.222386
      },
      {
        "lat": 41.549956,
        "lng": 2.22241
      },
      {
        "lat": 41.549881,
        "lng": 2.222423
      },
      {
        "lat": 41.549812,
        "lng": 2.222421
      },
      {
        "lat": 41.54974,
        "lng": 2.222407
      },
      {
        "lat": 41.549633,
        "lng": 2.22238
      },
      {
        "lat": 41.549548,
        "lng": 2.222337
      },
      {
        "lat": 41.549468,
        "lng": 2.222281
      },
      {
        "lat": 41.549373,
        "lng": 2.2222
      },
      {
        "lat": 41.54926,
        "lng": 2.222087
      },
      {
        "lat": 41.549153,
        "lng": 2.221974
      },
      {
        "lat": 41.548856,
        "lng": 2.221655
      },
      {
        "lat": 41.548751,
        "lng": 2.221559
      },
      {
        "lat": 41.54869,
        "lng": 2.22149
      },
      {
        "lat": 41.548636,
        "lng": 2.221413
      },
      {
        "lat": 41.548614,
        "lng": 2.221355
      },
      {
        "lat": 41.548575,
        "lng": 2.221311
      },
      {
        "lat": 41.548551,
        "lng": 2.221295
      },
      {
        "lat": 41.548528,
        "lng": 2.221289
      },
      {
        "lat": 41.548486,
        "lng": 2.22129
      },
      {
        "lat": 41.548352,
        "lng": 2.221154
      },
      {
        "lat": 41.547712,
        "lng": 2.220501
      },
      {
        "lat": 41.54766,
        "lng": 2.220449
      },
      {
        "lat": 41.547583,
        "lng": 2.22037
      },
      {
        "lat": 41.547497,
        "lng": 2.22028
      },
      {
        "lat": 41.547401,
        "lng": 2.220181
      },
      {
        "lat": 41.546979,
        "lng": 2.219757
      },
      {
        "lat": 41.546916,
        "lng": 2.219693
      },
      {
        "lat": 41.546844,
        "lng": 2.219621
      },
      {
        "lat": 41.54678,
        "lng": 2.219555
      },
      {
        "lat": 41.546768,
        "lng": 2.219542
      },
      {
        "lat": 41.545993,
        "lng": 2.218748
      },
      {
        "lat": 41.545962,
        "lng": 2.218716
      },
      {
        "lat": 41.545848,
        "lng": 2.218599
      },
      {
        "lat": 41.545751,
        "lng": 2.218502
      },
      {
        "lat": 41.545211,
        "lng": 2.217964
      },
      {
        "lat": 41.54509,
        "lng": 2.217835
      },
      {
        "lat": 41.545025,
        "lng": 2.217767
      },
      {
        "lat": 41.544617,
        "lng": 2.217328
      },
      {
        "lat": 41.544573,
        "lng": 2.217282
      },
      {
        "lat": 41.544535,
        "lng": 2.217248
      },
      {
        "lat": 41.544422,
        "lng": 2.217148
      },
      {
        "lat": 41.544423,
        "lng": 2.21711
      },
      {
        "lat": 41.544427,
        "lng": 2.217047
      },
      {
        "lat": 41.544405,
        "lng": 2.216968
      },
      {
        "lat": 41.54438,
        "lng": 2.216937
      },
      {
        "lat": 41.544366,
        "lng": 2.21692
      },
      {
        "lat": 41.544308,
        "lng": 2.216898
      },
      {
        "lat": 41.544266,
        "lng": 2.216906
      },
      {
        "lat": 41.544241,
        "lng": 2.21692
      },
      {
        "lat": 41.544209,
        "lng": 2.216947
      },
      {
        "lat": 41.544148,
        "lng": 2.216884
      },
      {
        "lat": 41.543553,
        "lng": 2.216279
      },
      {
        "lat": 41.543136,
        "lng": 2.215865
      },
      {
        "lat": 41.543023,
        "lng": 2.215754
      },
      {
        "lat": 41.542967,
        "lng": 2.215697
      },
      {
        "lat": 41.542548,
        "lng": 2.215275
      },
      {
        "lat": 41.542473,
        "lng": 2.215198
      },
      {
        "lat": 41.541962,
        "lng": 2.214675
      },
      {
        "lat": 41.541735,
        "lng": 2.214457
      },
      {
        "lat": 41.541684,
        "lng": 2.214418
      },
      {
        "lat": 41.541378,
        "lng": 2.214186
      },
      {
        "lat": 41.540783,
        "lng": 2.213731
      },
      {
        "lat": 41.540669,
        "lng": 2.213633
      },
      {
        "lat": 41.540529,
        "lng": 2.213512
      },
      {
        "lat": 41.540602,
        "lng": 2.213526
      },
      {
        "lat": 41.540633,
        "lng": 2.2135
      },
      {
        "lat": 41.540682,
        "lng": 2.21346
      }
    ],
    "savingsKm": 11.8,
    "savingsPercent": 44.4,
    "savingsMinutes": 24.0,
    "scoreImprovement": 66.0,
    "scoreImprovementPercent": 11.6
  },
  "truckZones": [
    {
      "zone": 1,
      "label": "Z1",
      "position": "Puerta / primeras descargas",
      "clients": [
        "Bar 20 PA K"
      ],
      "pallets": 0.88,
      "weightKg": 742.9,
      "returnableStops": 1
    },
    {
      "zone": 2,
      "label": "Z2",
      "position": "Intermedia",
      "clients": [
        "BAR LA ESQUINITA",
        "BAR LOS GALLEGOS"
      ],
      "pallets": 0.31,
      "weightKg": 172.6,
      "returnableStops": 2
    },
    {
      "zone": 3,
      "label": "Z3",
      "position": "Intermedia",
      "clients": [
        "BAR LAS COLUMNAS",
        "Bar Restaurant Tres Roses"
      ],
      "pallets": 0.29,
      "weightKg": 242.3,
      "returnableStops": 2
    },
    {
      "zone": 4,
      "label": "Z4",
      "position": "Intermedia",
      "clients": [
        "LA PERGOLA",
        "SUPER NABILA PARETS"
      ],
      "pallets": 0.48,
      "weightKg": 453.5,
      "returnableStops": 2
    },
    {
      "zone": 5,
      "label": "Z5",
      "position": "Intermedia",
      "clients": [
        "VERMUTERIA Y TAPERIA CAMACHO",
        "BAR FRANKFURT INSBRUCK"
      ],
      "pallets": 1.81,
      "weightKg": 1147.4,
      "returnableStops": 2
    },
    {
      "zone": 6,
      "label": "Z6",
      "position": "Intermedia",
      "clients": [
        "PASTISSERIA JOAN",
        "COREFO (BAR)"
      ],
      "pallets": 0.21,
      "weightKg": 167.1,
      "returnableStops": 1
    },
    {
      "zone": 7,
      "label": "Z7",
      "position": "Intermedia",
      "clients": [
        "LA NORIA BAKERY",
        "BONATAPA"
      ],
      "pallets": 0.4,
      "weightKg": 244.1,
      "returnableStops": 1
    },
    {
      "zone": 8,
      "label": "Z8",
      "position": "Frontal / últimas descargas",
      "clients": [
        "THE JOSE'S BAR PARETS",
        "BAR FUTBOL LOURDES"
      ],
      "pallets": 1.07,
      "weightKg": 371.5,
      "returnableStops": 1
    }
  ],
  "algorithm": [
    "Tabla maestra filtrada por fecha, transporte y ruta real.",
    "Peso/volumen desde ZM040 por material y unidad; si falta la unidad se prorratea desde PAL.",
    "Coordenadas por dirección; fallback local por municipio si no hay geocoding.",
    "Matriz de carretera OSRM; fallback Haversine x1.32.",
    "Función objetivo operativa: conducción + descarga + esperas + retrasos + prioridad + fricción de carga + coste de km.",
    "Descarga estimada por líneas, palets, peso, retornables y variedad de producto.",
    "Prioridad inferida por horario, retornables, carga alta, peso alto y muchas líneas porque no hay una columna de prioridad explícita.",
    "Búsqueda: rutas iniciales por cercanía, coste incremental y prioridad; mejora local con 2-opt, swaps y recolocaciones.",
    "Carga por zonas: primeras paradas cerca de la puerta y últimas paradas hacia el frontal."
  ]
} as const
