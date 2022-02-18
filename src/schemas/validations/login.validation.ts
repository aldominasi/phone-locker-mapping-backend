import S from 'fluent-json-schema';

export const bodyLogin = S.object()
  .prop('username', S.string().required())
  .prop('password', S.string().required());
