import S from 'fluent-json-schema';

export default S.object()
  .prop('token', S.string().required())
  .prop('page', S.number().required())
  .prop('limit', S.number().required())
  .prop('email', S.string().format(S.FORMATS.EMAIL))
  .prop('ruolo', S.string());
