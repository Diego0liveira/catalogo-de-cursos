describe('Course List Tests', () => {
  beforeEach(() => {
    // Intercepts for search endpoints
    cy.intercept('GET', '/api/courses?q=Angular', [
      {
        "id": 2,
        "titulo": "Angular Avançado",
        "categoria": "Frontend",
        "cargaHoraria": 60
      }
    ]).as('searchAngular')
    cy.intercept('GET', '/api/courses?q=Python', [
      {
        "id": 5,
        "titulo": "Python para Data Science",
        "categoria": "Data Science",
        "cargaHoraria": 80
      }
    ]).as('searchPython')
    cy.intercept('GET', '/api/courses?q=NotFound', []).as('searchNotFound')
  })

  it('should display course list on page load with new layout', () => {
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.visit('/courses')
    cy.wait('@getCourses')
    
    // Check page title in header
    cy.get('[data-cy="course-list-header"]').should('be.visible')
    cy.contains('h1', 'Catálogo de Cursos').should('be.visible')
    
    // Check search section
    cy.get('[data-cy="search-section"]').should('be.visible')
    cy.get('input[placeholder="Buscar por título..."]').should('be.visible')
    
    // Check that courses are displayed in grid
    cy.get('[data-cy="course-grid"]').should('be.visible')
    cy.get('.course-card').should('have.length', 5)
    
    // Check specific course details with new layout
    cy.contains('.course-card h5', 'Java Básico').should('be.visible')
    cy.contains('.course-card .badge', 'Programação').should('be.visible')
    cy.contains('.course-card', '40 horas').should('be.visible')
    
    // Check results info
    cy.get('[data-cy="results-info"]').should('contain', 'Exibindo 5 de 5 cursos')
  })

  it('should display loading state with new layout', () => {
    // Intercept with delay to see loading state
    cy.intercept('GET', '/api/courses', { 
      fixture: 'courses.json',
      delay: 1000 
    }).as('getCoursesDelayed')
    
    cy.visit('/courses')
    cy.get('[data-cy="loading-state"]').should('be.visible')
    cy.contains('Carregando cursos...').should('be.visible')
    cy.wait('@getCoursesDelayed')
    cy.get('[data-cy="loading-state"]').should('not.exist')
    cy.contains('Carregando cursos...').should('not.exist')
  })

  it('should search for courses with new layout', () => {
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.visit('/courses')
    cy.wait('@getCourses')
    
    // Search for Angular courses
    cy.get('input[placeholder="Buscar por título..."]').type('Angular')
    cy.wait('@searchAngular')
    
    // Should display only Angular course
    cy.get('.course-card').should('have.length', 1)
    cy.contains('.course-card h5', 'Angular Avançado').should('be.visible')
    cy.contains('.course-card h5', 'Java Básico').should('not.exist')
    
    // Check results info
    cy.get('[data-cy="results-info"]').should('contain', 'Exibindo 1 de 1 cursos')
  })

  it('should search for Python courses with new layout', () => {
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.visit('/courses')
    cy.wait('@getCourses')
    
    // Search for Python courses
    cy.get('input[placeholder="Buscar por título..."]').clear().type('Python')
    cy.wait('@searchPython')
    
    // Should display only Python course
    cy.get('.course-card').should('have.length', 1)
    cy.contains('.course-card h5', 'Python para Data Science').should('be.visible')
    cy.contains('.course-card .badge', 'Data Science').should('be.visible')
    
    // Check results info
    cy.get('[data-cy="results-info"]').should('contain', 'Exibindo 1 de 1 cursos')
  })

  it('should display no results message when search returns empty', () => {
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.visit('/courses')
    cy.wait('@getCourses')
    
    // Search for non-existent course
    cy.get('input[placeholder="Buscar por título..."]').clear().type('NotFound')
    cy.wait('@searchNotFound')
    
    // Should display no results message
    cy.get('[data-cy="empty-state"]').should('be.visible')
    cy.contains('Nenhum curso encontrado').should('be.visible')
    cy.get('.course-card').should('not.exist')
  })

  it('should clear search and show all courses', () => {
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.visit('/courses')
    cy.wait('@getCourses')
    
    // First search for something
    cy.get('input[placeholder="Buscar por título..."]').type('Angular')
    cy.wait('@searchAngular')
    cy.get('.course-card').should('have.length', 1)
    
    // Clear search
    cy.get('input[placeholder="Buscar por título..."]').clear()
    cy.wait('@getCourses')
    
    // Should show all courses again
    cy.get('.course-card').should('have.length', 5)
  })

  it('should have working "Novo Curso" button in header', () => {
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.visit('/courses')
    cy.wait('@getCourses')
    
    // Click on "Novo Curso" button in header
    cy.get('[data-cy="course-list-header"]').within(() => {
      cy.contains('a', 'Novo Curso').click()
    })
    
    // Should navigate to new course form
    cy.url().should('include', '/courses/new')
  })

  it('should handle API error gracefully with new layout', () => {
    // Intercept with error response
    cy.intercept('GET', '/api/courses', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getCoursesError')
    
    cy.visit('/courses')
    cy.wait('@getCoursesError')
    
    // Should display error message
    cy.get('[data-cy="error-state"]').should('be.visible')
    cy.contains('Erro ao carregar cursos').should('be.visible')
    
    // Should not display loading or courses
    cy.get('[data-cy="loading-state"]').should('not.exist')
    cy.contains('Carregando cursos...').should('not.exist')
    cy.get('.course-card').should('not.exist')
  })

  // New pagination tests
  it.only('should display pagination with "Ver mais" button when there are more than 12 courses', () => {
    const largeCourseList = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Curso ${i + 1}`,
      categoria: i % 3 === 0 ? 'Programação' : i % 3 === 1 ? 'Frontend' : 'Data Science',
      cargaHoraria: 40 + (i * 5)
    }))
    cy.intercept('GET', '/api/courses', (req) => {
      // Force reply with large dataset to avoid proxy or wildcard mismatch
      req.reply({ body: largeCourseList })
    }).as('getCoursesLarge')
    cy.visit('/courses')
    cy.wait('@getCoursesLarge', { timeout: 10000 }).its('response.body').should('have.length', 25)
    
    // Should show initial page and load-more button
    cy.get('[data-cy="load-more-button"]').should('exist')
    
    // Should show "Ver mais" button
    cy.get('[data-cy="load-more-button"]').should('exist')
    cy.contains('Ver mais cursos!').should('be.visible')
    
    // Check results info
    cy.get('[data-cy="results-info"]').should('contain', 'Exibindo 12 de 25 cursos')
  })

  it('should load more courses when "Ver mais" button is clicked', () => {
    const largeCourseList = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Curso ${i + 1}`,
      categoria: i % 3 === 0 ? 'Programação' : i % 3 === 1 ? 'Frontend' : 'Data Science',
      cargaHoraria: 40 + (i * 5)
    }))
    cy.intercept('GET', '/api/courses', (req) => {
      req.reply({ body: largeCourseList })
    }).as('getCoursesLarge')
    cy.visit('/courses')
    cy.wait('@getCoursesLarge', { timeout: 10000 }).its('response.body').should('have.length', 25)
    
    // Initially shows load-more button
    cy.get('[data-cy="load-more-button"]').should('exist')
    
    // Click "Ver mais" button
    cy.get('[data-cy="load-more-button"]').click()
    
    // Should still show load-more button after first load more
    cy.get('[data-cy="load-more-button"]').should('exist')
    
    // Should still show "Ver mais" button since there's 1 more course
    cy.get('[data-cy="load-more-button"]').should('be.visible')
  })

  it('should hide "Ver mais" button when all courses are loaded', () => {
    const largeCourseList = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Curso ${i + 1}`,
      categoria: i % 3 === 0 ? 'Programação' : i % 3 === 1 ? 'Frontend' : 'Data Science',
      cargaHoraria: 40 + (i * 5)
    }))
    cy.intercept('GET', '/api/courses', (req) => {
      req.reply({ body: largeCourseList })
    }).as('getCoursesLarge')
    cy.visit('/courses')
    cy.wait('@getCoursesLarge', { timeout: 10000 }).its('response.body').should('have.length', 25)
    
    // Click "Ver mais" button twice to load all courses
    cy.get('[data-cy="load-more-button"]').click()
    cy.get('[data-cy="load-more-button"]').click()
    
    // Should hide "Ver mais" button after loading all
    cy.get('[data-cy="load-more-button"]').should('not.exist')
  })

  it('should show loading state when clicking "Ver mais" button', () => {
    // Intercept with delay to see loading state
    cy.intercept('GET', '/api/courses', { 
      body: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        titulo: `Curso ${i + 1}`,
        categoria: i % 3 === 0 ? 'Programação' : i % 3 === 1 ? 'Frontend' : 'Data Science',
        cargaHoraria: 40 + (i * 5)
      })),
      delay: 500 
    }).as('getCoursesDelayed')
    
    cy.visit('/courses')
    cy.wait('@getCoursesDelayed', { timeout: 10000 }).its('response.body').should('have.length', 25)
    
    // Click "Ver mais" button
    cy.get('[data-cy="load-more-button"]').click()
    
    // Should show loading state in button
    cy.get('[data-cy="load-more-button"]').should('contain', 'Carregando...')
    cy.get('[data-cy="load-more-button"] .spinner-border').should('be.visible')
  })

  it('should reset pagination when performing a search', () => {
    const largeCourseList = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      titulo: `Curso ${i + 1}`,
      categoria: i % 3 === 0 ? 'Programação' : i % 3 === 1 ? 'Frontend' : 'Data Science',
      cargaHoraria: 40 + (i * 5)
    }))
    cy.intercept('GET', '/api/courses', (req) => {
      req.reply({ body: largeCourseList })
    }).as('getCoursesLarge')
    cy.visit('/courses')
    cy.wait('@getCoursesLarge', { timeout: 10000 }).its('response.body').should('have.length', 25)
    
    // Load more courses first
    cy.get('[data-cy="load-more-button"]').click()
    
    // Perform search
    cy.get('input[placeholder="Buscar por título..."]').type('Angular')
    cy.wait('@searchAngular')
    
    // Should reset to show only search results
    cy.get('.course-card').should('have.length', 1)
    
    // Should not show "Ver mais" button for search results
    cy.get('[data-cy="load-more-button"]').should('not.exist')
  })
})