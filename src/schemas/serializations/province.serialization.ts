import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const provincia = S.object()
  .prop('codice', S.string())
  .prop('nome', S.string());

export default ResponseApiSerialization
  .prop('data', S.array().items(provincia)).raw({ nullable: true });