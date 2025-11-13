import api from './axiosInstance';

export const getCustomers = () => api.get('/sales/customers');
export const getCustomer = (id) => api.get(`/sales/customers/${id}`);
export const createCustomer = (payload) => api.post('/sales/customers', payload);
export const updateCustomer = (id, payload) => api.put(`/sales/customers/${id}`, payload);
export const deleteCustomer = (id) => api.delete(`/sales/customers/${id}`);