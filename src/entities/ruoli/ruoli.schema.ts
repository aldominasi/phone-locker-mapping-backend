import { model, Schema } from 'mongoose';
import { IRuoli, IPermessi } from './ruoli.interface';

const permessiSchema = new Schema<IPermessi>({
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
});

const ruoliSchema = new Schema<IRuoli>({
  _id: {
    type: String,
    required: true,
    uppercase: true
  },
  permessi: permessiSchema
}, {
  timestamps: true
});

export default model<IRuoli>('ruoli', ruoliSchema);
