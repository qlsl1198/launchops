package com.launchops.api.dashboard;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public record DashboardSummary(
        List<DashboardMetric> metrics,
        @JsonProperty("recentEvents")
        List<Map<String, Object>> recentEvents,
        @JsonProperty("accountRisks")
        List<Map<String, Object>> accountRisks,
        List<Map<String, Object>> incidents,
        List<Map<String, Object>> tasks
) {
}
