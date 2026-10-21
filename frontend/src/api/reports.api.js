import axiosClient from './axiosClient';

export const reportsApi = {
  getVulnerabilityReport: (id, format = 'pdf') =>
    axiosClient.get(`/reports/vulnerability/${id}`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob',
    }),

  getSummaryReport: (params = {}, format = 'pdf') =>
    axiosClient.get('/reports/summary', {
      params: { ...params, format },
      responseType: 'blob',
    }),

  getSlaReport: (format = 'pdf') =>
    axiosClient.get('/reports/sla', {
      params: { format },
      responseType: 'blob',
    }),
};

/**
 * Trigger browser file download from Blob
 * @param {Blob|Object} data 
 * @param {string} filename 
 */
export const triggerDownload = (data, filename) => {
  let blob;
  if (data instanceof Blob) {
    blob = data;
  } else if (typeof data === 'string') {
    blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  } else {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
