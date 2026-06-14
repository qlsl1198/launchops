package com.launchops.api.incidents;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IncidentStatusRequest(@NotBlank @Size(max = 40) String status) {
}

