# Phone locker mapping
Phone locker mapping is a software solution for telecoms companies and dealing with the maintenance
of fixed and mobile network.

This idea was born out of the need to digitize the information required for the performance of operational
activities and to enable employees to work quickly and easily.

This solution is split into two projects: [front-end](https://github.com/aldominasi/phone-locker-mapping.pwa)
and back-end (this repository)

# Quickstart
1. Create an environment variables that specified in the next section (is possible insert the env variables in `.env` file inside the root dir)
2. Install the required packages
```bash
npm install
```
3. Compile and run the project
```bash
npm start
```

## Environment Variables
`MONGO_INITDB_ROOT_USERNAME` username to access the database 

`MONGO_INITDB_ROOT_PASSWORD` password to access the database   

`MONGO_INITDB_DATABASE` name of database used to this project

`HOST_DB` host of database (ex. 127.0.0.1)

`AUTH_DB` name of authentication database

`HOST_PLM` host or domain of front-end project

`PORT_PLM_BACKEND` listening port

`SEED_JWT_TOKEN` key used to sign the access token     

`SALT_PWD` integer for encrypt password

`DEVELOPMENT=X` insert this variable in case the database is without authentication and accept the connections from any origin

At the first time the software creates the administrator user with the following credentials.
email = admin@admin.com and password = Cambiami1

# Installation
This project requires the installation of NodeJS, Npm and MongoDB

# License
All code is released under the [Apache 2.0](https://github.com/aldominasi/phone-locker-mapping-backend/blob/main/LICENSE) license
