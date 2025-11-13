import api from './axiosInstance';

export const getPeriods = () => api.get('/accounting/periods');
export const getPeriod = (id) => api.get(`/accounting/periods/${id}`);
export const createPeriod = (payload) => api.post('/accounting/periods', payload);
export const updatePeriod = (id, payload) => api.put(`/accounting/periods/${id}`, payload);
export const deletePeriod = (id) => api.delete(`/accounting/periods/${id}`);

// Special period actions
export const validatePeriod = (id) => api.post(`/accounting/periods/${id}/validate`);
export const calculatePeriod = (id) => api.post(`/accounting/periods/${id}/calculate`);
export const lockPeriod = (id) => api.post(`/accounting/periods/${id}/lock`);
export const changeStatus = (id, status) => api.patch(`/accounting/periods/${id}/status`, { status });