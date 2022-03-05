import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

export const responseInfoPersonali = ResponseApiSerialization
  .prop('data', S.object()
    .prop('email', S.string().format(S.FORMATS.EMAIL))
    .prop('numeroCellulare', S.string())
    .prop('nome', S.string())
    .prop('cognome', S.string())).raw({ nullable: true });
