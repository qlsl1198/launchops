package com.launchops.api.memberships;

import com.launchops.api.events.Project;
import com.launchops.api.events.ProjectResponse;

public record ProjectMembershipResponse(
        ProjectResponse project,
        String role
) {
    public static ProjectMembershipResponse from(Project project, ProjectMembership membership) {
        return new ProjectMembershipResponse(ProjectResponse.from(project), membership.getRole());
    }
}

