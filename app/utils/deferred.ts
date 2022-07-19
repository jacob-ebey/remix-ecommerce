type AwaitedPromises<T> = T extends object
  ? {
      [k in keyof T]: Awaited<T[k]>;
    }
  : never;

export function multipleDeferred<Promises extends object>(
  promises: Promises
): Promise<AwaitedPromises<Promises>> {
  let resolutions: Promise<[keyof AwaitedPromises<Promises>, unknown]>[] = [];
  let needsResolution = false;

  for (let [key, value] of Object.entries(promises) as [
    keyof Promises,
    unknown
  ][]) {
    let promise = value as Promise<unknown> | undefined;
    if (promise && typeof promise?.then === "function") {
      needsResolution = true;
      resolutions.push(promise.then((value) => [key, value]));
    }
  }

  if (!needsResolution) {
    return promises as any;
  }

  return (async () => {
    let result = (
      Array.isArray(promises) ? [...promises] : { ...promises }
    ) as AwaitedPromises<Promises>;

    for await (let [key, value] of resolutions) {
      result[key] = (await value) as AwaitedPromises<Promises>[typeof key];
    }

    return result;
  })();
}
