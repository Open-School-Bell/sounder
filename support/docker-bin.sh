#!/bin/bash

CID=$(docker ps --filter "name=sounder" --format "{{.ID}}")
if [ "$CID" = "" ];
then
        echo "Sounder is not running. Launch your sounder in docker first"
        exit 1
fi

docker exec $CID node ./lib/bin.js $@