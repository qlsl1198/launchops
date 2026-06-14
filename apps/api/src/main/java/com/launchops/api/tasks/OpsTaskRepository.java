package com.launchops.api.tasks;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpsTaskRepository extends JpaRepository<OpsTask, UUID> {
    List<OpsTask> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
}

