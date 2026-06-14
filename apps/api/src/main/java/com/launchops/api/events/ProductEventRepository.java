package com.launchops.api.events;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductEventRepository extends JpaRepository<ProductEvent, UUID> {
    long countByProjectIdAndOccurredAtAfter(UUID projectId, Instant since);

    long countByProjectIdAndSeverityInAndOccurredAtAfter(UUID projectId, List<EventSeverity> severities, Instant since);

    List<ProductEvent> findTop12ByProjectIdOrderByOccurredAtDesc(UUID projectId);

    List<ProductEvent> findByProjectIdOrderByOccurredAtDesc(UUID projectId, Pageable pageable);

    List<ProductEvent> findByProjectIdAndSeverityOrderByOccurredAtDesc(UUID projectId, EventSeverity severity, Pageable pageable);

    @Query("""
            select coalesce(avg(e.durationMs), 0)
            from ProductEvent e
            where e.projectId = :projectId and e.occurredAt >= :since and e.durationMs is not null
            """)
    double averageDuration(UUID projectId, Instant since);
}
