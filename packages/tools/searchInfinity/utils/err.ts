export function getErrText(error: unknown, fallback = 'Unknown error') {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return fallback;
  const value = error as any;
  return (
    value.response?.data?.message ??
    value.response?.data?.error?.message ??
    value.response?.data?.error ??
    value.response?.data ??
    value.message ??
    fallback
  ).toString();
}
