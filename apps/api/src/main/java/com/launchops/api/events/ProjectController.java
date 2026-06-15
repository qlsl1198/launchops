package com.launchops.api.events;

import com.launchops.api.auth.AppUserRepository;
import com.launchops.api.memberships.ProjectMembership;
import com.launchops.api.memberships.ProjectMembershipRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/v1/projects")
public class ProjectController {
    private final ProjectRepository projectRepository;
    private final AppUserRepository userRepository;
    private final ProjectMembershipRepository membershipRepository;

    public ProjectController(
            ProjectRepository projectRepository,
            AppUserRepository userRepository,
            ProjectMembershipRepository membershipRepository
    ) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.membershipRepository = membershipRepository;
    }

    @GetMapping
    List<ProjectResponse> list(Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        return membershipRepository.findByUserId(user.getId()).stream()
                .flatMap(membership -> projectRepository.findById(membership.getProjectId()).stream())
                .map(ProjectResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ProjectResponse create(@Valid @RequestBody ProjectRequest request, Principal principal) {
        var user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
        projectRepository.findByProjectKey(request.projectKey()).ifPresent(project -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "projectKey already exists");
        });
        var project = projectRepository.save(new Project(request.name(), request.projectKey(), request.environment()));
        membershipRepository.save(new ProjectMembership(project.getId(), user.getId(), "OWNER"));
        return ProjectResponse.from(project);
    }
}
