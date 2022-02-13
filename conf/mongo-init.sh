#!/usr/bin/env bash

echo "####### START INIT MONGO ########"
#echo "db.createUser({user: '${MONGO_INITDB_ROOT_USERNAME}', pwd: '${MONGO_INITDB_ROOT_PASSWORD}',roles: [{role: 'userAdminAnyDatabase', db: '${MONGO_INITDB_DATABASE}'}]}); use ${MONGO_INITDB_DATABASE};";

#mongo --host localhost -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --eval "db.getSiblingDB('$MONGO_INITDB_DATABASE'); db.createUser({user: '${MONGO_INITDB_USERNAME}', pwd: '${MONGO_INITDB_PASSWORD}',roles: [{role: 'readWrite', db: '${MONGO_INITDB_DATABASE}'}]});"
#echo "UTENTE CREATO"

for input in /app/initCollections/*.json
do
  echo "IMPORT CORRENTE: $input"
  mongoimport --db "$MONGO_INITDB_DATABASE" --authenticationDatabase admin --username root --password password --drop --file "$input" --jsonArray
done

echo "COLLECTIONS CREATE"
echo "######### END INIT MONGO ##########"