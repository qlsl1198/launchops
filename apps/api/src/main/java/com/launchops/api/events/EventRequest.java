package com.launchops.api.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.Map;

public record EventRequest(
        @NotBlank @Size(max = 80) String projectKey,
        @NotBlank @Size(max = 120) String accountId,
        @Size(max = 120) String userId,
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) String source,
        @NotNull EventSeverity severity,
        @PositiveOrZero Integer durationMs,
        Map<String, Object> properties,
        Instant occurredAt
) {
}
