import S from 'fluent-json-schema';

export const bodyVal = S.object()
  .prop('centrale', S.object()
    .prop('codice', S.string().required())
    .prop('nome', S.string().required())
  )
  .prop('progressivo', S.number().required())
  .prop('zona',
    S.object()
      .prop('info1', S.string().required())
      .prop('info2', S.string().required())
  )
  .prop('tipoArmadio', S.string().required())
  .prop('indirizzo', S.string().required())
  .prop('nota', S.string().required());

export const queryVal = S.object()
  .prop('token', S.string().required());
