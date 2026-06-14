package com.launchops.api.incidents;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    List<Incident> findTop6ByProjectIdOrderByCreatedAtDesc(UUID projectId);

    List<Incident> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
}

