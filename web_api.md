# Web API – Service Control Plane

Base URL: http://127.0.0.1:{api_port}/v1

---

## GET /services/recommended

Returns a curated list of known-good service templates.

Response:
ServiceProfile[]

---

## POST /services/configure

Configure or update a service profile.
Does NOT start the service.

Body:
ServiceProfile

---

## POST /services/start

Start a service instance on a user-selected port.

Body:
{
"service_id": "libretranslate",
"port": 6001,
"env": { "LT_LOAD_ONLY": "en,ko" }
}

Response:
{
"instance_id": "svc-abc123",
"addr": "127.0.0.1:6001"
}

---

## POST /services/stop

Stop a running service instance.

Body:
{
"instance_id": "svc-abc123"
}

---

## GET /stats

Returns per-service runtime stats.

Response:
{
"services": [
{
"instance_id": "svc-abc123",
"port": 6001,
"requests": 1023,
"errors": 2,
"uptime_sec": 3600
}
]
}

---

## POST /translate

LibreTranslate-compatible proxy endpoint.
Routes to an available translation service.

Body:
LibreTranslate JSON

---

## POST /ban

Ban a peer or service endpoint.

Body:
{
"addr": "ip:port"
}
