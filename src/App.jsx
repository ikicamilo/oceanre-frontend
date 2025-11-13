import React, { useContext } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import RoutesList from "./routes";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "bootstrap/dist/css/bootstrap.min.css";

function AppContent() {
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">OceanRe</span>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            {user && (
              <>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {user.role === "ADMIN" || user.role === "SALESPERSON" ? (
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="salesDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Sales
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="salesDropdown"
                      >
                        <li>
                          <a className="dropdown-item" href="/invoices">
                            Invoices
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/receipts">
                            Receipts
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/customers">
                            Customers
                          </a>
                        </li>
                      </ul>
                    </li>
                  ) : null}

                  {user.role === "ADMIN" || user.role === "ACCOUNTANT" ? (
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="acctDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Accounting
                      </a>
                      <ul
                        className="dropdown-menu"
                        aria-labelledby="acctDropdown"
                      >
                        <li>
                          <a className="dropdown-item" href="/accounts">
                            Accounts
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/periods">
                            Periods
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/journal-entries">
                            Journal Entries
                          </a>
                        </li>
                      </ul>
                    </li>
                  ) : null}
                </ul>

                <span className="navbar-text me-3 text-light">
                  {user?.email || user?.name} ({user.role})
                </span>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="container-fluid">
        <RoutesList />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
