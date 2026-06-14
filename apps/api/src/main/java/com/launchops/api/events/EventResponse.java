package com.launchops.api.events;

import java.util.UUID;

public record EventResponse(UUID id, boolean accepted) {
}

