import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { TripsView } from './views/TripsView';
import { TripDetailView } from './views/TripDetailView';
import { ReviewQueueView } from './views/ReviewQueueView';
import { ExpensesView } from './views/ExpensesView';
import { AnomaliesView } from './views/AnomaliesView';
import { PolicyConfigView } from './views/PolicyConfigView';
import { AuditLogView } from './views/AuditLogView';
import { api } from './services/api';
import { Trip, Expense, SuprocProject, DashboardSummary, AuditEvent } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<SuprocProject[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [summaryData, tripsData, expensesData, projectsData, auditData] = await Promise.all([
        api.getDashboardSummary(),
        api.getTrips(),
        api.getExpenses(),
        api.getProjects(),
        api.getAuditEvents()
      ]);
      setDashboardSummary(summaryData);
      setTrips(tripsData);
      setExpenses(expensesData);
      setProjects(projectsData);
      setAuditEvents(auditData);
    } catch (err) {
      console.error('Failed to load TripProof data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      await api.resetDemoSeed();
      await fetchAllData();
      setActiveTab('dashboard');
      setSelectedTripId(null);
      setSelectedExpenseId(null);
    } catch (err) {
      console.error('Demo reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateExpense = async (id: string, payload: any) => {
    const updated = await api.updateExpense(id, payload);
    setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    const newSummary = await api.getDashboardSummary();
    setDashboardSummary(newSummary);
    return updated;
  };

  const handleApproveExpense = async (id: string, notes?: string) => {
    await api.approveExpense(id, notes);
    await fetchAllData();
  };

  const handleRejectExpense = async (id: string, reason?: string) => {
    await api.rejectExpense(id, reason);
    await fetchAllData();
  };

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setActiveTab('trip-detail');
  };

  const handleSelectExpenseForAudit = (expId: string) => {
    setSelectedExpenseId(expId);
    setActiveTab('review');
  };

  const pendingReviewCount = expenses.filter(e => e.validation_status === 'NEEDS_REVIEW').length;
  const anomalyCount = expenses.filter(e => e.duplicate_status !== 'CLEAN' || e.policy_status === 'VIOLATION').length;

  const currentTrip = trips.find(t => t.id === selectedTripId) || trips[0];
  const currentProject = projects.find(p => p.id === currentTrip?.project_id) || projects[0] || null;
  const currentTripExpenses = expenses.filter(e => e.trip_id === (selectedTripId || currentTrip?.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onResetDemo={handleResetDemo}
        onUploadSuccess={fetchAllData}
        isLoading={isLoading}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab !== 'review') setSelectedExpenseId(null);
            if (tab !== 'trip-detail') setSelectedTripId(null);
          }}
          reviewCount={pendingReviewCount}
          anomalyCount={anomalyCount}
        />

        {/* Center Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              summary={dashboardSummary}
              expenses={expenses}
              trips={trips}
              onNavigate={(tab, tripId) => {
                if (tripId) {
                  setSelectedTripId(tripId);
                  setActiveTab('trip-detail');
                } else {
                  setActiveTab(tab);
                }
              }}
            />
          )}

          {activeTab === 'trips' && (
            <TripsView
              trips={trips}
              onSelectTrip={handleSelectTrip}
            />
          )}

          {activeTab === 'trip-detail' && currentTrip && (
            <TripDetailView
              trip={currentTrip}
              project={currentProject}
              expenses={currentTripExpenses}
              onBack={() => setActiveTab('trips')}
              onSelectExpense={handleSelectExpenseForAudit}
            />
          )}

          {activeTab === 'review' && (
            <ReviewQueueView
              expenses={expenses}
              onUpdateExpense={handleUpdateExpense}
              onApproveExpense={handleApproveExpense}
              onRejectExpense={handleRejectExpense}
              selectedExpenseId={selectedExpenseId}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              onSelectExpense={handleSelectExpenseForAudit}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomaliesView
              expenses={expenses}
              onSelectExpense={handleSelectExpenseForAudit}
              onRejectExpense={handleRejectExpense}
            />
          )}

          {activeTab === 'policies' && (
            <PolicyConfigView />
          )}

          {activeTab === 'audit' && (
            <AuditLogView events={auditEvents} />
          )}
        </main>
      </div>
    </div>
  );
};
