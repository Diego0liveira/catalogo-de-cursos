import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { SeoService } from '../../services/seo.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class CourseDetailsComponent implements OnInit {
  course?: Course;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    const stateCourse = (history.state && (history.state as { course?: Course }).course) || undefined;
    if (stateCourse) {
      this.course = stateCourse;
      this.loading = false;
      this.updateSeoTags(stateCourse);
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (isNaN(id)) {
      this.error = 'ID de curso inválido.';
      this.loading = false;
      return;
    }

    this.courseService.getCourse(id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (c) => {
          this.course = c;
          this.updateSeoTags(c);
        },
        error: () => {
          // Se veio via estado de navegação, mantém os dados e não exibe erro.
          if (!this.course) {
            this.error = 'Não foi possível carregar os detalhes do curso.';
          }
        }
      });
  }

  private updateSeoTags(course: Course): void {
    this.seoService.updateTitle(course.titulo);
    this.seoService.updateMetaTags({
      title: course.titulo,
      description: `Curso de ${course.titulo} - ${course.categoria} com ${course.cargaHoraria}h de duração.`,
      url: `https://technova-academy.com/courses/${course.id}`
    });
  }

  voltar(): void {
    this.router.navigate(['/courses']);
  }
}