import S from 'fluent-json-schema';

export const queryVal = S.object()
  .prop('codice', S.string().required());
