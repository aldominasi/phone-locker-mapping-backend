import S from 'fluent-json-schema';

export const query = S.object()
  .prop('token', S.string().required())
  .prop('page', S.number())
  .prop('limit', S.number());
