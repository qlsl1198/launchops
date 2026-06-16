package com.launchops.api.audit;

import com.launchops.api.memberships.ProjectAccessService;
import java.security.Principal;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/audit-logs")
public class AuditLogController {
    private final AuditLogRepository repository;
    private final ProjectAccessService projectAccessService;

    public AuditLogController(AuditLogRepository repository, ProjectAccessService projectAccessService) {
        this.repository = repository;
        this.projectAccessService = projectAccessService;
    }

    @GetMapping
    List<AuditLogResponse> list(
            @RequestParam(defaultValue = "demo") String projectKey,
            @RequestParam(defaultValue = "50") int limit,
            Principal principal
    ) {
        var project = projectAccessService.requireProjectAccess(principal, projectKey);
        var safeLimit = Math.max(1, Math.min(limit, 200));
        return repository.findByProjectIdOrderByCreatedAtDesc(project.getId(), PageRequest.of(0, safeLimit)).stream()
                .map(AuditLogResponse::from)
                .toList();
    }
}
