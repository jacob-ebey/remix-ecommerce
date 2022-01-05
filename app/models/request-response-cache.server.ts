export interface RequestResponseCache {
  (request: Request, maxAgeSeconds: number): Promise<Response>;
}
