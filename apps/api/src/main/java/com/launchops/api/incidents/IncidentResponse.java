package com.launchops.api.incidents;

import java.time.Instant;
import java.util.UUID;

public record IncidentResponse(
        UUID id,
        String title,
        String status,
        String severity,
        String owner,
        String impact,
        Instant createdAt
) {
    public static IncidentResponse from(Incident incident) {
        return new IncidentResponse(
                incident.getId(),
                incident.getTitle(),
                incident.getStatus(),
                incident.getSeverity(),
                incident.getOwner(),
                incident.getImpact(),
                incident.getCreatedAt()
        );
    }
}

