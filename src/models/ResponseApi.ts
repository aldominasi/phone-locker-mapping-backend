export class ResponseApi {
  readonly data: unknown;
  readonly success: boolean;
  readonly msg: string;
  readonly codError: string | null;
  
  constructor(data: unknown, success = true, msg= 'ok', codError: string | null = null) {
    this.data = data;
    this.success = success;
    this.msg = msg;
    this.codError = codError;
  }
}
