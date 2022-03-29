import { model, Schema } from 'mongoose';
import IComuni from './comuni.interface';

const comuniSchema: Schema = new Schema<IComuni>({
  nome: {
    type: String,
    required: true
  },
  codice: {
    type: String,
    required: true
  },
  zona: {
    nome: { type: String },
    codice: { type: String }
  },
  regione: {
    nome: {
      type: String,
      required: true
    },
    codice: {
      type: String,
      required: true
    }
  },
  provincia: {
    nome: {
      type: String,
      required: true
    },
    codice: {
      type: String,
      required: true
    }
  },
  sigla: {
    type: String,
    required: true
  },
  codiceCatastale: {
    type: String,
    required: true
  },
  cap: {
    type: [String]
  },
  popolazione: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default model<IComuni>('comuni', comuniSchema);
