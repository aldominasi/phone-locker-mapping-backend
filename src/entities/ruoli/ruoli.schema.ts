import { model, Schema } from 'mongoose';
import IRuoli from './ruoli.interface';

const ruoliSchema: Schema = new Schema<IRuoli>({
  descrizione: {
    type: String,
    required: true
  },
  visualizzaArmadi: {
    type: Boolean,
    default: false
  },
  modificaArmadi: {
    type: Boolean,
    default: false
  },
  creaArmadi: {
    type: Boolean,
    default: false
  }
});

export default model<IRuoli>('ruoli', ruoliSchema);
