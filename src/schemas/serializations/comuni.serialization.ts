import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const comune = S.object()
  .prop('nome', S.string())
  .prop('codice', S.string());

export default ResponseApiSerialization.prop('data', S.array().items(comune)).raw({ nullable: true });

