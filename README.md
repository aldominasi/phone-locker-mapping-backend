# Phone locker mapping
Phone locker mapping è una soluzione software per le aziende che operano nel settore delle telecomunicazioni
e che si occupano della manutenzione di reti fisse e mobili.
La soluzione offre la digitalizzazione delle informazioni necessarie. Inoltre offre la possibilità agli
operatori di lavorare in maniera smart utilizzando il proprio dispositivo.  
La soluzione è divisa in due progetti: [front-end](https://github.com/aldominasi/phone-locker-mapping.pwa)
e back-end (questo repository)

## Come eseguire il progetto

Per l'esecuzione del progetto in modalità development:
- Scaricare o clonare il progetto
- Creare le variabili d'ambiente come specificato nella sezione successiva (è possibile inserire le variabili anche nel file `.env` da creare nella cartella principale del progetto) 
- Eseguire il comando `npm install` per installare i package necessari
- Eseguire tramite terminale (dalla root del progetto) il comando `npm start`

## Variabili d'ambiente
`MONGO_INITDB_ROOT_USERNAME` username di accesso al db    

`MONGO_INITDB_ROOT_PASSWORD` password di accesso al db   

`MONGO_INITDB_DATABASE` nome del db utilizzato dalla soluzione

`HOST_DB` host su cui risiede il db (es. 127.0.0.1)

`AUTH_DB` nome del db su cui effettuare l'autenticazione

`HOST_PLM` host o dominio del client

`PORT_PLM_BACKEND` porta di ascolto del progetto

`SEED_JWT_TOKEN` chiave utilizzata per firmare il jsonwebtoken     

`SALT_PWD` numero intero per cifrare la password

`DEVELOPMENT=X` Da inserire come variabile nel caso in cui il db sia senza autenticazione e accettare tutte
le connessioni indifferentemente dal client

# LICENZA
Vedi la [licenza](https://github.com/aldominasi/phone-locker-mapping-backend/blob/main/LICENSE)
