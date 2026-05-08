export async function getCorpToken(_input: unknown, systemVar: any) {
  return {
    access_token: systemVar?.tool?.accessToken ?? systemVar?.tool?.token ?? '',
    expires_in: 7200
  };
}
