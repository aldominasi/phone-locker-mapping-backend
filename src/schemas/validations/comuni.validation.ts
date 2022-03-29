import S from 'fluent-json-schema';

export const queryVal = S.object()
  .prop('nome', S.string().minLength(3).required())
  .prop('regione', S.integer().required());
