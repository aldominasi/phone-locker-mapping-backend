import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const comune = S.object()
  .prop('nome', S.string())
  .prop('codice', S.string())
  .prop('zona', S.object()
    .prop('nome', S.string())
    .prop('codice', S.string())
  )
  .prop('regione', S.object()
    .prop('nome', S.string())
    .prop('codice', S.string())
  )
  .prop('provincia', S.object()
    .prop('nome', S.string())
    .prop('codice', S.string())
  )
  .prop('sigla', S.string())
  .prop('codiceCatastale', S.string())
  .prop('cap', S.string());

export default ResponseApiSerialization.prop('data', S.array().items(comune)).raw({ nullable: true });

