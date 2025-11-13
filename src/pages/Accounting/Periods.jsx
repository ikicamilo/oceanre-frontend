import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaCalculator,
  FaLock,
  FaSync,
} from "react-icons/fa";
import * as periodsApi from "../../api/periods";
import * as usersApi from "../../api/users";
import ModalForm from "../../components/common/ModalForm";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PageContainer from "../../components/layout/PageContainer";

const MySwal = withReactContent(Swal);

export default function Periods() {
  const [periods, setPeriods] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    period_name: "",
    start_date: "",
    end_date: "",
    status: "OPEN",
  });

  async function load() {
    setLoading(true);
    try {
      const [res, usersRes] = await Promise.all([
        periodsApi.getPeriods(),
        usersApi.getUsers(),
      ]);
      setPeriods(res.data || []);
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

  // 🧩 Helper: remove unwanted metadata
  const cleanObject = (obj) => {
    if (Array.isArray(obj)) return obj.map(cleanObject);
    if (typeof obj === "object" && obj !== null) {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (
          ["created_at", "updated_at", "created_by", "updated_by"].includes(key)
        )
          continue;
        cleaned[key] = cleanObject(value);
      }
      return cleaned;
    }
    return obj;
  };

  // 🧩 Format object to HTML table for SweetAlert (after cleaning)
  const formatObjectAsTable = (obj) => {
    const clean = cleanObject(obj);
    const rows = Object.entries(clean)
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          return `
            <tr>
              <td style="font-weight:600">${key}</td>
              <td>${formatObjectAsTable(value)}</td>
            </tr>
          `;
        } else {
          return `<tr><td style="font-weight:600">${key}</td><td>${value}</td></tr>`;
        }
      })
      .join("");
    return `<table class="table table-bordered table-sm w-100">${rows}</table>`;
  };

  // 🧠 Operation handler for validate / calculate / lock
  async function handleOperation(type, row) {
    const actionNames = {
      validate: "Validate Period",
      calculate: "Calculate Period",
      lock: "Lock Period",
    };

    const confirm = await MySwal.fire({
      title: actionNames[type],
      text: "Are you sure to execute this operation?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!confirm.isConfirmed) return;

    try {
      let res;
      if (type === "validate") res = await periodsApi.validatePeriod(row.id);
      if (type === "calculate") res = await periodsApi.calculatePeriod(row.id);
      if (type === "lock") res = await periodsApi.lockPeriod(row.id);

      MySwal.fire({
        title: res.data.message || "Operation Result",
        html: formatObjectAsTable(res.data),
        icon: "success",
        width: 600,
      });
      load();
    } catch (err) {
      MySwal.fire(
        "Error",
        err?.response?.data?.message || err.message,
        "error"
      );
    }
  }

  // 🧠 Change Status Handler
  async function handleChangeStatus(row) {
    const { value: status } = await MySwal.fire({
      title: "Change Period Status",
      html: `
        <select id="swal-status" class="swal2-input">
          <option value="">Select new status</option>
          <option value="OPEN">OPEN</option>
          <option value="VALIDATING">VALIDATING</option>
          <option value="CALCULATING">CALCULATING</option>
          <option value="LOCKED">LOCKED</option>
          <option value="REOPENED">REOPENED</option>
        </select>
      `,
      preConfirm: () => document.getElementById("swal-status").value,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    if (!status) return;

    try {
      const res = await periodsApi.changeStatus(row.id, status);
      MySwal.fire({
        title: "Status Updated",
        html: formatObjectAsTable(res.data),
        icon: "success",
        width: 600,
      });
      load();
    } catch (err) {
      MySwal.fire(
        "Error",
        err?.response?.data?.message || err.message,
        "error"
      );
    }
  }

  async function save() {
    try {
      if (editingId) await periodsApi.updatePeriod(editingId, form);
      else await periodsApi.createPeriod(form);
      MySwal.fire("Saved!", "Period saved successfully", "success");
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
          await periodsApi.deletePeriod(row.id);
          MySwal.fire("Deleted!", "Period deleted", "success");
          load();
        } catch (err) {
          MySwal.fire("Error", err.message, "error");
        }
      }
    });
  }

  const filtered = periods.filter((p) =>
    Object.values(p).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = [
    { name: "Period Name", selector: (r) => r.period_name, sortable: true },
    { name: "Start Date", selector: (r) => r.start_date },
    { name: "End Date", selector: (r) => r.end_date },
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
      wrap: true
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="btn-group">
          <button
            className="btn btn-sm btn-outline-success"
            title="Validate"
            onClick={() => handleOperation("validate", row)}
          >
            <FaCheck />
          </button>
          <button
            className="btn btn-sm btn-outline-warning"
            title="Calculate"
            onClick={() => handleOperation("calculate", row)}
          >
            <FaCalculator />
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            title="Lock"
            onClick={() => handleOperation("lock", row)}
          >
            <FaLock />
          </button>
          <button
            className="btn btn-sm btn-outline-info"
            title="Change Status"
            onClick={() => handleChangeStatus(row)}
          >
            <FaSync />
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => {
              setEditingId(row.id);
              setForm(row);
              setShowModal(true);
            }}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => remove(row)}
          >
            <FaTrash />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <PageContainer title="Accounting Periods">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success"
          onClick={() => {
            setEditingId(null);
            setForm({
              period_name: "",
              start_date: "",
              end_date: "",
              status: "OPEN",
            });
            setShowModal(true);
          }}
        >
          <FaPlus /> New Period
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
        title={editingId ? "Edit Period" : "New Period"}
        onClose={() => setShowModal(false)}
        onSave={save}
      >
        <input
          className="form-control mb-2"
          placeholder="Period Name"
          value={form.period_name}
          onChange={(e) => setForm({ ...form, period_name: e.target.value })}
        />
        <input
          className="form-control mb-2"
          type="date"
          value={form.start_date}
          onChange={(e) => setForm({ ...form, start_date: e.target.value })}
        />
        <input
          className="form-control mb-2"
          type="date"
          value={form.end_date}
          onChange={(e) => setForm({ ...form, end_date: e.target.value })}
        />
      </ModalForm>
    </PageContainer>
  );
}
