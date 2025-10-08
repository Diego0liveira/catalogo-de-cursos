import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="site-header">
      <div class="container d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <img src="assets/logo-technova.svg" alt="TechNova Academy" class="logo" />
          <a class="brand" routerLink="/courses">TechNova Academy</a>
        </div>
        <span class="tagline">Aprenda, evolua, conquiste.</span>
      </div>
    </header>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'Catálogo de Cursos';
}