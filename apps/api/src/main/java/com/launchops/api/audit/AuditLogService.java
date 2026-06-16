package com.launchops.api.audit;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    private final AuditLogRepository repository;

    public AuditLogService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void record(
            UUID projectId,
            Principal principal,
            String action,
            String targetType,
            String targetId,
            String message,
            Map<String, Object> details
    ) {
        var actorEmail = principal == null ? "system" : principal.getName();
        repository.save(new AuditLog(
                projectId,
                actorEmail,
                new AuditLogRequest(action, targetType, targetId, message, details)
        ));
    }
}
