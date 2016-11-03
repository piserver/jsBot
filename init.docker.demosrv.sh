#!/bin/bash
docker run -d --name jsbot-nginx -p 80:80 -v $(PWD)/public:/usr/share/nginx/html:ro nginx
