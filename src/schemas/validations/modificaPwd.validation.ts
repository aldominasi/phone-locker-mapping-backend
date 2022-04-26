import S from 'fluent-json-schema';
const regexPassword = /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;

export const bodyVal = S.object()
  .prop('oldPwd', S.string().required())
  .prop('newPwd', S.string().pattern(regexPassword).required());

export const queryVal = S.object()
  .prop('token', S.string().required());
