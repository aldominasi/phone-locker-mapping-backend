import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const coordinate = S.object()
  .prop('lat', S.number())
  .prop('lng', S.number());

const comune = S.object()
  .prop('nome', S.string())
  .prop('codice', S.string())
  .prop('coordinate', coordinate);

export default ResponseApiSerialization.prop('data', S.array().items(comune)).raw({ nullable: true });

