package com.launchops.api.events;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class EventStreamService {
    private static final long THIRTY_MINUTES = 30L * 60L * 1000L;

    private final Map<UUID, CopyOnWriteArrayList<SseEmitter>> emittersByProject = new ConcurrentHashMap<>();

    public SseEmitter subscribe(UUID projectId) {
        var emitter = new SseEmitter(THIRTY_MINUTES);
        emittersByProject.computeIfAbsent(projectId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(projectId, emitter));
        emitter.onTimeout(() -> remove(projectId, emitter));
        emitter.onError(ignored -> remove(projectId, emitter));

        send(projectId, emitter, "connected", Map.of("connected", true));
        return emitter;
    }

    public void publish(UUID projectId, ProductEventResponse event) {
        var emitters = emittersByProject.get(projectId);
        if (emitters == null) {
            return;
        }

        for (var emitter : emitters) {
            send(projectId, emitter, "product-event", event);
        }
    }

    private void send(UUID projectId, SseEmitter emitter, String name, Object data) {
        try {
            emitter.send(SseEmitter.event().name(name).data(data));
        } catch (IOException | IllegalStateException ignored) {
            remove(projectId, emitter);
        }
    }

    private void remove(UUID projectId, SseEmitter emitter) {
        var emitters = emittersByProject.get(projectId);
        if (emitters == null) {
            return;
        }

        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByProject.remove(projectId, emitters);
        }
    }
}
