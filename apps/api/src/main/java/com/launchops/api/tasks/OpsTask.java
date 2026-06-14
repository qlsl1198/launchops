package com.launchops.api.tasks;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ops_tasks")
public class OpsTask {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "incident_id")
    private UUID incidentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String priority;

    private String assignee;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected OpsTask() {
    }

    public OpsTask(UUID projectId, TaskRequest request) {
        this.id = UUID.randomUUID();
        this.projectId = projectId;
        this.incidentId = request.incidentId();
        this.title = request.title();
        this.status = request.status() == null ? "todo" : request.status();
        this.priority = request.priority() == null ? "medium" : request.priority();
        this.assignee = request.assignee();
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getIncidentId() {
        return incidentId;
    }

    public String getTitle() {
        return title;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public String getAssignee() {
        return assignee;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void update(TaskRequest request) {
        this.incidentId = request.incidentId();
        this.title = request.title();
        this.status = request.status() == null ? this.status : request.status();
        this.priority = request.priority() == null ? this.priority : request.priority();
        this.assignee = request.assignee();
    }

    public void changeStatus(String status) {
        this.status = status;
    }
}

