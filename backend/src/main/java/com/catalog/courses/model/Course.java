package com.catalog.courses.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entidade que representa um curso no catálogo")
public class Course {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único do curso", example = "1")
    private Long id;
    
    @NotBlank(message = "Título é obrigatório")
    @Schema(description = "Título do curso", example = "Java Fundamentals", required = true)
    private String titulo;
    
    @Schema(description = "Categoria do curso", example = "Programação")
    private String categoria;
    
    @Min(value = 1, message = "Carga horária deve ser maior que zero")
    @Schema(description = "Carga horária do curso em horas", example = "40", minimum = "1")
    private int cargaHoraria;
}