import { model, Schema } from 'mongoose';
import IUtenti from './utenti.interface';

const utentiSchema: Schema = new Schema<IUtenti>({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  numeroCellulare: {
    type: String,
    required: true
  },
  nome: {
    type: String,
    required: true
  },
  cognome: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default model<IUtenti>('utenti', utentiSchema);
