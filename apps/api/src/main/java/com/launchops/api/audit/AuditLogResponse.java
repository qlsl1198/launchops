package com.launchops.api.audit;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        String actorEmail,
        String action,
        String targetType,
        String targetId,
        String message,
        Map<String, Object> details,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getActorEmail(),
                log.getAction(),
                log.getTargetType(),
                log.getTargetId(),
                log.getMessage(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
