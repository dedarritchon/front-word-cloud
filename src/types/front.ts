export enum HttpVerbsEnum {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface HttpRelayRequest {
  /** The HTTP verb to use for the request. */
  verb: HttpVerbsEnum;
  /** The path relative to this application. */
  url: string;
  /** The body of the request. */
  body?: unknown;
  /** The header of the request. */
  headers?: unknown;
}

export interface HttpResponse<T> {
  /** HTTP status code */
  status: number;
  /** Body of the response. */
  body: T;
}

export interface ErrorHttpResponseBody {
  status: number;
  message?: string;
  error?: string;
  errorMessages?: unknown;
}

export interface CancelToken {
  // Cancel token interface for request cancellation
  // This is a placeholder for future implementation
  _placeholder?: never;
}

export interface FrontContext {
  authentication: {
    status: 'authorized' | 'unauthorized';
  };
  relayHttp: <T>(
    request: HttpRelayRequest,
    cancelToken?: CancelToken
  ) => Promise<HttpResponse<T>>;
  authenticate: (cancelToken?: CancelToken) => Promise<void>;
  deauthenticate: (cancelToken?: CancelToken) => Promise<void>;
}
