export default interface IUtenti {
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
