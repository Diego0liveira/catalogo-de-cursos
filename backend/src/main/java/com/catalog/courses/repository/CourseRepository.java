package com.catalog.courses.repository;

import com.catalog.courses.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    @Query("SELECT c FROM Course c WHERE UPPER(c.titulo) LIKE UPPER(CONCAT('%', :query, '%'))")
    List<Course> findByTituloContaining(@Param("query") String query);
}