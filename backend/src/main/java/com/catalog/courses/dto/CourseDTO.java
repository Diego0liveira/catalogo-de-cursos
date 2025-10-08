package com.catalog.courses.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    
    @NotBlank(message = "Título é obrigatório")
    private String titulo;
    
    private String categoria;
    
    @Min(value = 1, message = "Carga horária deve ser maior que zero")
    private int cargaHoraria;
}