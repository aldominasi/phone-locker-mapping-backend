import { model, Schema } from 'mongoose';
import IUtenti from './utenti.interface';
import { regexEmail } from '../../utilities/defaultValue';
import { DateTime } from 'luxon';

const utentiSchema = new Schema<IUtenti>({
  email: {
    type: String,
    validate: regexEmail,
    required: true
  },
  modPwdData: {
    type: Date,
    default: DateTime.local().toUTC().toJSDate()
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
  },
  ruolo: {
    type: String,
    required: true
  },
}, {
  timestamps: true
});

export default model<IUtenti>('utenti', utentiSchema);
