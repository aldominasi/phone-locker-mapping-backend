export default interface IArmadi {
  centrale: string;
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

