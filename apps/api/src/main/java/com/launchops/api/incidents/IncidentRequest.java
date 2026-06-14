package com.launchops.api.incidents;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentRequest(
        @NotBlank @Size(max = 220) String title,
        @Size(max = 40) String status,
        @Size(max = 24) String severity,
        @Size(max = 120) String owner,
        @Size(max = 4000) String impact
) {
}

