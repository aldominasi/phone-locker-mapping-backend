import { model, Schema } from 'mongoose';
import IUtenti from './utenti.interface';

const utentiSchema = new Schema<IUtenti>({
  email: {
    type: String,
    required: true
  },
  modPwdData: {
    type: Date,
    default: new Date()
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
  permessi: {
    readUtenti: {
      type: Boolean,
      default: false
    },
    writeUtenti: {
      type: Boolean,
      default: false
    },
    readArmadi: {
      type: Boolean,
      default: true
    },
    writeArmadi: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

export default model<IUtenti>('utenti', utentiSchema);
