import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import * as accountsApi from "../../api/accounts";
import * as usersApi from "../../api/users";
import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";

const MySwal = withReactContent(Swal);

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    account_code: "",
    name: "",
    type: "",
    is_postable: true,
  });
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [res, usersRes] = await Promise.all([
        accountsApi.getAccounts(),
        usersApi.getUsers(),
      ]);
      setAccounts(res.data || []);
      setUsers(usersRes.data || []);
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

  function userName(id) {
    const u = users.find((x) => x.id === id);
    return u ? u.name || u.email : id ?? "-";
  }

  function openNew() {
    setEditingId(null);
    setForm({ account_code: "", name: "", type: "", is_postable: true });
    setShowModal(true);
  }
  function openEdit(row) {
    setEditingId(row.id);
    setForm(row);
    setShowModal(true);
  }

  async function save() {
    try {
      if (editingId) await accountsApi.updateAccount(editingId, form);
      else await accountsApi.createAccount(form);
      MySwal.fire("Saved", "Account saved", "success");
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
      title: `Delete account ${row.account_code}?`,
      icon: "warning",
      showCancelButton: true,
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          await accountsApi.deleteAccount(row.id);
          MySwal.fire("Deleted", "Account removed", "success");
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
    { name: "Code", selector: (r) => r.account_code, sortable: true },
    { name: "Name", selector: (r) => r.name, sortable: true },
    { name: "Type", selector: (r) => r.type },
    { name: "Postable", selector: (r) => (r.is_postable ? "Yes" : "No") },
    // audit
    {
      name: "Created By",
      selector: (r) => userName(r.created_by),
      sortable: true,
    },
    {
      name: "Created At",
      selector: (r) =>
        r.created_at ? new Date(r.created_at).toLocaleString() : "-",
      sortable: true,
    },
    {
      name: "Updated By",
      selector: (r) => userName(r.updated_by),
      sortable: true,
    },
    {
      name: "Updated At",
      selector: (r) =>
        r.updated_at ? new Date(r.updated_at).toLocaleString() : "-",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <button
            className="btn btn-sm btn-outline-primary me-1"
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
        </>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  const filtered = accounts.filter((d) =>
    Object.values(d).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer title="Accounts">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={openNew}>
          <FaPlus /> New Account
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
        title={editingId ? "Edit Account" : "New Account"}
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <input
          className="form-control mb-2"
          placeholder="Account Code"
          value={form.account_code}
          onChange={(e) => setForm({ ...form, account_code: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        />
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            checked={!!form.is_postable}
            onChange={(e) =>
              setForm({ ...form, is_postable: e.target.checked })
            }
          />
          <label className="form-check-label">Is Postable</label>
        </div>
      </ModalForm>
    </PageContainer>
  );
}
