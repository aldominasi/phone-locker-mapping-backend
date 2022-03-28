import S from 'fluent-json-schema';

const armadio = S.object()
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

export const paramsVal = S.object()
  .prop('id', S.string());

export const bodyPatchVal = S.array().items(
  S.object()
    .prop('operation', S.string().enum([
      'replace'
    ]))
    .prop('path', S.string())
    .prop('value', S.anyOf([
      S.string(),
      S.object(),
      S.array()
    ]))
);

export const bodyPutVal = armadio;
