package com.catalog.courses.controller;

import com.catalog.courses.event.CourseCreatedEvent;
import com.catalog.courses.event.CourseEventListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final CourseEventListener eventListener;

    @Autowired
    public EventController(CourseEventListener eventListener) {
        this.eventListener = eventListener;
    }

    @GetMapping
    public List<CourseCreatedEvent> getEvents() {
        return eventListener.getEvents();
    }
}