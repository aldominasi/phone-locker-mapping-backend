import S from 'fluent-json-schema';

export default S.object()
  .prop('success', S.boolean())
  .prop('msg', S.string())
  .prop('codError', S.integer().raw({ nullable: true }));
