import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import * as invoicesApi from "../../api/invoices";
import * as usersApi from "../../api/users";
import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";

const MySwal = withReactContent(Swal);

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    invoice_number: "",
    issue_date: "",
    due_date: "",
    customer_id: "",
    total_amount: "",
    currency: "USD",
    status: "DRAFT",
    period_id: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [invRes, usersRes] = await Promise.all([
        invoicesApi.getInvoices(),
        usersApi.getUsers(),
      ]);
      setInvoices(invRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      MySwal.fire("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const userName = (id) => users.find((u) => u.id === id)?.name || id || "-";

  function openNew() {
    setEditing(null);
    setForm({
      invoice_number: "",
      issue_date: "",
      due_date: "",
      customer_id: "",
      total_amount: "",
      currency: "USD",
      status: "DRAFT",
      period_id: "",
    });
    setShowModal(true);
  }

  function openEdit(row) {
    setEditing(row.id);
    setForm(row);
    setShowModal(true);
  }

  async function save() {
    try {
      if (editing) await invoicesApi.updateInvoice(editing, form);
      else await invoicesApi.createInvoice(form);
      MySwal.fire("Saved!", "Invoice saved successfully", "success");
      setShowModal(false);
      load();
    } catch (err) {
      MySwal.fire("Error", err.message, "error");
    }
  }

  async function remove(row) {
    MySwal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true,
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await invoicesApi.deleteInvoice(row.id);
          MySwal.fire("Deleted!", "Invoice deleted", "success");
          load();
        } catch (err) {
          MySwal.fire("Error", err.message, "error");
        }
      }
    });
  }

  const filtered = invoices.filter((i) =>
    Object.values(i).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = [
    { name: "Invoice #", selector: (r) => r.invoice_number, sortable: true },
    { name: "Customer", selector: (r) => r.customer_name },
    { name: "Total", selector: (r) => r.total_amount, right: true },
    { name: "Status", selector: (r) => r.status },
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

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer title="Invoices">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={openNew}>
          <FaPlus /> New Invoice
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pagination
        highlightOnHover
        striped
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

      <ModalForm
        show={showModal}
        title={editing ? "Edit Invoice" : "New Invoice"}
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <input
          className="form-control mb-2"
          placeholder="Invoice #"
          value={form.invoice_number}
          onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
        />
        <input
          className="form-control mb-2"
          type="date"
          value={form.issue_date}
          onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
        />
        <input
          className="form-control mb-2"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Customer ID"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Total"
          type="number"
          value={form.total_amount}
          onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
        />
      </ModalForm>
    </PageContainer>
  );
}
