import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CourseService } from './course.service';
import { Course } from '../models/course.model';

describe('CourseService', () => {
  let service: CourseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CourseService]
    });
    service = TestBed.inject(CourseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get courses', () => {
    const mockCourses: Course[] = [
      { id: 1, titulo: 'Java Básico', categoria: 'Programação', cargaHoraria: 40 },
      { id: 2, titulo: 'Angular Avançado', categoria: 'Frontend', cargaHoraria: 60 }
    ];

    service.getCourses().subscribe(courses => {
      expect(courses.length).toBe(2);
      expect(courses).toEqual(mockCourses);
    });

    const req = httpMock.expectOne('/api/courses');
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should create a course', () => {
    const mockCourse: Course = { titulo: 'Novo Curso', categoria: 'Teste', cargaHoraria: 30 };
    const mockResponse: Course = { id: 3, ...mockCourse };

    service.createCourse(mockCourse).subscribe(course => {
      expect(course).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/courses');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCourse);
    req.flush(mockResponse);
  });

  it('should get courses with search query', () => {
    const mockCourses: Course[] = [
      { id: 1, titulo: 'Java Básico', categoria: 'Programação', cargaHoraria: 40 }
    ];
    const searchQuery = 'Java';

    service.getCourses(searchQuery).subscribe(courses => {
      expect(courses.length).toBe(1);
      expect(courses).toEqual(mockCourses);
    });

    const req = httpMock.expectOne(`/api/courses?q=${encodeURIComponent(searchQuery)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should handle empty search query', () => {
    const mockCourses: Course[] = [
      { id: 1, titulo: 'Java Básico', categoria: 'Programação', cargaHoraria: 40 },
      { id: 2, titulo: 'Angular Avançado', categoria: 'Frontend', cargaHoraria: 60 }
    ];

    service.getCourses('').subscribe(courses => {
      expect(courses.length).toBe(2);
      expect(courses).toEqual(mockCourses);
    });

    const req = httpMock.expectOne('/api/courses');
    expect(req.request.method).toBe('GET');
    req.flush(mockCourses);
  });

  it('should handle HTTP error when getting courses', () => {
    service.getCourses().subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('/api/courses');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle HTTP error when creating course', () => {
    const mockCourse: Course = { titulo: 'Novo Curso', categoria: 'Teste', cargaHoraria: 30 };

    service.createCourse(mockCourse).subscribe({
      next: () => fail('Expected an error'),
      error: (error) => {
        expect(error.status).toBe(400);
      }
    });

    const req = httpMock.expectOne('/api/courses');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });
});