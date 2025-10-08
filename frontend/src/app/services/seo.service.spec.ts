import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: jasmine.SpyObj<Title>;
  let metaService: jasmine.SpyObj<Meta>;

  beforeEach(() => {
    const titleSpy = jasmine.createSpyObj('Title', ['setTitle']);
    const metaSpy = jasmine.createSpyObj('Meta', ['updateTag']);

    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy }
      ]
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
    metaService = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update title with site name', () => {
    service.updateTitle('Test Title');
    expect(titleService.setTitle).toHaveBeenCalledWith('Test Title | TechNova Academy');
  });

  it('should update meta tags with defaults when no config provided', () => {
    service.updateMetaTags({});

    expect(metaService.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'Aprenda tecnologia com os melhores cursos online. Desenvolvimento, programação, design e muito mais.'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:title',
      content: 'TechNova Academy - Cursos de Tecnologia'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:description',
      content: 'Aprenda tecnologia com os melhores cursos online. Desenvolvimento, programação, design e muito mais.'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:image',
      content: '/assets/logo-technova.svg'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:url',
      content: 'https://technova-academy.com'
    });
  });

  it('should update meta tags with provided config', () => {
    const config = {
      title: 'Custom Title',
      description: 'Custom Description',
      image: 'custom-image.jpg',
      url: 'https://example.com'
    };

    service.updateMetaTags(config);

    expect(metaService.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: 'Custom Description'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:title',
      content: 'Custom Title'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:description',
      content: 'Custom Description'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:image',
      content: 'custom-image.jpg'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      property: 'og:url',
      content: 'https://example.com'
    });
  });

  it('should update twitter card meta tags', () => {
    const config = {
      title: 'Custom Title',
      description: 'Custom Description',
      image: 'custom-image.jpg'
    };

    service.updateMetaTags(config);

    expect(metaService.updateTag).toHaveBeenCalledWith({
      name: 'twitter:card',
      content: 'summary_large_image'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      name: 'twitter:title',
      content: 'Custom Title'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      name: 'twitter:description',
      content: 'Custom Description'
    });

    expect(metaService.updateTag).toHaveBeenCalledWith({
      name: 'twitter:image',
      content: 'custom-image.jpg'
    });
  });
});