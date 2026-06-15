package com.launchops.api.dashboard;

import com.launchops.api.accounts.AccountHealthRepository;
import com.launchops.api.events.EventSeverity;
import com.launchops.api.events.ProductEventRepository;
import com.launchops.api.events.ProjectRepository;
import com.launchops.api.incidents.IncidentRepository;
import com.launchops.api.memberships.ProjectAccessService;
import com.launchops.api.tasks.OpsTaskRepository;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class DashboardService {
    private final ProjectRepository projectRepository;
    private final ProductEventRepository eventRepository;
    private final IncidentRepository incidentRepository;
    private final OpsTaskRepository taskRepository;
    private final AccountHealthRepository accountHealthRepository;
    private final ProjectAccessService projectAccessService;

    public DashboardService(
            ProjectRepository projectRepository,
            ProductEventRepository eventRepository,
            IncidentRepository incidentRepository,
            OpsTaskRepository taskRepository,
            AccountHealthRepository accountHealthRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectRepository = projectRepository;
        this.eventRepository = eventRepository;
        this.incidentRepository = incidentRepository;
        this.taskRepository = taskRepository;
        this.accountHealthRepository = accountHealthRepository;
        this.projectAccessService = projectAccessService;
    }

    public DashboardSummary dashboard(String projectKey, Principal principal) {
        var project = projectAccessService.requireProjectAccess(principal, projectKey);

        var since = Instant.now().minus(24, ChronoUnit.HOURS);
        var total = eventRepository.countByProjectIdAndOccurredAtAfter(project.getId(), since);
        var errors = eventRepository.countByProjectIdAndSeverityInAndOccurredAtAfter(
                project.getId(),
                List.of(EventSeverity.error, EventSeverity.critical),
                since
        );
        var errorRate = total == 0 ? 0 : (errors * 100.0 / total);
        var avgDuration = eventRepository.averageDuration(project.getId(), since);

        var recentEvents = eventRepository.findTop12ByProjectIdOrderByOccurredAtDesc(project.getId()).stream()
                .map(event -> Map.<String, Object>of(
                        "id", event.getId(),
                        "name", event.getName(),
                        "account_id", event.getAccountId(),
                        "severity", event.getSeverity().name(),
                        "source", event.getSource(),
                        "occurred_at", event.getOccurredAt().toString()
                ))
                .toList();

        var incidents = incidentRepository.findTop6ByProjectIdOrderByCreatedAtDesc(project.getId()).stream()
                .map(incident -> Map.<String, Object>of(
                        "title", incident.getTitle(),
                        "status", incident.getStatus(),
                        "severity", incident.getSeverity(),
                        "owner", incident.getOwner() == null ? "-" : incident.getOwner()
                ))
                .toList();

        var accountRisks = accountHealthRepository.findByProjectIdOrderByRiskScoreDesc(project.getId()).stream()
                .limit(8)
                .map(account -> Map.<String, Object>of(
                        "account_id", account.getAccountId(),
                        "risk_score", account.getRiskScore(),
                        "errors", account.getErrorCount24h(),
                        "summary", account.getSummary()
                ))
                .toList();

        var tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(project.getId()).stream()
                .limit(8)
                .map(task -> Map.<String, Object>of(
                        "id", task.getId(),
                        "title", task.getTitle(),
                        "status", task.getStatus(),
                        "priority", task.getPriority(),
                        "assignee", task.getAssignee() == null ? "-" : task.getAssignee()
                ))
                .toList();

        return new DashboardSummary(
                List.of(
                        new DashboardMetric("Events 24h", String.valueOf(total), "+ live ingestion", "neutral"),
                        new DashboardMetric("Error rate", "%.1f%%".formatted(errorRate), errors + " failing events", errorRate > 5 ? "danger" : "good"),
                        new DashboardMetric("Avg latency", "%.0fms".formatted(avgDuration), "from tracked events", avgDuration > 800 ? "warning" : "good"),
                        new DashboardMetric("Open incidents", String.valueOf(incidents.size()), "triage queue", "warning")
                ),
                recentEvents,
                accountRisks,
                incidents,
                tasks
        );
    }
}
