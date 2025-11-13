import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import * as customersApi from "../../api/customers";
import * as usersApi from "../../api/users"; // 👈 we'll fetch user names
import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";

const MySwal = withReactContent(Swal);

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [search, setSearch] = useState("");

  // Load customers + users
  async function load() {
    setLoading(true);
    try {
      const [custRes, usersRes] = await Promise.all([
        customersApi.getCustomers(),
        usersApi.getUsers?.() || [], // if backend supports this endpoint
      ]);

      setCustomers(custRes.data || []);
      setUsers(usersRes.data || []);
    } catch (e) {
      MySwal.fire("Error", e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", email: "" });
    setShowModal(true);
  }

  function openEdit(row) {
    setEditing(row.id);
    setForm(row);
    setShowModal(true);
  }

  async function save() {
    try {
      if (editing) await customersApi.updateCustomer(editing, form);
      else await customersApi.createCustomer(form);
      MySwal.fire("Saved!", "Customer saved successfully", "success");
      setShowModal(false);
      load();
    } catch (e) {
      MySwal.fire("Error", e.message, "error");
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
          await customersApi.deleteCustomer(row.id);
          MySwal.fire("Deleted!", "Customer deleted", "success");
          load();
        } catch (e) {
          MySwal.fire("Error", e.message, "error");
        }
      }
    });
  }

  // 🧠 Helper: map user_id → user_name
  const userName = (id) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name || user.email : id || "-";
  };

  // ✅ Table columns
  const columns = [
    { name: "Name", selector: (r) => r.name, sortable: true },
    { name: "Email", selector: (r) => r.email },
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

  const filtered = customers.filter((d) =>
    Object.values(d).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer title="Customers">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={openNew}>
          <FaPlus /> New Customer
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pagination
        highlightOnHover
        striped
        responsive
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
        title={editing ? "Edit Customer" : "New Customer"}
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <input
          className="form-control mb-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="form-control mb-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </ModalForm>
    </PageContainer>
  );
}
