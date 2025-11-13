import api from './axiosInstance';

export const getLinesByEntry = (journalEntryId) => api.get(`/accounting/journal-entry-lines/entry/${journalEntryId}`);
export const createLine = (journalEntryId, payload) => api.post(`/accounting/journal-entry-lines/`, payload);
export const deleteLine = (lineId) => api.delete(`/accounting/journal-entry-lines/${lineId}`);