package com.launchops.api.accounts;

import com.launchops.api.events.ProjectRepository;
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

    public AccountHealthController(ProjectRepository projectRepository, AccountHealthRepository accountHealthRepository) {
        this.projectRepository = projectRepository;
        this.accountHealthRepository = accountHealthRepository;
    }

    @GetMapping
    List<AccountHealthResponse> list(@RequestParam(defaultValue = "demo") String projectKey) {
        var project = projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown projectKey"));
        return accountHealthRepository.findByProjectIdOrderByRiskScoreDesc(project.getId()).stream()
                .map(AccountHealthResponse::from)
                .toList();
    }
}

