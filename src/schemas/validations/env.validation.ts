import S from 'fluent-json-schema';

export default S.object()
  .prop('MONGO_INITDB_ROOT_USERNAME', S.string().required())
  .prop('MONGO_INITDB_ROOT_PASSWORD', S.string().required())
  .prop('MONGO_INITDB_DATABASE', S.string().required())
  .prop('PORT_PLM_BACKEND', S.integer())
  .prop('USERNAME_BASIC_AUTH', S.string().required())
  .prop('PASSWORD_BASIC_AUTH', S.string().required())
  .prop('KEY_SESSION', S.string().required())
  .prop('SALT_PWD', S.integer())
  .prop('SEED_JWT_TOKEN', S.string().required());
