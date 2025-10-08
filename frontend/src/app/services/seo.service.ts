import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title
  ) {}

  updateTitle(title: string) {
    this.title.setTitle(`${title} | TechNova Academy`);
  }

  updateMetaTags(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }) {
    const defaults = {
      title: 'TechNova Academy - Cursos de Tecnologia',
      description: 'Aprenda tecnologia com os melhores cursos online. Desenvolvimento, programação, design e muito mais.',
      image: '/assets/logo-technova.svg',
      url: 'https://technova-academy.com'
    };

    const tags = { ...defaults, ...config };

    this.meta.updateTag({ name: 'description', content: tags.description });
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: tags.title });
    this.meta.updateTag({ property: 'og:description', content: tags.description });
    this.meta.updateTag({ property: 'og:image', content: tags.image });
    this.meta.updateTag({ property: 'og:url', content: tags.url });
    
    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: tags.title });
    this.meta.updateTag({ name: 'twitter:description', content: tags.description });
    this.meta.updateTag({ name: 'twitter:image', content: tags.image });
  }
}