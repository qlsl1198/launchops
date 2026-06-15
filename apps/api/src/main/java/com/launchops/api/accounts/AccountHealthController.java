package com.launchops.api.accounts;

import com.launchops.api.events.ProjectRepository;
import com.launchops.api.memberships.ProjectAccessService;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/v1/accounts/health")
public class AccountHealthController {
    private final ProjectRepository projectRepository;
    private final AccountHealthRepository accountHealthRepository;
    private final ProjectAccessService projectAccessService;

    public AccountHealthController(
            ProjectRepository projectRepository,
            AccountHealthRepository accountHealthRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectRepository = projectRepository;
        this.accountHealthRepository = accountHealthRepository;
        this.projectAccessService = projectAccessService;
    }

    @GetMapping
    List<AccountHealthResponse> list(@RequestParam(defaultValue = "demo") String projectKey, Principal principal) {
        var project = projectAccessService.requireProjectAccess(principal, projectKey);
        return accountHealthRepository.findByProjectIdOrderByRiskScoreDesc(project.getId()).stream()
                .map(AccountHealthResponse::from)
                .toList();
    }
}
