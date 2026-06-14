package com.launchops.api.incidents;

import com.launchops.api.events.ProjectRepository;
import jakarta.validation.Valid;
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
@RequestMapping("/v1/incidents")
public class IncidentController {
    private final ProjectRepository projectRepository;
    private final IncidentRepository incidentRepository;

    public IncidentController(ProjectRepository projectRepository, IncidentRepository incidentRepository) {
        this.projectRepository = projectRepository;
        this.incidentRepository = incidentRepository;
    }

    @GetMapping
    List<IncidentResponse> list(@RequestParam(defaultValue = "demo") String projectKey) {
        var project = projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown projectKey"));
        return incidentRepository.findByProjectIdOrderByCreatedAtDesc(project.getId()).stream()
                .map(IncidentResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    IncidentResponse create(
            @RequestParam(defaultValue = "demo") String projectKey,
            @Valid @RequestBody IncidentRequest request
    ) {
        var project = projectRepository.findByProjectKey(projectKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown projectKey"));
        return IncidentResponse.from(incidentRepository.save(new Incident(project.getId(), request)));
    }

    @PutMapping("/{id}")
    IncidentResponse update(@PathVariable UUID id, @Valid @RequestBody IncidentRequest request) {
        var incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown incident"));
        incident.update(request);
        return IncidentResponse.from(incidentRepository.save(incident));
    }

    @PatchMapping("/{id}/status")
    IncidentResponse changeStatus(@PathVariable UUID id, @Valid @RequestBody IncidentStatusRequest request) {
        var incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown incident"));
        incident.changeStatus(request.status());
        return IncidentResponse.from(incidentRepository.save(incident));
    }
}

