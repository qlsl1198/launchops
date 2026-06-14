package com.launchops.api.events;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProjectRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 80) @Pattern(regexp = "^[a-z0-9-]+$") String projectKey,
        @NotBlank @Size(max = 40) String environment
) {
}

