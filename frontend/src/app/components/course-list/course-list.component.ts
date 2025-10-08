import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class CourseListComponent implements OnInit {
  allCourses: Course[] = [];
  displayedCourses: Course[] = [];
  searchTerm = '';
  loading = false;
  loadingMore = false;
  error = '';
  pageSize = 12;
  currentPage = 0;
  hasMoreCourses = false;
  private searchTerms = new Subject<string>();

  constructor(
    private courseService: CourseService,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.setupSeoTags();
    this.loadCourses();
    
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.loading = true;
        this.resetPagination();
        return this.courseService.getCourses(term);
      })
    ).subscribe({
      next: (courses) => {
        this.allCourses = courses;
        this.updateDisplayedCourses();
        this.error = '';
        this.updateSearchSeoTags();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar cursos. Tente novamente.';
        this.loading = false;
      }
    });
  }

  private setupSeoTags(): void {
    this.seoService.updateTitle('Catálogo de Cursos');
    this.seoService.updateMetaTags({
      title: 'Catálogo de Cursos | TechNova Academy',
      description: 'Explore nossa seleção de cursos de tecnologia. Desenvolvimento, programação, design e muito mais.',
      url: 'https://technova-academy.com/courses'
    });
  }

  private updateSearchSeoTags(): void {
    if (this.searchTerm) {
      this.seoService.updateTitle(`Busca: ${this.searchTerm}`);
      this.seoService.updateMetaTags({
        title: `Resultados para "${this.searchTerm}" | TechNova Academy`,
        description: `Cursos relacionados a "${this.searchTerm}". Encontre o curso perfeito para você.`,
        url: `https://technova-academy.com/courses?search=${encodeURIComponent(this.searchTerm)}`
      });
    }
  }

  loadCourses(): void {
    this.loading = true;
    this.resetPagination();
    this.courseService.getCourses()
      .subscribe({
        next: (courses) => {
          this.allCourses = courses;
          this.updateDisplayedCourses();
          this.loading = false;
        },
        error: () => {
          this.error = 'Erro ao carregar cursos. Tente novamente.';
          this.loading = false;
        }
      });
  }

  search(term: string): void {
    this.searchTerm = term;
    // Execute immediate search to support callers before ngOnInit (e.g., unit tests)
    this.loading = true;
    this.resetPagination();
    this.courseService.getCourses(term)
      .subscribe({
        next: (courses) => {
          this.allCourses = courses;
          this.updateDisplayedCourses();
          this.error = '';
          this.updateSearchSeoTags();
          this.loading = false;
        },
        error: () => {
          this.error = 'Erro ao carregar cursos. Tente novamente.';
          this.loading = false;
        }
      });

    // Also emit to the debounced stream for subsequent updates after init
    this.searchTerms.next(term);
  }

  loadMoreCourses(): void {
    if (!this.hasMoreCourses || this.loadingMore) return;
    
    this.loadingMore = true;
    this.currentPage++;
    
    this.updateDisplayedCourses();
    this.loadingMore = false;
  }

  private resetPagination(): void {
    this.currentPage = 0;
    this.displayedCourses = [];
    this.hasMoreCourses = false;
  }

  private updateDisplayedCourses(): void {
    const startIndex = 0;
    const endIndex = (this.currentPage + 1) * this.pageSize;
    
    this.displayedCourses = this.allCourses.slice(startIndex, endIndex);
    this.hasMoreCourses = endIndex < this.allCourses.length;
  }
}