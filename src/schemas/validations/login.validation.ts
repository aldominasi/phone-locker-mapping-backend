import S from 'fluent-json-schema';

export const bodyLogin = S.object()
  .prop('email', S.string().required())
  .prop('password', S.string().required());
