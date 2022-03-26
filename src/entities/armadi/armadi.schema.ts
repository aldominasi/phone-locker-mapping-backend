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
      default: ''
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
  localizzazione: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    index: '2dsphere'
  },
  nota: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default model<IArmadi>('armadi', armadiSchema);

