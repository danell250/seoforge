export function responseBodyIsUnavailable(response: Response): boolean {
  return response.body === null;
}
