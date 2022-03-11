export enum EnumRuoli {
  ADMIN = 'amministratore',
  OPERATORE = 'operatore'
}

export type Ruoli = keyof typeof EnumRuoli;
