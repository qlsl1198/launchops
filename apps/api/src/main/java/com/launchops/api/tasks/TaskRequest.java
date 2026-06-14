package com.launchops.api.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record TaskRequest(
        UUID incidentId,
        @NotBlank @Size(max = 220) String title,
        @Size(max = 40) String status,
        @Size(max = 24) String priority,
        @Size(max = 120) String assignee
) {
}

