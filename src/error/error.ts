// Structure identical as GeneralErrorResponse
export interface ErrorBody {
  code: number;
  message: string;
}

export interface ErrorResponse {
  status: number;
  headers: object;
  body: ErrorBody;
}
