package com.launchops.api.memberships;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_memberships")
public class ProjectMembership {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String role;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ProjectMembership() {
    }

    public ProjectMembership(UUID projectId, UUID userId, String role) {
        this.id = UUID.randomUUID();
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
        this.createdAt = Instant.now();
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getRole() {
        return role;
    }
}

