import S from 'fluent-json-schema';

export const queryArmadio = S.object()
  .prop('token', S.string().required());

export const paramsArmadi = S.object()
  .prop('id', S.string().required());

export const queryArmadi = S.object()
  .prop('token', S.string().required())
  .prop('centrale', S.string())
  .prop('zona', S.string())
  .prop('page', S.integer().required())
  .prop('limit', S.integer().required());
