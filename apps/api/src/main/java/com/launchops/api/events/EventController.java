package com.launchops.api.events;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import com.launchops.api.memberships.ProjectAccessService;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/v1/events")
public class EventController {
    private final ProjectRepository projectRepository;
    private final ProductEventRepository eventRepository;
    private final ProjectAccessService projectAccessService;

    public EventController(
            ProjectRepository projectRepository,
            ProductEventRepository eventRepository,
            ProjectAccessService projectAccessService
    ) {
        this.projectRepository = projectRepository;
        this.eventRepository = eventRepository;
        this.projectAccessService = projectAccessService;
    }

    @GetMapping
    List<ProductEventResponse> list(
            @RequestParam(defaultValue = "demo") String projectKey,
            @RequestParam(required = false) EventSeverity severity,
            @RequestParam(defaultValue = "50") int limit,
            Principal principal
    ) {
        var project = projectAccessService.requireProjectAccess(principal, projectKey);
        var safeLimit = Math.max(1, Math.min(limit, 200));
        var page = PageRequest.of(0, safeLimit);
        var events = severity == null
                ? eventRepository.findByProjectIdOrderByOccurredAtDesc(project.getId(), page)
                : eventRepository.findByProjectIdAndSeverityOrderByOccurredAtDesc(project.getId(), severity, page);
        return events.stream().map(ProductEventResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    EventResponse ingest(@Valid @RequestBody EventRequest request, Principal principal) {
        var project = projectAccessService.requireProjectAccess(principal, request.projectKey());
        var event = eventRepository.save(new ProductEvent(project, request));
        return new EventResponse(event.getId(), true);
    }
}
