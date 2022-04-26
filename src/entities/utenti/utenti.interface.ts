export default interface IUtenti {
  email: string;
  password: string;
  pwdScaduta: Date | null;
  numeroCellulare: string;
  nome: string;
  cognome: string;
  ruolo: string;
  createdAt: Date;
  updatedAt: Date;
}
