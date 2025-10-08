package com.catalog.courses.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class CourseEventListener {

    private final List<CourseCreatedEvent> events = new ArrayList<>();

    @EventListener
    public void handleCourseCreatedEvent(CourseCreatedEvent event) {
        log.info("Curso criado: {}", event.getCourse().getTitulo());
        events.add(event);
    }

    public List<CourseCreatedEvent> getEvents() {
        return events;
    }
}