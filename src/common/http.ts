export const STATUS_OK = 200;
export const STATUS_ACCEPTED = 202;
export const STATUS_BAD_REQUEST = 400;
export const STATUS_UNAUTHORIZED = 401;
export const STATUS_FORBIDDEN = 403;
export const STATUS_NOT_FOUND = 404;
export const STATUS_CONFLICT = 409;
export const STATUS_INTERNAL_SERVER_ERROR = 500;

export default class HttpError {
  message: string;
  statusCode: number;
  silent: boolean;

  constructor(message: string, statusCode: number) {
    if (
      typeof statusCode !== "number" ||
      statusCode < 100 ||
      statusCode > 599
    ) {
      throw new Error("invalid status code value");
    }
    this.message = message;
    this.statusCode = statusCode;
  }
}
