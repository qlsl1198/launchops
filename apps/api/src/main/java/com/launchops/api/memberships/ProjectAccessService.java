package com.launchops.api.memberships;

import com.launchops.api.auth.AppUserRepository;
import com.launchops.api.events.Project;
import com.launchops.api.events.ProjectRepository;
import java.security.Principal;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProjectAccessService {
    private final AppUserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository membershipRepository;

    public ProjectAccessService(
            AppUserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMembershipRepository membershipRepository
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
    }

    public Project requireProjectAccess(Principal principal, String projectKey) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        var project = projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown projectKey"));

        if (!membershipRepository.existsByUserIdAndProjectId(user.getId(), project.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Project access denied");
        }

        return project;
    }

    public void requireProjectAccess(Principal principal, UUID projectId) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        if (!membershipRepository.existsByUserIdAndProjectId(user.getId(), projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Project access denied");
        }
    }
}
