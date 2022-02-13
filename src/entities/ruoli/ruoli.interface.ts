import { Document } from 'mongoose';

export default interface IRuoli extends Document {
  descrizione: string;
  visualizzaArmadi: boolean;
  modificaArmadi: boolean;
  creaArmadi: boolean;
}
