import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const permessi = S.object()
  .prop('readUtenti', S.boolean())
  .prop('writeUtenti', S.boolean())
  .prop('readArmadi', S.boolean())
  .prop('writeArmadi', S.boolean());

export default ResponseApiSerialization
  .prop('data', S.array().items(
    S.object()
      .prop('_id', S.string())
      .prop('permessi', permessi)
  )).raw({ nullable: true });
