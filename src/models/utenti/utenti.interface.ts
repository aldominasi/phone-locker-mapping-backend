import { Document } from 'mongoose';

export default interface IUtenti extends Document {
  email: string;
  password: string;
  numeroCellulare: string;
  nome: string;
  cognome: string;
  //ruolo: string;
}
