import { Document } from 'mongoose';

export interface IPermessi {
  readUtenti: boolean;
  writeUtenti: boolean;
  readArmadi: boolean;
  writeArmadi: boolean;
}

export default interface IUtenti extends Document {
  email: string;
  password: string;
  modPwdData: Date;
  numeroCellulare: string;
  nome: string;
  cognome: string;
  ruolo: string;
  permessi: IPermessi;
  createdAt: Date;
  updatedAt: Date;
}
