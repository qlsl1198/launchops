package com.launchops.api.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.launchops.api.auth.AppUser;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final Algorithm algorithm;
    private final String issuer;
    private final long ttlMinutes;

    public JwtService(
            @Value("${launchops.jwt-secret}") String secret,
            @Value("${launchops.jwt-issuer}") String issuer,
            @Value("${launchops.jwt-ttl-minutes}") long ttlMinutes
    ) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.issuer = issuer;
        this.ttlMinutes = ttlMinutes;
    }

    public String issue(AppUser user) {
        var now = Instant.now();
        return JWT.create()
                .withIssuer(issuer)
                .withSubject(user.getEmail())
                .withClaim("uid", user.getId().toString())
                .withClaim("role", user.getRole())
                .withIssuedAt(now)
                .withExpiresAt(now.plusSeconds(ttlMinutes * 60))
                .sign(algorithm);
    }

    public DecodedJWT verify(String token) {
        return JWT.require(algorithm)
                .withIssuer(issuer)
                .build()
                .verify(token);
    }
}

