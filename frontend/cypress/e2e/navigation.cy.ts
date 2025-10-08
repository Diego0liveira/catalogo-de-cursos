describe('Navigation Tests', () => {
  beforeEach(() => {
    // Intercept API calls to avoid real backend dependency
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.intercept('GET', '/api/courses?q=*', { fixture: 'courses.json' }).as('searchCourses')
  })

  it('should load the home page and redirect to courses', () => {
    cy.visit('/')
    cy.url().should('include', '/courses')
    cy.contains('Catálogo de Cursos').should('be.visible')
  })

  it('should navigate to courses page', () => {
    cy.visit('/courses')
    cy.url().should('include', '/courses')
    cy.wait('@getCourses')
    cy.get('[data-cy="course-list"]').should('be.visible')
  })

  it('should navigate to new course form', () => {
    cy.visit('/courses/new')
    cy.url().should('include', '/courses/new')
    cy.get('[data-cy="course-form"]').should('be.visible')
    cy.contains('Novo Curso').should('be.visible')
  })

  it('should handle invalid routes by redirecting to courses', () => {
    cy.visit('/invalid-route')
    cy.url().should('include', '/courses')
  })

  it('should display navbar with application title', () => {
    cy.visit('/')
    cy.get('.navbar').should('be.visible')
    cy.get('.navbar-brand').should('contain.text', 'Catálogo de Cursos')
  })
})