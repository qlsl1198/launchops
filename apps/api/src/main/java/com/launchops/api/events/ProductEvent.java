package com.launchops.api.events;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "product_events")
public class ProductEvent {
    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "user_id")
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventSeverity severity;

    @Column(name = "duration_ms")
    private Integer durationMs;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> properties;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt = Instant.now();

    protected ProductEvent() {
    }

    public ProductEvent(Project project, EventRequest request) {
        this.projectId = project.getId();
        this.accountId = request.accountId();
        this.userId = request.userId();
        this.name = request.name();
        this.source = request.source();
        this.severity = request.severity();
        this.durationMs = request.durationMs();
        this.properties = request.properties() == null ? Map.of() : request.properties();
        this.occurredAt = request.occurredAt() == null ? Instant.now() : request.occurredAt();
    }

    public UUID getId() {
        return id;
    }

    public String getAccountId() {
        return accountId;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getSource() {
        return source;
    }

    public EventSeverity getSeverity() {
        return severity;
    }

    public Integer getDurationMs() {
        return durationMs;
    }

    public Map<String, Object> getProperties() {
        return properties;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }
}
