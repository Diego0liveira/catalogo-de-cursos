package com.catalog.courses.integration;

import com.catalog.courses.model.Course;
import com.catalog.courses.repository.CourseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CourseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        courseRepository.deleteAll();
    }

    @Test
    void createCourse_ShouldPersistCourseInDatabase() throws Exception {
        // Arrange
        Course newCourse = new Course(null, "Spring Boot Fundamentals", "Backend", 50);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCourse)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.titulo", is("Spring Boot Fundamentals")))
                .andExpect(jsonPath("$.categoria", is("Backend")))
                .andExpect(jsonPath("$.cargaHoraria", is(50)));

        // Verify persistence
        assert courseRepository.count() == 1;
        Course savedCourse = courseRepository.findAll().get(0);
        assert savedCourse.getTitulo().equals("Spring Boot Fundamentals");
    }

    @Test
    void getCourses_ShouldReturnAllPersistedCourses() throws Exception {
        // Arrange
        courseRepository.save(new Course(null, "Java Fundamentals", "Programação", 40));
        courseRepository.save(new Course(null, "Angular Basics", "Frontend", 35));

        // Act & Assert
        mockMvc.perform(get("/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].titulo", is("Java Fundamentals")))
                .andExpect(jsonPath("$[1].titulo", is("Angular Basics")));
    }

    @Test
    void searchCourses_ShouldReturnFilteredResults() throws Exception {
        // Arrange
        courseRepository.save(new Course(null, "Java Fundamentals", "Programação", 40));
        courseRepository.save(new Course(null, "JavaScript Basics", "Frontend", 30));
        courseRepository.save(new Course(null, "Python Intro", "Programação", 25));

        // Act & Assert - Search for "Java"
        mockMvc.perform(get("/courses").param("q", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].titulo", is("Java Fundamentals")))
                .andExpect(jsonPath("$[1].titulo", is("JavaScript Basics")));
    }

    @Test
    void searchCourses_ShouldBeCaseInsensitive() throws Exception {
        // Arrange
        courseRepository.save(new Course(null, "Java Fundamentals", "Programação", 40));
        courseRepository.save(new Course(null, "Angular Basics", "Frontend", 35));

        // Act & Assert - Search with different cases
        mockMvc.perform(get("/courses").param("q", "java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo", is("Java Fundamentals")));

        mockMvc.perform(get("/courses").param("q", "ANGULAR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titulo", is("Angular Basics")));
    }

    @Test
    void createCourse_ShouldReturnValidationError_WhenDataIsInvalid() throws Exception {
        // Arrange
        Course invalidCourse = new Course(null, "", "Programação", 0);

        // Act & Assert
        mockMvc.perform(post("/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCourse)))
                .andExpect(status().isBadRequest());

        // Verify no course was persisted
        assert courseRepository.count() == 0;
    }

    @Test
    void searchCourses_ShouldReturnEmptyList_WhenNoMatchesFound() throws Exception {
        // Arrange
        courseRepository.save(new Course(null, "Java Fundamentals", "Programação", 40));

        // Act & Assert
        mockMvc.perform(get("/courses").param("q", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}