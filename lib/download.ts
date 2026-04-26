import type { AxiosResponse } from 'axios';

const getFileNameFromDisposition = (disposition?: string | null) => {
  if (!disposition) return null;

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const basicMatch = disposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] || null;
};

export const downloadBlobResponse = (
  response: AxiosResponse<Blob>,
  fallbackFileName: string,
) => {
  const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  const disposition = response.headers['content-disposition'];
  const fileName = getFileNameFromDisposition(disposition) || fallbackFileName;

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};