import S from 'fluent-json-schema';
import ResponseApiSerialization from './responseApi.serialization';

export default ResponseApiSerialization
  .prop('data', S.object()
    .prop('documentiTotali', S.number())
    .prop('pagina', S.number())
    .prop('documentiPagina', S.number())
    .prop('utenti',
      S.array().items(
        S.object()
          .prop('email', S.string())
          .prop('password', S.string())
          .prop('numeroCellulare', S.string())
          .prop('nome', S.string())
          .prop('cognome', S.string())
          .prop('ruolo', S.string())
      )
    )).raw({ nullable: true });
