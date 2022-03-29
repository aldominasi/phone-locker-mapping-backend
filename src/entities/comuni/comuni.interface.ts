export default interface IComuni {
  nome: string; // Nome del comune
  codice: string; // Codice istat
  zona: { // Ripartizione geografica
    nome: string;
    codice: string;
  };
  regione: { // Regione
    nome: string;
    codice: string;
  };
  provincia: { // Provincia
    nome: string;
    codice: string;
  };
  sigla: string; // Sigla automobilistica
  codiceCatastale: string; // Codice catastale del comune
  cap: string[]; // Codici di avviamento postale
  popolazione: number; // Numero della popolazione relativo al 2011
}
