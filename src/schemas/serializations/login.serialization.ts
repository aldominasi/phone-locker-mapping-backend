import S from 'fluent-json-schema';
import responseApiSerialization from './responseApi.serialization';

export const responseLogin = responseApiSerialization
  .prop('data', S.object()
    .prop('auth', S.boolean())
    .prop('token', S.string())).raw({ nullable: true });
