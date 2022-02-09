export class ResponseApi {
  readonly data: unknown;
  readonly success: boolean;
  readonly msg: string;
  readonly codError: number | null;
  
  constructor(data: unknown, success = true, msg= 'ok', codError: number | null = null) {
    this.data = data;
    this.success = success;
    this.msg = msg;
    this.codError = codError;
  }
}
