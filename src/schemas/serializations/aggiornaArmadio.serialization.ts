import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

const armadio = S.object()
  .prop('_id', S.string())
  .prop('centrale',
    S.object()
      .prop('codice', S.string())
      .prop('nome', S.string())
  )
  .prop('provincia',
    S.object()
      .prop('codice', S.string())
      .prop('nome', S.string())
  )
  .prop('progressivo', S.integer())
  .prop('zona', S.object()
    .prop('info1', S.string())
    .prop('info2', S.string())
  )
  .prop('tipoArmadio', S.string())
  .prop('indirizzo', S.string())
  .prop('localizzazione', S.object()
    .prop('type', S.string())
    .prop('coordinates', S.array().items(S.number()))
  )
  .prop('nota', S.string().default(''));

export const responseSer = ResponseApiSerialization
  .prop('data', armadio).raw({ nullable: true });
