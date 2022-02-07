import { Document } from 'mongoose';

export default interface IArmadi extends Document {
  centrale: string;
  progressivo: number;
  zona: {
    info1: string;
    info2: string;
  };
  tipoArmadio: string;
  indirizzo: string;
}
