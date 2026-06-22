#!/bin/bash
echo "=== STEP 1: CURL ==="
curl -v https://mootion.app/simulations/05a53e9c-d217-4836-b48d-84d7fc3d7a57/html 2>&1 | head -n 50

echo -e "\n=== STEP 2: NGINX CONF ==="
docker exec mootion-sahai-nginx-1 cat /etc/nginx/conf.d/default.conf

echo -e "\n=== STEP 3: DOCKER COMPOSE PS ==="
docker compose ps

echo -e "\n=== STEP 4: NGINX LOGS ==="
curl -s https://mootion.app/simulations/05a53e9c-d217-4836-b48d-84d7fc3d7a57/html > /dev/null
docker compose logs nginx --tail 20

echo -e "\n=== STEP 5: WGET FROM NGINX TO BACKEND ==="
docker exec mootion-sahai-nginx-1 wget -S -qO- http://backend:8000/simulations/05a53e9c-d217-4836-b48d-84d7fc3d7a57/html 2>&1
