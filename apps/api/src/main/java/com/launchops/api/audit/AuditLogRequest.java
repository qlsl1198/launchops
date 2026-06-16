package com.launchops.api.audit;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public record AuditLogRequest(
        @NotBlank String action,
        @NotBlank String targetType,
        String targetId,
        @NotBlank String message,
        Map<String, Object> details
) {
}
