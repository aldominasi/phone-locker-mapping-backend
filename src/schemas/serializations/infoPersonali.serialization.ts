import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const permessi = S.object()
  .prop('readUtenti', S.boolean())
  .prop('writeUtenti', S.boolean())
  .prop('readArmadi', S.boolean())
  .prop('writeArmadi', S.boolean());

const utente = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL))
  .prop('numeroCellulare', S.string())
  .prop('nome', S.string())
  .prop('cognome', S.string())
  .prop('ruolo', S.string())
  .prop('permessi', permessi);

export const responseInfoPersonali = ResponseApiSerialization
  .prop('data', utente).raw({ nullable: true });
