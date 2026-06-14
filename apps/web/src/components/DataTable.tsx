type Row = Record<string, string | number>;

export function DataTable({ title, rows }: { title: string; rows: Row[] }) {
  const columns = rows[0] ? Object.keys(rows[0]).filter((key) => key !== "id") : [];

  return (
    <section className="panel">
      <div className="panelHeader">
        <h2>{title}</h2>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column.replaceAll("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

