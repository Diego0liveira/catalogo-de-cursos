package com.catalog.courses.event;

import com.catalog.courses.model.Course;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith({MockitoExtension.class, OutputCaptureExtension.class})
class CourseEventListenerTest {

    @InjectMocks
    private CourseEventListener courseEventListener;

    private Course sampleCourse;

    @BeforeEach
    void setUp() {
        sampleCourse = new Course(1L, "Java Fundamentals", "Programação", 40);
    }

    @Test
    void handleCourseCreated_ShouldLogCourseCreation(CapturedOutput output) {
        // Arrange
        CourseCreatedEvent event = new CourseCreatedEvent(this, sampleCourse);

        // Act
        courseEventListener.handleCourseCreatedEvent(event);

        // Assert
        assertThat(output.getOut()).contains("Curso criado: Java Fundamentals");
    }

    @Test
    void handleCourseCreated_ShouldAddEventToList(CapturedOutput output) {
        // Arrange
        CourseCreatedEvent event = new CourseCreatedEvent(this, sampleCourse);

        // Act
        courseEventListener.handleCourseCreatedEvent(event);

        // Assert
        assertThat(courseEventListener.getEvents()).hasSize(1);
        assertThat(courseEventListener.getEvents().get(0).getCourse()).isEqualTo(sampleCourse);
    }

    @Test
    void handleCourseCreated_ShouldHandleCourseWithNullTitle(CapturedOutput output) {
        // Arrange
        Course courseWithNullTitle = new Course(1L, null, "Programação", 40);
        CourseCreatedEvent event = new CourseCreatedEvent(this, courseWithNullTitle);

        // Act
        courseEventListener.handleCourseCreatedEvent(event);

        // Assert
        assertThat(output.getOut()).contains("Curso criado: null");
    }
}