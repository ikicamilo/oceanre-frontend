import api from './axiosInstance';
export const getInvoices = () => api.get('/sales/invoices');
export const createInvoice = (payload) => api.post('/sales/invoices', payload);
export const updateInvoice = (id,payload) => api.put(`/sales/invoices/${id}`, payload);
export const deleteInvoice = (id) => api.delete(`/sales/invoices/${id}`);