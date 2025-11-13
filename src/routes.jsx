import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleGuard from "./components/common/RoleGuard";

// Auth & Sales pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Invoices from "./pages/Sales/Invoices";
import Receipts from "./pages/Sales/Receipts";
import Customers from "./pages/Sales/Customers";

// Accounting pages
import Accounts from "./pages/Accounting/Accounts";
import Periods from "./pages/Accounting/Periods";
import JournalEntries from "./pages/Accounting/JournalEntries";
import JournalEntryLines from "./pages/Accounting/JournalEntryLines";

export default function RoutesList() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* SALES SECTION */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "SALESPERSON"]}>
              <Invoices />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "SALESPERSON"]}>
              <Receipts />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "SALESPERSON"]}>
              <Customers />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* ACCOUNTING SECTION */}
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "ACCOUNTANT"]}>
              <Accounts />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/periods"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "ACCOUNTANT"]}>
              <Periods />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/journal-entries"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "ACCOUNTANT"]}>
              <JournalEntries />
            </RoleGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/journal-entries/:id/lines"
        element={
          <ProtectedRoute>
            <RoleGuard roles={["ADMIN", "ACCOUNTANT"]}>
              <JournalEntryLines />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
