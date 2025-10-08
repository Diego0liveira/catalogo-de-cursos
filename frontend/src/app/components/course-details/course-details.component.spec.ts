import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CourseDetailsComponent } from './course-details.component';
import { CourseService } from '../../services/course.service';
import { SeoService } from '../../services/seo.service';

describe('CourseDetailsComponent', () => {
  let component: CourseDetailsComponent;
  let fixture: ComponentFixture<CourseDetailsComponent>;
  let courseService: CourseService;
  let seoService: SeoService;
  let router: Router;
  let route: ActivatedRoute;

  const mockCourse = {
    id: 1,
    titulo: 'Angular Avançado',
    categoria: 'Frontend',
    cargaHoraria: 60
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        CourseDetailsComponent
      ],
      providers: [
        CourseService,
        SeoService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseDetailsComponent);
    component = fixture.componentInstance;
    courseService = TestBed.inject(CourseService);
    seoService = TestBed.inject(SeoService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    spyOn(seoService, 'updateTitle');
    spyOn(seoService, 'updateMetaTags');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load course from state if available', () => {
    // Mock history.state
    Object.defineProperty(window.history, 'state', {
      value: { course: mockCourse },
      writable: true
    });

    fixture.detectChanges();

    expect(component.course).toEqual(mockCourse);
    expect(component.loading).toBeFalse();
    expect(seoService.updateTitle).toHaveBeenCalledWith(mockCourse.titulo);
    expect(seoService.updateMetaTags).toHaveBeenCalled();
  });

  it('should load course from API if not in state', () => {
    // Clear history.state
    Object.defineProperty(window.history, 'state', {
      value: {},
      writable: true
    });

    spyOn(courseService, 'getCourse').and.returnValue(of(mockCourse));

    fixture.detectChanges();

    expect(courseService.getCourse).toHaveBeenCalledWith(1);
    expect(component.course).toEqual(mockCourse);
    expect(component.loading).toBeFalse();
    expect(seoService.updateTitle).toHaveBeenCalledWith(mockCourse.titulo);
    expect(seoService.updateMetaTags).toHaveBeenCalled();
  });

  it('should handle invalid course ID', () => {
    // Mock invalid ID
    TestBed.inject(ActivatedRoute).snapshot.paramMap.get = () => 'invalid';

    fixture.detectChanges();

    expect(component.error).toBe('ID de curso inválido.');
    expect(component.loading).toBeFalse();
  });

  it('should handle API error when no state course', () => {
    // Clear history.state
    Object.defineProperty(window.history, 'state', {
      value: {},
      writable: true
    });

    spyOn(courseService, 'getCourse').and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();

    expect(component.error).toBe('Não foi possível carregar os detalhes do curso.');
    expect(component.loading).toBeFalse();
  });

  it('should navigate back to courses list', () => {
    spyOn(router, 'navigate');

    component.voltar();

    expect(router.navigate).toHaveBeenCalledWith(['/courses']);
  });
});