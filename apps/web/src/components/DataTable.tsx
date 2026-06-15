type Row = Record<string, string | number>;

const headerLabels: Record<string, string> = {
  name: "이름",
  account_id: "고객 ID",
  accountId: "고객 ID",
  userId: "사용자 ID",
  severity: "심각도",
  source: "출처",
  occurred_at: "발생 시각",
  occurredAt: "발생 시각",
  risk_score: "리스크 점수",
  riskScore: "리스크 점수",
  errors: "오류",
  summary: "요약",
  title: "제목",
  status: "상태",
  priority: "우선순위",
  assignee: "담당자",
  owner: "담당자",
  impact: "영향도"
};

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
                <th key={column}>{headerLabels[column] ?? column.replaceAll("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td className={column === "summary" || column === "impact" ? "wrapCell" : ""} key={column}>
                    {row[column]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
