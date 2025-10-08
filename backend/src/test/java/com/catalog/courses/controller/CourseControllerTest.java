package com.catalog.courses.controller;

import com.catalog.courses.model.Course;
import com.catalog.courses.service.CourseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CourseController.class)
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseService courseService;

    @Autowired
    private ObjectMapper objectMapper;

    private Course sampleCourse;
    private Course savedCourse;

    @BeforeEach
    void setUp() {
        sampleCourse = new Course(null, "Java Fundamentals", "Programação", 40);
        savedCourse = new Course(1L, "Java Fundamentals", "Programação", 40);
    }

    @Test
    void createCourse_ShouldReturnCreatedCourse() throws Exception {
        // Arrange
        when(courseService.createCourse(any(Course.class))).thenReturn(savedCourse);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sampleCourse)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.titulo", is("Java Fundamentals")))
                .andExpect(jsonPath("$.categoria", is("Programação")))
                .andExpect(jsonPath("$.cargaHoraria", is(40)));
    }

    @Test
    void createCourse_ShouldReturnBadRequest_WhenTituloIsBlank() throws Exception {
        // Arrange
        Course invalidCourse = new Course(null, "", "Programação", 40);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCourse)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCourse_ShouldReturnBadRequest_WhenCargaHorariaIsZero() throws Exception {
        // Arrange
        Course invalidCourse = new Course(null, "Java Fundamentals", "Programação", 0);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCourse)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getCourses_ShouldReturnAllCourses_WhenNoQueryProvided() throws Exception {
        // Arrange
        List<Course> courses = Arrays.asList(
                new Course(1L, "Java Fundamentals", "Programação", 40),
                new Course(2L, "Angular Basics", "Frontend", 35)
        );
        when(courseService.searchCourses(null)).thenReturn(courses);

        // Act & Assert
        mockMvc.perform(get("/courses"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].titulo", is("Java Fundamentals")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].titulo", is("Angular Basics")));
    }

    @Test
    void getCourses_ShouldReturnFilteredCourses_WhenQueryProvided() throws Exception {
        // Arrange
        List<Course> filteredCourses = Arrays.asList(
                new Course(1L, "Java Fundamentals", "Programação", 40)
        );
        when(courseService.searchCourses(eq("Java"))).thenReturn(filteredCourses);

        // Act & Assert
        mockMvc.perform(get("/courses").param("q", "Java"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].titulo", is("Java Fundamentals")));
    }

    @Test
    void getCourses_ShouldReturnEmptyList_WhenNoCoursesFound() throws Exception {
        // Arrange
        when(courseService.searchCourses(eq("NonExistent"))).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/courses").param("q", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void createCourse_ShouldReturnBadRequest_WhenTituloIsNull() throws Exception {
        // Arrange
        Course invalidCourse = new Course(null, null, "Programação", 40);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCourse)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCourse_ShouldReturnBadRequest_WhenCargaHorariaIsNegative() throws Exception {
        // Arrange
        Course invalidCourse = new Course(null, "Java Fundamentals", "Programação", -5);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCourse)))
                .andExpect(status().isBadRequest());
    }
}