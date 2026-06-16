package com.launchops.api.tasks;

import com.launchops.api.audit.AuditLogService;
import com.launchops.api.events.ProjectRepository;
import com.launchops.api.memberships.ProjectAccessService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
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
    private final AuditLogService auditLogService;

    public TaskController(
            ProjectRepository projectRepository,
            OpsTaskRepository taskRepository,
            ProjectAccessService projectAccessService,
            AuditLogService auditLogService
    ) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.projectAccessService = projectAccessService;
        this.auditLogService = auditLogService;
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
        var task = taskRepository.save(new OpsTask(project.getId(), request));
        auditLogService.record(
                project.getId(),
                principal,
                "task.created",
                "task",
                task.getId().toString(),
                "운영 작업이 생성되었습니다.",
                Map.of("title", task.getTitle(), "priority", task.getPriority(), "status", task.getStatus())
        );
        return TaskResponse.from(task);
    }

    @PutMapping("/{id}")
    TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request, Principal principal) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown task"));
        projectAccessService.requireProjectAccess(principal, task.getProjectId());
        task.update(request);
        var saved = taskRepository.save(task);
        auditLogService.record(
                saved.getProjectId(),
                principal,
                "task.updated",
                "task",
                saved.getId().toString(),
                "운영 작업이 수정되었습니다.",
                Map.of("title", saved.getTitle(), "priority", saved.getPriority(), "status", saved.getStatus())
        );
        return TaskResponse.from(saved);
    }

    @PatchMapping("/{id}/status")
    TaskResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody TaskStatusRequest request, Principal principal) {
        var task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown task"));
        projectAccessService.requireProjectAccess(principal, task.getProjectId());
        task.changeStatus(request.status());
        var saved = taskRepository.save(task);
        auditLogService.record(
                saved.getProjectId(),
                principal,
                "task.status_changed",
                "task",
                saved.getId().toString(),
                "운영 작업 상태가 변경되었습니다.",
                Map.of("title", saved.getTitle(), "status", saved.getStatus())
        );
        return TaskResponse.from(saved);
    }
}
