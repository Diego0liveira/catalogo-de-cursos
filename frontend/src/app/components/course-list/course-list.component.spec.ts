import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { CourseListComponent } from './course-list.component';
import { CourseService } from '../../services/course.service';
import { SeoService } from '../../services/seo.service';

describe('CourseListComponent', () => {
  let component: CourseListComponent;
  let fixture: ComponentFixture<CourseListComponent>;
  let courseService: CourseService;
  let seoService: SeoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        BrowserAnimationsModule,
        CourseListComponent
      ],
      providers: [ 
        CourseService,
        SeoService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseListComponent);
    component = fixture.componentInstance;
    courseService = TestBed.inject(CourseService);
    seoService = TestBed.inject(SeoService);

    spyOn(seoService, 'updateTitle');
    spyOn(seoService, 'updateMetaTags');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load courses on init', () => {
    const mockCourses = [
      { id: 1, titulo: 'Java Básico', categoria: 'Programação', cargaHoraria: 40 },
      { id: 2, titulo: 'Angular Avançado', categoria: 'Frontend', cargaHoraria: 60 }
    ];
    
    spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    fixture.detectChanges();
    
    expect(component.allCourses).toEqual(mockCourses);
    expect(component.displayedCourses).toEqual(mockCourses);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('');
    expect(component.hasMoreCourses).toBeFalse();
    expect(seoService.updateTitle).toHaveBeenCalledWith('Catálogo de Cursos');
    expect(seoService.updateMetaTags).toHaveBeenCalled();
  });

  it('should handle error when loading courses', () => {
    const errorMsg = 'Error loading courses';
    spyOn(courseService, 'getCourses').and.returnValue(throwError(() => new Error(errorMsg)));
    
    fixture.detectChanges();
    
    expect(component.allCourses).toEqual([]);
    expect(component.displayedCourses).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Erro ao carregar cursos. Tente novamente.');
  });

  it('should search for courses', fakeAsync(() => {
    const mockCourses = [
      { id: 1, titulo: 'Angular Course', categoria: 'Frontend', cargaHoraria: 40 }
    ];
    
    const spy = spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    component.search('Angular');
    tick(300);
    fixture.detectChanges();
    tick();
    
    expect(spy).toHaveBeenCalledWith('Angular');
    expect(component.allCourses).toEqual(mockCourses);
    expect(component.displayedCourses).toEqual(mockCourses);
    expect(seoService.updateTitle).toHaveBeenCalledWith('Busca: Angular');
    expect(seoService.updateMetaTags).toHaveBeenCalled();
  }));

  it('should clear search and reload all courses', fakeAsync(() => {
    const mockCourses = [
      { id: 1, titulo: 'Course 1', categoria: 'Category 1', cargaHoraria: 30 },
      { id: 2, titulo: 'Course 2', categoria: 'Category 2', cargaHoraria: 40 }
    ];
    
    const spy = spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    component.search('');
    tick(300);
    fixture.detectChanges();
    tick();
    
    expect(spy).toHaveBeenCalledWith('');
    expect(component.allCourses).toEqual(mockCourses);
    expect(component.displayedCourses).toEqual(mockCourses);
  }));

  it('should set loading to true when searching', () => {
    spyOn(courseService, 'getCourses').and.returnValue(of([]));
    
    component.search('test');
    
    expect(component.loading).toBeFalse(); // Should be false after the observable completes
  });

  it('should handle empty search results', fakeAsync(() => {
    spyOn(courseService, 'getCourses').and.returnValue(of([]));
    
    component.search('nonexistent');
    tick(300);
    fixture.detectChanges();
    tick();
    
    expect(component.allCourses).toEqual([]);
    expect(component.displayedCourses).toEqual([]);
    expect(component.loading).toBeFalse();
  }));

  it('should handle search errors', fakeAsync(() => {
    spyOn(courseService, 'getCourses').and.returnValue(throwError(() => new Error('Search error')));
    
    component.search('test');
    tick(300);
    fixture.detectChanges();
    tick();
    
    expect(component.error).toBe('Erro ao carregar cursos. Tente novamente.');
    expect(component.loading).toBeFalse();
  }));

  it('should display first 12 courses initially', () => {
    const mockCourses = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Course ${i + 1}`,
      categoria: 'Category',
      cargaHoraria: 40
    }));
    
    spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    fixture.detectChanges();
    
    expect(component.allCourses.length).toBe(25);
    expect(component.displayedCourses.length).toBe(12);
    expect(component.hasMoreCourses).toBeTrue();
    expect(component.currentPage).toBe(0);
  });

  it('should load more courses when loadMoreCourses is called', () => {
    const mockCourses = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Course ${i + 1}`,
      categoria: 'Category',
      cargaHoraria: 40
    }));
    
    spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    fixture.detectChanges();
    
    expect(component.displayedCourses.length).toBe(12);
    
    component.loadMoreCourses();
    
    expect(component.displayedCourses.length).toBe(24);
    expect(component.currentPage).toBe(1);
    expect(component.hasMoreCourses).toBeTrue();
  });

  it('should show all courses when loading more and no more courses available', () => {
    const mockCourses = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      titulo: `Course ${i + 1}`,
      categoria: 'Category',
      cargaHoraria: 40
    }));
    
    spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    fixture.detectChanges();
    
    expect(component.displayedCourses.length).toBe(12);
    expect(component.hasMoreCourses).toBeTrue();
    
    component.loadMoreCourses();
    
    expect(component.displayedCourses.length).toBe(15);
    expect(component.hasMoreCourses).toBeFalse();
  });

  it('should not load more courses when already loading', () => {
    const mockCourses = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Course ${i + 1}`,
      categoria: 'Category',
      cargaHoraria: 40
    }));
    
    spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    fixture.detectChanges();
    
    component.loadingMore = true;
    const initialPage = component.currentPage;
    
    component.loadMoreCourses();
    
    expect(component.currentPage).toBe(initialPage);
  });

  it('should reset pagination when searching', fakeAsync(() => {
    const mockCourses = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Course ${i + 1}`,
      categoria: 'Category',
      cargaHoraria: 40
    }));
    
    spyOn(courseService, 'getCourses').and.returnValue(of(mockCourses));
    
    fixture.detectChanges();
    
    // Load more courses first
    component.loadMoreCourses();
    
    expect(component.currentPage).toBe(1);
    expect(component.displayedCourses.length).toBe(24);
    
    // Now search - should reset pagination
    component.search('test');
    tick(300);
    fixture.detectChanges();
    tick();
    
    expect(component.currentPage).toBe(0);
    expect(component.displayedCourses.length).toBe(12);
  }));
});