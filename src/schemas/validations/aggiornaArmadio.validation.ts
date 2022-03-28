import S from 'fluent-json-schema';

export const paramsVal = S.object()
  .prop('id', S.string());

export const bodyPatchVal = S.array().items(
  S.object()
    .prop('operation', S.string().enum([
      'replace'
    ]))
    .prop('path', S.string())
    .prop('value', S.anyOf([
      S.string(),
      S.object(),
      S.array()
    ]))
);
