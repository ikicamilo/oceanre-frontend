import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEdit, FaTrash, FaList } from "react-icons/fa";
import * as journalApi from "../../api/journalEntries";
import * as usersApi from "../../api/users";
import * as periodsApi from "../../api/periods";
import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";
import { useNavigate } from "react-router-dom";

const MySwal = withReactContent(Swal);

export default function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [users, setUsers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    entry_number: "",
    posting_date: "",
    description: "",
    source_reference: "",
    period_id: "",
  });
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const [res, usersRes, periodsRes] = await Promise.all([
        journalApi.getJournalEntries(),
        usersApi.getUsers(),
        periodsApi.getPeriods(),
      ]);
      setEntries(res.data || []);
      setUsers(usersRes.data || []);
      setPeriods(periodsRes.data || []);
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

  const userName = (id) => users.find((x) => x.id === id)?.name || id || "-";
  const periodName = (id) =>
    periods.find((x) => x.id === id)?.period_name || id || "-";

  const columns = [
    { name: "Entry #", selector: (r) => r.entry_number, sortable: true },
    { name: "Posting Date", selector: (r) => r.posting_date },
    { name: "Description", selector: (r) => r.description, wrap: true },
    { name: "Period", selector: (r) => periodName(r.period_id) },
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
        <div className="btn-group">
          <button
            className="btn btn-sm btn-outline-info"
            title="Details"
            onClick={() => navigate(`/journal-entries/${row.id}/lines`)}
          >
            <FaList />
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => openEdit(row)}
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => remove(row)}
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  function openNew() {
    setEditingId(null);
    setForm({
      entry_number: "",
      posting_date: "",
      description: "",
      source_reference: "",
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
      if (editingId) await journalApi.updateJournalEntry(editingId, form);
      else await journalApi.createJournalEntry(form);
      MySwal.fire("Saved", "Journal entry saved", "success");
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
      title: `Delete entry ${row.entry_number}?`,
      icon: "warning",
      showCancelButton: true,
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await journalApi.deleteJournalEntry(row.id);
          MySwal.fire("Deleted", "Entry removed", "success");
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

  const filtered = entries.filter((d) =>
    Object.values(d).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer title="Journal Entries">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={openNew}>
          <FaPlus /> New Entry
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pagination
        highlightOnHover
        responsive
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
        title={editingId ? "Edit Journal Entry" : "New Journal Entry"}
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <input
          className="form-control mb-2"
          placeholder="Entry Number"
          value={form.entry_number}
          onChange={(e) => setForm({ ...form, entry_number: e.target.value })}
        />
        <input
          className="form-control mb-2"
          type="date"
          value={form.posting_date}
          onChange={(e) => setForm({ ...form, posting_date: e.target.value })}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
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
