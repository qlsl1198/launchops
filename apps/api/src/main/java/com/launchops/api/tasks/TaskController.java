package com.launchops.api.tasks;

import com.launchops.api.events.ProjectRepository;
import com.launchops.api.memberships.ProjectAccessService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/v1/tasks")
public class TaskController {
    private final ProjectRepository projectRepository;
    private final OpsTaskRepository taskRepository;
    private final ProjectAccessService projectAccessService;

    public TaskController(
            ProjectRepository projectRepository,
            OpsTaskRepository taskRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectAccessService = projectAccessService;
    }

    @GetMapping
    List<TaskResponse> list(@RequestParam(defaultValue = "demo") String projectKey, Principal principal) {
        var project = projectAccessService.requireProjectAccess(principal, projectKey);
        return taskRepository.findByProjectIdOrderByCreatedAtDesc(project.getId()).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    TaskResponse create(
            @RequestParam(defaultValue = "demo") String projectKey,
            @Valid @RequestBody TaskRequest request,
            Principal principal
    ) {
        var project = projectAccessService.requireProjectAccess(principal, projectKey);
        return TaskResponse.from(taskRepository.save(new OpsTask(project.getId(), request)));
    }

    @PutMapping("/{id}")
    TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request, Principal principal) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown task"));
        projectAccessService.requireProjectAccess(principal, task.getProjectId());
        task.update(request);
        return TaskResponse.from(taskRepository.save(task));
    }

    @PatchMapping("/{id}/status")
    TaskResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody TaskStatusRequest request, Principal principal) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown task"));
        projectAccessService.requireProjectAccess(principal, task.getProjectId());
        task.changeStatus(request.status());
        return TaskResponse.from(taskRepository.save(task));
    }
}
