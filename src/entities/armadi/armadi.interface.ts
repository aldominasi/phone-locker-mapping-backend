export default interface IArmadi {
  centrale: {
    codice: string;
    nome: string;
  };
  provincia: {
    codice: string;
    nome: string;
  };
  progressivo: number;
  zona: {
    info1: string;
    info2: string;
  };
  tipoArmadio: string;
  indirizzo: string;
  localizzazione: {
    type: string;
    coordinates: number[];
  };
  nota: string;
  createdAt: Date;
  updatedAt: Date;
}

