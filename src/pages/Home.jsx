import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import PageContainer from "../components/layout/PageContainer";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <PageContainer title="Welcome to OceanRe System">
      <div className="card shadow p-4 border-0" style={{ maxWidth: "900px" }}>
        <h4 className="mb-3 text-primary">
          Hello, {user?.name || user?.email}!
        </h4>
        <p>
          <strong>OceanRe</strong> is a full-stack accounting and sales
          management system designed to help streamline financial operations,
          manage customers, generate invoices, and record journal entries with
          ease.
        </p>
        <p>Depending on your role, you have access to specific sections:</p>
        <ul>
          <li>
            <strong>ADMIN:</strong> Access to all sales and accounting sections.
          </li>
          <li>
            <strong>SALESPERSON:</strong> Manage invoices, receipts, and
            customers.
          </li>
          <li>
            <strong>ACCOUNTANT:</strong> Manage accounts, accounting periods,
            and journal entries.
          </li>
        </ul>
        <p className="mt-4">
          Use the navigation bar above to explore the system. This home page
          provides a quick summary of your role and available tools.
        </p>
      </div>
    </PageContainer>
  );
}
