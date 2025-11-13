import api from './axiosInstance';

export const getReceipts = () => api.get('/sales/receipts');
export const getReceipt = (id) => api.get(`/sales/receipts/${id}`);
export const createReceipt = (payload) => api.post('/sales/receipts', payload);
export const updateReceipt = (id, payload) => api.put(`/sales/receipts/${id}`, payload);
export const deleteReceipt = (id) => api.delete(`/sales/receipts/${id}`);