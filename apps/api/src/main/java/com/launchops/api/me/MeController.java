package com.launchops.api.me;

import com.launchops.api.auth.AppUserRepository;
import com.launchops.api.auth.AuthResponse;
import com.launchops.api.events.ProjectRepository;
import com.launchops.api.memberships.ProjectMembershipRepository;
import com.launchops.api.memberships.ProjectMembershipResponse;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/v1/me")
public class MeController {
    private final AppUserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository membershipRepository;

    public MeController(
            AppUserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectMembershipRepository membershipRepository
    ) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
    }

    @GetMapping
    MeResponse me(Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        var memberships = membershipRepository.findByUserId(user.getId()).stream()
                .flatMap(membership -> projectRepository.findById(membership.getProjectId()).stream()
                        .map(project -> ProjectMembershipResponse.from(project, membership)))
                .toList();

        return new MeResponse(AuthResponse.UserProfile.from(user), memberships);
    }
}

