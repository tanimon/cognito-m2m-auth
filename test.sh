#!/usr/bin/env bash

BASE_DIR=$(dirname "$0")

source ${BASE_DIR}/.env
AUTH=$(echo -n ${COGNITO_CLIENT_ID}:${COGNITO_CLIENT_SECRET} | base64)
AUTH_SCOPE='example.com/read'
AUTH_ENDPOINT="${COGNITO_DOMAIN}/oauth2/token"

echo 'Getting the access token...'

TOKEN=$(curl -sX POST \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H "Authorization: Basic ${AUTH}" \
  -d 'grant_type=client_credentials' \
  -d "scope=${AUTH_SCOPE}" \
  ${AUTH_ENDPOINT} \
  | jq -r '.access_token')

echo $'Done.\n'

API_PATH='/hello'
API_URL=${API_ENDPOINT}${API_PATH}

echo 'Access to the API without the token:'
curl ${API_URL}
echo -e '\n'

echo 'Access to the API with the token:'
curl -H "Authorization: Bearer ${TOKEN}" ${API_URL}
