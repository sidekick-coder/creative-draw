#!/bin/sh
envsubst '$GOOGLE_ADSENSE_CLIENT_ID' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.tmp
mv /usr/share/nginx/html/index.tmp /usr/share/nginx/html/index.html

exec nginx -g 'daemon off;'
