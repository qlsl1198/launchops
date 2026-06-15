package com.launchops.api.me;

import com.launchops.api.auth.AuthResponse;
import com.launchops.api.memberships.ProjectMembershipResponse;
import java.util.List;

public record MeResponse(
        AuthResponse.UserProfile user,
        List<ProjectMembershipResponse> memberships
) {
}

