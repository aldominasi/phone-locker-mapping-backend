import { model, Schema } from 'mongoose';
import IArmadi from './armadi.interface';

const armadiSchema: Schema = new Schema<IArmadi>({
  centrale: {
    type: String,
    required: true
  },
  progressivo: {
    type: Number,
    required: true
  },
  zona: {
    info1: {
      type: String,
      required: true
    },
    info2: {
      type: String,
      required: true
    }
  },
  tipoArmadio: {
    type: String,
    required: true
  },
  indirizzo: {
    type: String,
    required: true
  },
  nota: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default model<IArmadi>('armadi', armadiSchema);

