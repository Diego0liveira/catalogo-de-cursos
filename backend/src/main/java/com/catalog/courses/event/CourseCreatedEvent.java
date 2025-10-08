package com.catalog.courses.event;

import com.catalog.courses.model.Course;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class CourseCreatedEvent extends ApplicationEvent {
    private final Course course;

    public CourseCreatedEvent(Object source, Course course) {
        super(source);
        this.course = course;
    }
}