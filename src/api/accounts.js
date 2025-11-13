import api from './axiosInstance';

export const getAccounts = () => api.get('/accounting/accounts');
export const getAccount = (id) => api.get(`/accounting/accounts/${id}`);
export const createAccount = (payload) => api.post('/accounting/accounts', payload);
export const updateAccount = (id, payload) => api.put(`/accounting/accounts/${id}`, payload);
export const deleteAccount = (id) => api.delete(`/accounting/accounts/${id}`);