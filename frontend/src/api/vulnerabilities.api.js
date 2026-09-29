import axiosClient from './axiosClient';

export const vulnerabilitiesApi = {
  create: (formData) =>
    axiosClient.post('/vulnerabilities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: (params) => axiosClient.get('/vulnerabilities', { params }),
  getVulnerabilities: async (params) => {
    const res = await axiosClient.get('/vulnerabilities', { params });
    const list = res.data?.vulnerabilities || res.data || [];
    return { ...res, data: list };
  },
  getById: (id) => axiosClient.get(`/vulnerabilities/${id}`),
  getVulnerabilityById: (id) => axiosClient.get(`/vulnerabilities/${id}`),
  update: (id, data) => axiosClient.patch(`/vulnerabilities/${id}`, data),
  respondNeedsInfo: (id, responseText) =>
    axiosClient.post(`/vulnerabilities/${id}/respond`, { responseText }),
  validate: (id, result, notes) =>
    axiosClient.post(`/vulnerabilities/${id}/validate`, { result, notes }),
  validateVulnerability: (id, { result, notes }) =>
    axiosClient.post(`/vulnerabilities/${id}/validate`, { result, notes }),
  checkDuplicatesHint: (data) =>
    axiosClient.post('/vulnerabilities/check-duplicates-hint', data),
  recheckDuplicates: (id) =>
    axiosClient.post(`/vulnerabilities/${id}/recheck-duplicates`),
  duplicateResolution: (id, action, originalId) =>
    axiosClient.post(`/vulnerabilities/${id}/duplicate-resolution`, { action, originalId }),
  resolveDuplicate: (id, { resolution, duplicateOf }) =>
    axiosClient.post(`/vulnerabilities/${id}/duplicate-resolution`, { action: resolution, originalId: duplicateOf }),
  classify: (id, classification) =>
    axiosClient.post(`/vulnerabilities/${id}/classify`, classification),
  classifyVulnerability: (id, data) =>
    axiosClient.post(`/vulnerabilities/${id}/classify`, data),
  setCvss: (id, cvssData) =>
    axiosClient.post(`/vulnerabilities/${id}/cvss`, cvssData),
  threatAnalysis: (id) =>
    axiosClient.post(`/vulnerabilities/${id}/threat-analysis`),
  fetchThreatIntel: (id) =>
    axiosClient.post(`/vulnerabilities/${id}/threat-analysis`),
  calculateRisk: (id) =>
    axiosClient.post(`/vulnerabilities/${id}/calculate-risk`),
  assign: (id, assignedTo) =>
    axiosClient.post(`/vulnerabilities/${id}/assign`, { assignedTo }),
  assignVulnerability: (id, assignedTo) =>
    axiosClient.post(`/vulnerabilities/${id}/assign`, { assignedTo }),
  updateStatus: (id, status, notes) =>
    axiosClient.post(`/vulnerabilities/${id}/status`, { status, notes }),
  addRemediationNote: (id, note) =>
    axiosClient.post(`/vulnerabilities/${id}/remediation-notes`, { note }),
  retest: (id, result, notes) =>
    axiosClient.post(`/vulnerabilities/${id}/retest`, { result, notes }),
  retestVulnerability: (id, { result, notes }) =>
    axiosClient.post(`/vulnerabilities/${id}/retest`, { result, notes }),
  getTimeline: (id) => axiosClient.get(`/vulnerabilities/${id}/timeline`),
};
