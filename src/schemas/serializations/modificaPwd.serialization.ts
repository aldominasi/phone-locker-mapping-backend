import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

export default ResponseApiSerialization
  .prop('data', S.string()).raw({ nullable: true });
