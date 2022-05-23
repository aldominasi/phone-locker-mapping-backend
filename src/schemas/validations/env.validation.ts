import S from 'fluent-json-schema';

export default S.object()
  .prop('MONGO_INITDB_ROOT_USERNAME', S.string())
  .prop('MONGO_INITDB_ROOT_PASSWORD', S.string())
  .prop('AUTH_DB', S.string())
  .prop('HOST_PLM', S.string())
  .prop('MONGO_INITDB_DATABASE', S.string().required())
  .prop('PORT_PLM_BACKEND', S.integer())
  .prop('SALT_PWD', S.integer())
  .prop('SEED_JWT_TOKEN', S.string().required())
  .allOf([
    S.ifThen(S.object().prop('DEVELOPMENT', S.anyOf([S.string().maxLength(0), S.null()])),
      S.object()
        .prop('MONGO_INITDB_ROOT_USERNAME', S.string().required())
        .prop('MONGO_INITDB_ROOT_PASSWORD', S.string().required())
        .prop('AUTH_DB', S.string().required())
        .prop('HOST_PLM', S.string().required())
    ),
  ]);

