import S from 'fluent-json-schema';

export const paramsArmadi = S.object()
  .prop('id', S.string().required());

export const queryArmadi = S.object()
  .prop('page', S.integer().required())
  .prop('limit', S.integer().required());
