import api from './axiosInstance';

export const getJournalEntries = () => api.get('/accounting/journal-entries');
export const getJournalEntry = (id) => api.get(`/accounting/journal-entries/${id}`);
export const createJournalEntry = (payload) => api.post('/accounting/journal-entries', payload);
export const updateJournalEntry = (id, payload) => api.put(`/accounting/journal-entries/${id}`, payload);
export const deleteJournalEntry = (id) => api.delete(`/accounting/journal-entries/${id}`);