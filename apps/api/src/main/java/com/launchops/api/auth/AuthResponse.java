package com.launchops.api.auth;

import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UserProfile user
) {
    public static AuthResponse bearer(String accessToken, AppUser user) {
        return new AuthResponse(accessToken, "Bearer", UserProfile.from(user));
    }

    public record UserProfile(UUID id, String name, String email, String role) {
        public static UserProfile from(AppUser user) {
            return new UserProfile(user.getId(), user.getName(), user.getEmail(), user.getRole());
        }
    }
}

