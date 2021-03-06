import S from 'fluent-json-schema';

const armadio = S.object()
  .prop('centrale',
    S.object()
      .prop('codice', S.string().required())
      .prop('nome', S.string().required())
  )
  .prop('provincia',
    S.object()
      .prop('codice', S.string().required())
      .prop('nome', S.string().required())
  )
  .prop('progressivo', S.integer().required())
  .prop('zona', S.object()
    .prop('info1', S.string().required())
    .prop('info2', S.string().default(''))
  )
  .prop('tipoArmadio', S.string().required())
  .prop('indirizzo', S.string().required())
  .prop('localizzazione', S.object()
    .prop('type', S.string()).required().enum(['Point'])
    .prop('coordinates', S.array().items(S.number()).minItems(2).maxItems(2))
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
