import React from "react";
import DataTable from "react-data-table-component";

export default function DataTableWrapper({
  columns,
  data,
  title,
  pagination = true,
}) {
  return (
    <DataTable
      title={title}
      columns={columns}
      data={data}
      pagination={pagination}
      highlightOnHover
      dense
    />
  );
}
