import S from 'fluent-json-schema';
import responseApiSerialization from './responseApi.serialization';

const armadio = S.object()
  .prop('_id', S.string())
  .prop('centrale', S.string())
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

export const responseArmadio = responseApiSerialization
  .prop('data', armadio).raw({ nullable: true });

export const responsePagination = responseApiSerialization
  .prop('data', S.object()
    .prop('documentiTotali', S.integer())
    .prop('pagina', S.integer())
    .prop('documentiPagina', S.integer())
    .prop('armadi', S.array().items(armadio))
  ).raw({ nullable: true });
