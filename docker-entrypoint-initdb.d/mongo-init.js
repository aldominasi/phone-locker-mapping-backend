print('Start #################################################################');

db = db.getSiblingDB('plmdb');
db.createUser(
  {
    user: 'userplmdb',
    pwd: 'aSlf04EtGf1jdFF2GGa',
    roles: [{ role: 'readWrite', db: 'plmdb' }],
  },
);
db.createCollection('utentis');

print('END #################################################################');
