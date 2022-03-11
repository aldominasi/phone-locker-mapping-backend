import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const utente = S.object()
  .prop('email', S.string())
  .prop('numeroCellulare', S.string())
  .prop('nome', S.string())
  .prop('cognome', S.string())
  .prop('ruolo', S.string());

export default ResponseApiSerialization
  .prop('data', utente).raw({ nullable: true });
