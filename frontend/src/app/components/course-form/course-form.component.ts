import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CourseFormComponent implements OnInit {
  courseForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private seoService: SeoService
  ) {
    this.courseForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', [Validators.required]],
      cargaHoraria: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.setupSeoTags();
  }

  private setupSeoTags(): void {
    this.seoService.updateTitle('Novo Curso');
    this.seoService.updateMetaTags({
      title: 'Novo Curso | TechNova Academy',
      description: 'Cadastre um novo curso na plataforma TechNova Academy.',
      url: 'https://technova-academy.com/courses/new'
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.courseForm.invalid || this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    const course: Course = this.courseForm.value;

    this.courseService.createCourse(course)
      .subscribe({
        next: () => {
          this.success = true;
          // Reset inputs but preserve success state for post-submit feedback
          this.courseForm.reset({
            titulo: '',
            categoria: '',
            cargaHoraria: ''
          });
          this.error = '';
          setTimeout(() => {
            this.loading = false;
            this.router.navigate(['/courses']);
          }, 0);
        },
        error: () => {
          this.error = 'Erro ao salvar curso. Tente novamente.';
          this.loading = false;
        }
      });
  }

  resetForm(): void {
    this.courseForm.reset({
      titulo: '',
      categoria: '',
      cargaHoraria: ''
    });
    this.error = '';
    this.success = false;
  }

  get f() {
    return this.courseForm.controls as any;
  }
}