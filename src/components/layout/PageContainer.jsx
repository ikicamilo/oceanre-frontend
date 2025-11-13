import React from 'react';

/**
 * A simple wrapper to ensure full-width desktop layout for all pages.
 * Adds consistent padding and background but no max-width constraint.
 */
export default function PageContainer({ title, children }) {
  return (
    <div
      className="page-container bg-light"
      style={{
        minHeight: 'calc(100vh - 56px)', // leave room for navbar
        width: '100%',
        padding: '2rem 3rem',
      }}
    >
      {title && <h4 className="mb-4 fw-bold">{title}</h4>}
      {children}
    </div>
  );
}
