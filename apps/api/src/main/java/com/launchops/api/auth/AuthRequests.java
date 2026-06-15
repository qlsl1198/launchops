package com.launchops.api.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthRequests {
    private AuthRequests() {
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 120) String password
    ) {
    }

    public record LoginRequest(
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(max = 120) String password
    ) {
    }
}

