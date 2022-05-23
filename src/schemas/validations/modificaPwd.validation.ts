import S from 'fluent-json-schema';
import { regexPassword } from '../../utilities/defaultValue';

export const bodyVal = S.object()
  .prop('oldPwd', S.string().required())
  .prop('newPwd', S.string().pattern(regexPassword).required());

export const queryVal = S.object()
  .prop('token', S.string().required());
