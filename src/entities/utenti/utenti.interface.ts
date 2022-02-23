import { Document } from 'mongoose';

export default interface IUtenti extends Document {
  email: string;
  password: string;
  modPwdData: Date;
  numeroCellulare: string;
  nome: string;
  cognome: string;
  ruolo: string;
  createdAt: Date;
  updatedAt: Date;
}
