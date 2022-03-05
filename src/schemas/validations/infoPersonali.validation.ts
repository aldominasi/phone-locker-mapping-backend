import S from 'fluent-json-schema';

export const queryInfoPers = S.object()
  .prop('token', S.string().required());
