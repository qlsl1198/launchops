package com.launchops.api.accounts;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "account_health")
public class AccountHealth {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "event_count_24h", nullable = false)
    private int eventCount24h;

    @Column(name = "error_count_24h", nullable = false)
    private int errorCount24h;

    @Column(name = "p95_duration_ms")
    private Integer p95DurationMs;

    @Column(name = "risk_score", nullable = false)
    private double riskScore;

    @Column(nullable = false)
    private String summary;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AccountHealth() {
    }

    public UUID getId() {
        return id;
    }

    public String getAccountId() {
        return accountId;
    }

    public int getEventCount24h() {
        return eventCount24h;
    }

    public int getErrorCount24h() {
        return errorCount24h;
    }

    public Integer getP95DurationMs() {
        return p95DurationMs;
    }

    public double getRiskScore() {
        return riskScore;
    }

    public String getSummary() {
        return summary;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}

