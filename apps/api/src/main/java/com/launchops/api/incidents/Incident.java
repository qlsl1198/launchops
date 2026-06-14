package com.launchops.api.incidents;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String severity;

    private String owner;

    @Column(nullable = false)
    private String impact;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Incident() {
    }

    public Incident(UUID projectId, IncidentRequest request) {
        this.id = UUID.randomUUID();
        this.projectId = projectId;
        this.title = request.title();
        this.status = request.status() == null ? "open" : request.status();
        this.severity = request.severity() == null ? "sev3" : request.severity();
        this.owner = request.owner();
        this.impact = request.impact() == null ? "" : request.impact();
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public String getTitle() {
        return title;
    }

    public String getStatus() {
        return status;
    }

    public String getSeverity() {
        return severity;
    }

    public String getOwner() {
        return owner;
    }

    public String getImpact() {
        return impact;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void update(IncidentRequest request) {
        this.title = request.title();
        this.status = request.status() == null ? this.status : request.status();
        this.severity = request.severity() == null ? this.severity : request.severity();
        this.owner = request.owner();
        this.impact = request.impact() == null ? "" : request.impact();
    }

    public void changeStatus(String status) {
        this.status = status;
    }
}
