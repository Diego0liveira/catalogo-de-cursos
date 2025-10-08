package com.catalog.courses.service;

import com.catalog.courses.event.CourseCreatedEvent;
import com.catalog.courses.model.Course;
import com.catalog.courses.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private CourseService courseService;

    private Course sampleCourse;
    private Course savedCourse;

    @BeforeEach
    void setUp() {
        sampleCourse = new Course(null, "Java Básico", "Programação", 40);
        savedCourse = new Course(1L, "Java Básico", "Programação", 40);
    }

    @Test
    void createCourse_ShouldSaveAndPublishEvent() {
        // Arrange
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);
        
        // Act
        Course result = courseService.createCourse(sampleCourse);
        
        // Assert
        assertThat(result).isEqualTo(savedCourse);
        verify(courseRepository, times(1)).save(sampleCourse);
        
        // Verify event publishing
        ArgumentCaptor<CourseCreatedEvent> eventCaptor = ArgumentCaptor.forClass(CourseCreatedEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());
        
        CourseCreatedEvent capturedEvent = eventCaptor.getValue();
        assertThat(capturedEvent.getCourse()).isEqualTo(savedCourse);
    }

    @Test
    void getAllCourses_ShouldReturnAllCourses() {
        // Arrange
        List<Course> expectedCourses = Arrays.asList(
            new Course(1L, "Java Básico", "Programação", 40),
            new Course(2L, "Angular Avançado", "Frontend", 60)
        );
        when(courseRepository.findAll()).thenReturn(expectedCourses);
        
        // Act
        List<Course> result = courseService.getAllCourses();
        
        // Assert
        assertEquals(expectedCourses, result);
        verify(courseRepository, times(1)).findAll();
    }

    @Test
    void searchCourses_WithQuery_ShouldFilterByTitle() {
        // Arrange
        String query = "Java";
        List<Course> expectedCourses = Arrays.asList(
            new Course(1L, "Java Básico", "Programação", 40)
        );
        when(courseRepository.findByTituloContaining(query)).thenReturn(expectedCourses);
        
        // Act
        List<Course> result = courseService.searchCourses(query);
        
        // Assert
        assertThat(result).isEqualTo(expectedCourses);
        verify(courseRepository, times(1)).findByTituloContaining(query);
        verify(courseRepository, never()).findAll();
    }

    @Test
    void searchCourses_WithNullQuery_ShouldReturnAllCourses() {
        // Arrange
        List<Course> allCourses = Arrays.asList(
            new Course(1L, "Java Básico", "Programação", 40),
            new Course(2L, "Angular Avançado", "Frontend", 60)
        );
        when(courseRepository.findAll()).thenReturn(allCourses);
        
        // Act
        List<Course> result = courseService.searchCourses(null);
        
        // Assert
        assertThat(result).isEqualTo(allCourses);
        verify(courseRepository, times(1)).findAll();
        verify(courseRepository, never()).findByTituloContaining(any());
    }

    @Test
    void searchCourses_WithEmptyQuery_ShouldReturnAllCourses() {
        // Arrange
        List<Course> allCourses = Arrays.asList(
            new Course(1L, "Java Básico", "Programação", 40),
            new Course(2L, "Angular Avançado", "Frontend", 60)
        );
        when(courseRepository.findAll()).thenReturn(allCourses);
        
        // Act
        List<Course> result = courseService.searchCourses("");
        
        // Assert
        assertThat(result).isEqualTo(allCourses);
        verify(courseRepository, times(1)).findAll();
        verify(courseRepository, never()).findByTituloContaining(any());
    }

    @Test
    void searchCourses_WithQuery_ShouldReturnEmptyListWhenNoMatches() {
        // Arrange
        String query = "NonExistent";
        when(courseRepository.findByTituloContaining(query)).thenReturn(Collections.emptyList());
        
        // Act
        List<Course> result = courseService.searchCourses(query);
        
        // Assert
        assertThat(result).isEmpty();
        verify(courseRepository, times(1)).findByTituloContaining(query);
    }

    @Test
    void getAllCourses_ShouldReturnEmptyListWhenNoCourses() {
        // Arrange
        when(courseRepository.findAll()).thenReturn(Collections.emptyList());
        
        // Act
        List<Course> result = courseService.getAllCourses();
        
        // Assert
        assertThat(result).isEmpty();
        verify(courseRepository, times(1)).findAll();
    }
}