package com.launchops.api.accounts;

import java.time.Instant;
import java.util.UUID;

public record AccountHealthResponse(
        UUID id,
        String accountId,
        int eventCount24h,
        int errorCount24h,
        Integer p95DurationMs,
        double riskScore,
        String summary,
        Instant updatedAt
) {
    public static AccountHealthResponse from(AccountHealth accountHealth) {
        return new AccountHealthResponse(
                accountHealth.getId(),
                accountHealth.getAccountId(),
                accountHealth.getEventCount24h(),
                accountHealth.getErrorCount24h(),
                accountHealth.getP95DurationMs(),
                accountHealth.getRiskScore(),
                accountHealth.getSummary(),
                accountHealth.getUpdatedAt()
        );
    }
}

