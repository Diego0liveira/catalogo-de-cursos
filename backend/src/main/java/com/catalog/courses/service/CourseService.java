package com.catalog.courses.service;

import com.catalog.courses.event.CourseCreatedEvent;
import com.catalog.courses.model.Course;
import com.catalog.courses.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    public CourseService(CourseRepository courseRepository, ApplicationEventPublisher eventPublisher) {
        this.courseRepository = courseRepository;
        this.eventPublisher = eventPublisher;
    }

    public Course createCourse(Course course) {
        Course savedCourse = courseRepository.save(course);
        eventPublisher.publishEvent(new CourseCreatedEvent(this, savedCourse));
        return savedCourse;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> searchCourses(String query) {
        if (query == null || query.isEmpty()) {
            return getAllCourses();
        }
        return courseRepository.findByTituloContaining(query);
    }

    public Optional<Course> findCourseById(Long id) {
        return courseRepository.findById(id);
    }
}