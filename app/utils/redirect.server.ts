export function validateRedirect(
  redirect: string | null | undefined,
  defaultRediret: string
) {
  if (redirect?.startsWith("/") && redirect[1] !== "/") {
    return redirect;
  }

  return defaultRediret;
}
