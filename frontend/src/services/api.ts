import axios from 'axios';
import { Trip, Expense, SuprocProject, DashboardSummary, AuditEvent } from '../types';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  getHealth: () => apiClient.get('/health').then(r => r.data),

  // Dashboard
  getDashboardSummary: (): Promise<DashboardSummary> =>
    apiClient.get('/dashboard/summary').then(r => r.data),

  // Projects
  getProjects: (): Promise<SuprocProject[]> =>
    apiClient.get('/projects').then(r => r.data),

  // Trips
  getTrips: (): Promise<Trip[]> =>
    apiClient.get('/trips').then(r => r.data),
  
  getTripDetails: (tripId: string): Promise<{ trip: Trip; project: SuprocProject; expenses: Expense[]; expense_count: number }> =>
    apiClient.get(`/trips/${tripId}`).then(r => r.data),

  // Expenses
  getExpenses: (params?: { trip_id?: string; validation_status?: string; policy_status?: string; itc_status?: string }): Promise<Expense[]> =>
    apiClient.get('/expenses', { params }).then(r => r.data),

  getExpenseById: (id: string): Promise<Expense> =>
    apiClient.get(`/expenses/${id}`).then(r => r.data),

  updateExpense: (id: string, payload: Partial<Expense> & { notes?: string }): Promise<Expense> =>
    apiClient.patch(`/expenses/${id}`, payload).then(r => r.data),

  approveExpense: (id: string, notes?: string): Promise<{ status: string; message: string }> =>
    apiClient.post(`/expenses/${id}/approve`, null, { params: { notes } }).then(r => r.data),

  rejectExpense: (id: string, reason?: string): Promise<{ status: string; message: string }> => {
    const formData = new FormData();
    formData.append('reason', reason || 'Policy or Duplicate violation');
    return apiClient.post(`/expenses/${id}/reject`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  // Upload Document
  uploadDocument: (file: File, tripId: string = 'trip_coimbatore_audit_2026'): Promise<Expense> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('trip_id', tripId);
    return apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data);
  },

  // Review Queue
  getReviewQueue: (): Promise<Expense[]> =>
    apiClient.get('/review/queue').then(r => r.data),

  // Anomalies
  getAnomalies: (): Promise<{ duplicates: Expense[]; policy_violations: Expense[]; itc_at_risk: Expense[] }> =>
    apiClient.get('/anomalies').then(r => r.data),

  // Audit Events
  getAuditEvents: (): Promise<AuditEvent[]> =>
    apiClient.get('/audit/events').then(r => r.data),

  // Demo Reset
  resetDemoSeed: (): Promise<{ status: string; message: string; scenario_count: number }> =>
    apiClient.post('/demo/reset-seed').then(r => r.data),
};
