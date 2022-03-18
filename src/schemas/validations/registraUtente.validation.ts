import S from 'fluent-json-schema';

export const queryVal = S.object()
  .prop('token', S.string().required());

export const bodyVal = S.object()
  .prop('email', S.string().format(S.FORMATS.EMAIL).required())
  .prop('numeroCellulare', S.string().required())
  .prop('nome', S.string().required())
  .prop('cognome', S.string().required())
  .prop('ruolo', S.string().required());
