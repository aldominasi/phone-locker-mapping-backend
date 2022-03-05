import S from 'fluent-json-schema';

export const paramsArmadi = S.object()
  .prop('token', S.string().required())
  .prop('id', S.string().required());

export const queryArmadi = S.object()
  .prop('token', S.string().required())
  .prop('centrale', S.string())
  .prop('page', S.integer().required())
  .prop('limit', S.integer().required());
