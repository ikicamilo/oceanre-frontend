import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import * as receiptsApi from "../../api/receipts";
import * as usersApi from "../../api/users";
import * as customersApi from "../../api/customers";
import * as invoicesApi from "../../api/invoices";
import * as periodsApi from "../../api/periods";

import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";

const MySwal = withReactContent(Swal);

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    receipt_number: "",
    payment_date: "",
    amount: "",
    currency: "USD",
    customer_id: "",
    invoice_id: "",
    period_id: "",
  });

  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [recRes, usersRes, custRes, invRes, perRes] = await Promise.all([
        receiptsApi.getReceipts(),
        usersApi.getUsers(),
        customersApi.getCustomers(),
        invoicesApi.getInvoices(),
        periodsApi.getPeriods(),
      ]);

      setReceipts(recRes.data || []);
      setUsers(usersRes.data || []);
      setCustomers(custRes.data || []);
      setInvoices(invRes.data || []);
      setPeriods(perRes.data || []);
    } catch (err) {
      MySwal.fire(
        "Error",
        err?.response?.data?.message || err.message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const userName = (id) => users.find((x) => x.id === id)?.name || "-";
  const customerName = (id) => customers.find((x) => x.id === id)?.name || "-";
  const invoiceNumber = (id) =>
    invoices.find((x) => x.id === id)?.invoice_number || "-";

  function openNew() {
    setEditingId(null);
    setForm({
      receipt_number: "",
      payment_date: "",
      amount: "",
      currency: "USD",
      customer_id: "",
      invoice_id: "",
      period_id: "",
    });
    setShowModal(true);
  }

  function openEdit(row) {
    setEditingId(row.id);
    setForm(row);
    setShowModal(true);
  }

  async function save() {
    try {
      if (editingId) await receiptsApi.updateReceipt(editingId, form);
      else await receiptsApi.createReceipt(form);

      MySwal.fire("Saved", "Receipt saved successfully", "success");
      setShowModal(false);
      load();
    } catch (err) {
      MySwal.fire(
        "Error",
        err?.response?.data?.message || err.message,
        "error"
      );
    }
  }

  async function remove(row) {
    MySwal.fire({
      title: `Delete receipt ${row.receipt_number}?`,
      icon: "warning",
      showCancelButton: true,
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await receiptsApi.deleteReceipt(row.id);
          MySwal.fire("Deleted", "Receipt deleted", "success");
          load();
        } catch (err) {
          MySwal.fire(
            "Error",
            err?.response?.data?.message || err.message,
            "error"
          );
        }
      }
    });
  }

  const columns = [
    { name: "Receipt #", selector: (r) => r.receipt_number, sortable: true },
    { name: "Payment Date", selector: (r) => r.payment_date },
    { name: "Amount", selector: (r) => r.amount },
    { name: "Currency", selector: (r) => r.currency },
    {
      name: "Customer",
      selector: (r) => customerName(r.customer_id),
      sortable: true,
    },

    // NEW COLUMN
    {
      name: "Invoice #",
      selector: (r) => invoiceNumber(r.invoice_id),
      sortable: true,
    },

    {
      name: "Period",
      selector: (r) =>
        periods.find((p) => p.id === r.period_id)?.period_name || "-",
    },

    { name: "Created By", selector: (r) => userName(r.created_by) },
    {
      name: "Created At",
      selector: (r) =>
        r.created_at ? new Date(r.created_at).toLocaleString() : "-",
    },
    { name: "Updated By", selector: (r) => userName(r.updated_by) },
    {
      name: "Updated At",
      selector: (r) =>
        r.updated_at ? new Date(r.updated_at).toLocaleString() : "-",
    },

    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            className="btn btn-sm btn-outline-primary me-1"
            onClick={() => openEdit(row)}
          >
            <FaEdit />
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => remove(row)}
          >
            <FaTrash />
          </button>
        </>
      ),
    },
  ];

  const filtered = receipts.filter((d) =>
    Object.values(d).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer title="Receipts">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={openNew}>
          <FaPlus /> New Receipt
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pagination
        striped
        highlightOnHover
        subHeader
        subHeaderAlign="right"
        subHeaderComponent={
          <input
            type="text"
            className="form-control w-auto"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
      />

      {/* Modal */}
      <ModalForm
        show={showModal}
        title={editingId ? "Edit Receipt" : "New Receipt"}
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <input
          className="form-control mb-2"
          placeholder="Receipt #"
          value={form.receipt_number}
          onChange={(e) => setForm({ ...form, receipt_number: e.target.value })}
        />

        <input
          className="form-control mb-2"
          type="date"
          value={form.payment_date}
          onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
        />

        <input
          className="form-control mb-2"
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        {/* CUSTOMER */}
        <select
          className="form-select mb-2"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* INVOICE DROPDOWN (NEW) */}
        <select
          className="form-select mb-2"
          value={form.invoice_id}
          onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}
        >
          <option value="">Select Invoice</option>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoice_number}
            </option>
          ))}
        </select>

        {/* PERIOD */}
        <select
          className="form-select mb-2"
          value={form.period_id}
          onChange={(e) => setForm({ ...form, period_id: e.target.value })}
        >
          <option value="">Select Period</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.period_name}
            </option>
          ))}
        </select>
      </ModalForm>
    </PageContainer>
  );
}
