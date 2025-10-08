import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CourseFormComponent } from './course-form.component';
import { CourseService } from '../../services/course.service';
import { SeoService } from '../../services/seo.service';
import { Course } from '../../models/course.model';

describe('CourseFormComponent', () => {
  let component: CourseFormComponent;
  let fixture: ComponentFixture<CourseFormComponent>;
  let courseService: CourseService;
  let router: Router;
  let seoService: SeoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'courses', component: CourseFormComponent }
        ]),
        HttpClientTestingModule,
        ReactiveFormsModule,
        CourseFormComponent
      ],
      providers: [
        CourseService,
        SeoService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseFormComponent);
    component = fixture.componentInstance;
    courseService = TestBed.inject(CourseService);
    router = TestBed.inject(Router);
    seoService = TestBed.inject(SeoService);

    spyOn(seoService, 'updateTitle');
    spyOn(seoService, 'updateMetaTags');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    fixture.detectChanges();
    expect(component.courseForm.get('titulo')?.value).toBe('');
    expect(component.courseForm.get('categoria')?.value).toBe('');
    expect(component.courseForm.get('cargaHoraria')?.value).toBe('');
    expect(seoService.updateTitle).toHaveBeenCalledWith('Novo Curso');
    expect(seoService.updateMetaTags).toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    fixture.detectChanges();
    const form = component.courseForm;
    expect(form.valid).toBeFalsy();
    expect(form.get('titulo')?.errors?.['required']).toBeTruthy();
    expect(form.get('categoria')?.errors?.['required']).toBeTruthy();
    expect(form.get('cargaHoraria')?.errors?.['required']).toBeTruthy();
  });

  it('should validate minimum carga horaria', () => {
    fixture.detectChanges();
    const cargaHorariaControl = component.courseForm.get('cargaHoraria');
    cargaHorariaControl?.setValue(0);
    expect(cargaHorariaControl?.errors?.['min']).toBeTruthy();
    cargaHorariaControl?.setValue(1);
    expect(cargaHorariaControl?.errors?.['min']).toBeFalsy();
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    spyOn(courseService, 'createCourse');
    component.onSubmit();
    expect(courseService.createCourse).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', fakeAsync(() => {
    fixture.detectChanges();
    const mockCourse: Course = {
      id: 1,
      titulo: 'Angular Course',
      categoria: 'Frontend',
      cargaHoraria: 40
    };

    const spy = spyOn(courseService, 'createCourse').and.returnValue(of(mockCourse));
    spyOn(router, 'navigate');

    component.courseForm.setValue({
      titulo: mockCourse.titulo,
      categoria: mockCourse.categoria,
      cargaHoraria: mockCourse.cargaHoraria
    });
    component.onSubmit();
    tick();

    expect(spy).toHaveBeenCalledWith({
      titulo: mockCourse.titulo,
      categoria: mockCourse.categoria,
      cargaHoraria: mockCourse.cargaHoraria
    });
    expect(component.success).toBeTrue();
    expect(component.loading).toBeFalse();
  }));

  it('should handle form submission error', fakeAsync(() => {
    fixture.detectChanges();
    const mockCourse = {
      titulo: 'Angular Course',
      categoria: 'Frontend',
      cargaHoraria: 40
    };

    spyOn(courseService, 'createCourse').and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.courseForm.setValue(mockCourse);
    component.onSubmit();
    tick();

    expect(component.error).toBe('Erro ao salvar curso. Tente novamente.');
    expect(component.loading).toBeFalse();
    expect(component.success).toBeFalse();
  }));

  it('should set loading state during form submission', fakeAsync(() => {
    fixture.detectChanges();
    const mockCourse: Course = {
      id: 1,
      titulo: 'Angular Course',
      categoria: 'Frontend',
      cargaHoraria: 40
    };

    spyOn(courseService, 'createCourse').and.returnValue(of(mockCourse));
    component.courseForm.setValue({
      titulo: mockCourse.titulo,
      categoria: mockCourse.categoria,
      cargaHoraria: mockCourse.cargaHoraria
    });

    expect(component.loading).toBeFalse();
    component.onSubmit();
    expect(component.loading).toBeTrue();
    tick();
  }));

  it('should reset form', () => {
    fixture.detectChanges();
    component.courseForm.setValue({
      titulo: 'Test Course',
      categoria: 'Test',
      cargaHoraria: 10
    });
    component.error = 'Test error';
    component.success = true;

    component.resetForm();

    expect(component.courseForm.get('titulo')?.value).toBe('');
    expect(component.courseForm.get('categoria')?.value).toBe('');
    expect(component.courseForm.get('cargaHoraria')?.value).toBe('');
    expect(component.error).toBe('');
    expect(component.success).toBeFalse();
  });
});