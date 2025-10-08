package com.catalog.courses.repository;

import com.catalog.courses.model.Course;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Sql(statements = "DELETE FROM course", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class CourseRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CourseRepository courseRepository;

    private Course course1;
    private Course course2;
    private Course course3;

    @BeforeEach
    void setUp() {
        course1 = new Course(null, "Java Fundamentals", "Programação", 40);
        course2 = new Course(null, "Advanced Java", "Programação", 60);
        course3 = new Course(null, "Python Basics", "Programação", 35);

        entityManager.persistAndFlush(course1);
        entityManager.persistAndFlush(course2);
        entityManager.persistAndFlush(course3);
    }

    @Test
    void findByTituloContaining_ShouldReturnMatchingCourses_CaseInsensitive() {
        // Act
        List<Course> result = courseRepository.findByTituloContaining("java");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Course::getTitulo)
                .containsExactlyInAnyOrder("Java Fundamentals", "Advanced Java");
    }

    @Test
    void findByTituloContaining_ShouldReturnMatchingCourses_UpperCase() {
        // Act
        List<Course> result = courseRepository.findByTituloContaining("JAVA");

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result).extracting(Course::getTitulo)
                .containsExactlyInAnyOrder("Java Fundamentals", "Advanced Java");
    }

    @Test
    void findByTituloContaining_ShouldReturnMatchingCourses_PartialMatch() {
        // Act
        List<Course> result = courseRepository.findByTituloContaining("Fund");

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitulo()).isEqualTo("Java Fundamentals");
    }

    @Test
    void findByTituloContaining_ShouldReturnEmptyList_WhenNoMatch() {
        // Act
        List<Course> result = courseRepository.findByTituloContaining("NonExistent");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void findAll_ShouldReturnAllCourses() {
        // Act
        List<Course> result = courseRepository.findAll();

        // Assert
        assertThat(result).hasSize(3);
        assertThat(result).extracting(Course::getTitulo)
                .containsExactlyInAnyOrder("Java Fundamentals", "Advanced Java", "Python Basics");
    }

    @Test
    void save_ShouldPersistCourse() {
        // Arrange
        Course newCourse = new Course(null, "React Basics", "Frontend", 30);

        // Act
        Course savedCourse = courseRepository.save(newCourse);

        // Assert
        assertThat(savedCourse.getId()).isNotNull();
        assertThat(savedCourse.getTitulo()).isEqualTo("React Basics");
        assertThat(savedCourse.getCategoria()).isEqualTo("Frontend");
        assertThat(savedCourse.getCargaHoraria()).isEqualTo(30);

        // Verify it's actually persisted
        Course foundCourse = entityManager.find(Course.class, savedCourse.getId());
        assertThat(foundCourse).isNotNull();
        assertThat(foundCourse.getTitulo()).isEqualTo("React Basics");
    }
}