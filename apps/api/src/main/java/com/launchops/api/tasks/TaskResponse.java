package com.launchops.api.tasks;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        UUID incidentId,
        String title,
        String status,
        String priority,
        String assignee,
        Instant createdAt
) {
    public static TaskResponse from(OpsTask task) {
        return new TaskResponse(
                task.getId(),
                task.getIncidentId(),
                task.getTitle(),
                task.getStatus(),
                task.getPriority(),
                task.getAssignee(),
                task.getCreatedAt()
        );
    }
}

