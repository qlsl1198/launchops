package com.launchops.api.tasks;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TaskStatusRequest(@NotBlank @Size(max = 40) String status) {
}

