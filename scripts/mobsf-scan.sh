#!/usr/bin/env bash
# Sube un APK/IPA a MobSF (REST API), genera reportes y falla si el security score
# es menor al umbral o si hay hallazgos de severidad "high".
set -euo pipefail

FILE="${1:?Uso: mobsf-scan.sh <ruta-apk-o-ipa>}"
MOBSF_URL="${MOBSF_URL:-http://localhost:8000}"
API_KEY="${MOBSF_API_KEY:?MOBSF_API_KEY requerido}"
MIN_SCORE="${MOBSF_MIN_SCORE:-60}"
mkdir -p reports

echo "Esperando MobSF..."
for _ in $(seq 1 60); do curl -sf "$MOBSF_URL" >/dev/null && break; sleep 5; done

HASH=$(curl -sf -F "file=@${FILE}" -H "Authorization: ${API_KEY}" "$MOBSF_URL/api/v1/upload" | jq -r .hash)
curl -sf -X POST -H "Authorization: ${API_KEY}" --data "hash=${HASH}" "$MOBSF_URL/api/v1/scan" >/dev/null
curl -sf -X POST -H "Authorization: ${API_KEY}" --data "hash=${HASH}" "$MOBSF_URL/api/v1/report_json" -o reports/mobsf.json
curl -sf -X POST -H "Authorization: ${API_KEY}" --data "hash=${HASH}" "$MOBSF_URL/api/v1/download_pdf" -o reports/mobsf.pdf || true
curl -sf -X POST -H "Authorization: ${API_KEY}" --data "hash=${HASH}" "$MOBSF_URL/api/v1/scorecard" -o reports/scorecard.json

SCORE=$(jq -r '.security_score // 0' reports/scorecard.json)
HIGH=$(jq -r '(.high // []) | length' reports/scorecard.json)
echo "MobSF security score: ${SCORE} (mínimo ${MIN_SCORE}); hallazgos high: ${HIGH}"
if [ "${SCORE}" -lt "${MIN_SCORE}" ] || [ "${HIGH}" -gt 0 ]; then
  echo "::error::El binario no cumple el umbral de seguridad de MobSF"
  exit 1
fi
