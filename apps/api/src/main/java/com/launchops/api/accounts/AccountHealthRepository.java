package com.launchops.api.accounts;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountHealthRepository extends JpaRepository<AccountHealth, UUID> {
    List<AccountHealth> findByProjectIdOrderByRiskScoreDesc(UUID projectId);
}

