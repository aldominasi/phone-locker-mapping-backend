export interface IPermessi {
  readUtenti: boolean;
  writeUtenti: boolean;
  readArmadi: boolean;
  writeArmadi: boolean;
}

export interface IRuoli {
  _id: string;
  permessi: IPermessi
}
