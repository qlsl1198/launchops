package com.launchops.api.events;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ProductEventResponse(
        UUID id,
        String accountId,
        String userId,
        String name,
        String source,
        EventSeverity severity,
        Integer durationMs,
        Map<String, Object> properties,
        Instant occurredAt
) {
    public static ProductEventResponse from(ProductEvent event) {
        return new ProductEventResponse(
                event.getId(),
                event.getAccountId(),
                event.getUserId(),
                event.getName(),
                event.getSource(),
                event.getSeverity(),
                event.getDurationMs(),
                event.getProperties(),
                event.getOccurredAt()
        );
    }
}

