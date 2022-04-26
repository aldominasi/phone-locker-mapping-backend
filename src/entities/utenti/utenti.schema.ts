import { model, Schema } from 'mongoose';
import IUtenti from './utenti.interface';
import { regexEmail } from '../../utilities/defaultValue';

const utentiSchema = new Schema<IUtenti>({
  email: {
    type: String,
    validate: regexEmail,
    required: true,
    lowercase: true
  },
  pwdScaduta: {
    type: Date,
    default: null
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
    required: true,
    uppercase: true
  },
  cognome: {
    type: String,
    required: true,
    uppercase: true
  },
  ruolo: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

export default model<IUtenti>('utenti', utentiSchema);
