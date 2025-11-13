import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import * as linesApi from "../../api/journalEntryLines";
import * as usersApi from "../../api/users";
import * as accountsApi from "../../api/accounts";
import * as journalApi from "../../api/journalEntries";
import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";

const MySwal = withReactContent(Swal);

export default function JournalEntryLines() {
  const { id } = useParams(); // journal entry id
  const navigate = useNavigate();

  const [lines, setLines] = useState([]);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    account_id: "",
    debit: 0,
    credit: 0,
  });
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [linesRes, usersRes, accRes, entryRes] = await Promise.all([
        linesApi.getLinesByEntry(id),
        usersApi.getUsers(),
        accountsApi.getAccounts(),
        journalApi.getJournalEntry(id),
      ]);

      setLines(linesRes.data || []);
      setUsers(usersRes.data || []);
      setAccounts(accRes.data || []);
      setEntry(entryRes.data);
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
  }, [id]);

  const userName = (userId) => {
    const u = users.find((x) => x.id === userId);
    return u ? u.name || u.email : userId || "-";
  };

  const accountName = (accId) => {
    const a = accounts.find((x) => x.id === accId);
    return a ? a.name || a.account_name : accId || "-";
  };

  function openNew() {
    setForm({ account_id: "", debit: 0, credit: 0 });
    setShowModal(true);
  }

  async function save() {
    try {
      await linesApi.createLine(id, form);
      MySwal.fire("Saved", "Journal entry line added successfully", "success");
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
      title: "Delete?",
      text: "Are you sure you want to delete this line?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await linesApi.deleteLine(id, row.id);
          MySwal.fire("Deleted", "Line removed successfully", "success");
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
    {
      name: "Account",
      selector: (r) => accountName(r.account_id),
      sortable: true,
    },
    { name: "Debit", selector: (r) => r.debit, right: true },
    { name: "Credit", selector: (r) => r.credit, right: true },
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
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => remove(row)}
          title="Delete"
        >
          <FaTrash />
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const filtered = lines.filter((d) =>
    Object.values(d).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer
      title={`Journal Entry Lines (${entry?.entry_number || "..."})`}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => navigate("/journal-entries")}
        >
          <FaArrowLeft /> Back to Journal Entries
        </button>
        <button className="btn btn-success" onClick={openNew}>
          <FaPlus /> Add Line
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
        title="Add Journal Entry Line"
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <select
          className="form-select mb-2"
          value={form.account_id}
          onChange={(e) => setForm({ ...form, account_id: e.target.value })}
        >
          <option value="">Select Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name || acc.account_name}
            </option>
          ))}
        </select>

        <input
          className="form-control mb-2"
          type="number"
          step="0.01"
          placeholder="Debit"
          value={form.debit}
          onChange={(e) =>
            setForm({ ...form, debit: parseFloat(e.target.value) || 0 })
          }
        />
        <input
          className="form-control mb-2"
          type="number"
          step="0.01"
          placeholder="Credit"
          value={form.credit}
          onChange={(e) =>
            setForm({ ...form, credit: parseFloat(e.target.value) || 0 })
          }
        />
      </ModalForm>
    </PageContainer>
  );
}
