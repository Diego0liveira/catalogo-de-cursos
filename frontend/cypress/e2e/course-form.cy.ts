describe('Course Form Tests', () => {
  beforeEach(() => {
    // Intercept API calls
    cy.intercept('GET', '/api/courses', { fixture: 'courses.json' }).as('getCourses')
    cy.intercept('POST', '/api/courses', {
      statusCode: 201,
      body: {
        id: 6,
        titulo: 'Novo Curso Teste',
        categoria: 'Teste',
        cargaHoraria: 30
      }
    }).as('createCourse')
  })

  it('should display course form correctly', () => {
    cy.visit('/courses/new')
    
    // Check page title
    cy.contains('h2', 'Novo Curso').should('be.visible')
    
    // Check form fields
    cy.get('#titulo').should('be.visible')
    cy.get('label[for="titulo"]').should('contain.text', 'Título*')
    
    cy.get('#categoria').should('be.visible')
    cy.get('label[for="categoria"]').should('contain.text', 'Categoria')
    
    cy.get('#cargaHoraria').should('be.visible')
    cy.get('label[for="cargaHoraria"]').should('contain.text', 'Carga Horária (horas)*')
    
    // Check buttons
    cy.get('button[type="submit"]').should('contain.text', 'Salvar')
    cy.get('a[routerLink="/courses"]').should('contain.text', 'Cancelar')
  })

  it('should create a new course successfully', () => {
    cy.visit('/courses/new')
    
    // Fill form
    cy.get('#titulo').type('Novo Curso Teste')
    cy.get('#categoria').type('Teste')
    cy.get('#cargaHoraria').type('30')
    
    // Submit form
    cy.get('button[type="submit"]').click()
    cy.wait('@createCourse')
    
    // Check success message
    cy.get('.alert-success').should('be.visible')
    cy.contains('Curso criado com sucesso!').should('be.visible')
    
    // Should redirect to courses list after delay
    cy.url().should('include', '/courses', { timeout: 2000 })
  })

  it('should validate required fields', () => {
    cy.visit('/courses/new')
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click()
    
    // Check validation messages
    cy.contains('.invalid-feedback', 'Título é obrigatório').should('be.visible')
    cy.contains('.invalid-feedback', 'Carga horária é obrigatória').should('be.visible')
    
    // Check that form fields have error styling
    cy.get('#titulo').should('have.class', 'is-invalid')
    cy.get('#cargaHoraria').should('have.class', 'is-invalid')
  })

  it('should validate minimum carga horaria', () => {
    cy.visit('/courses/new')
    
    // Fill form with invalid carga horaria
    cy.get('#titulo').type('Curso Teste')
    cy.get('#cargaHoraria').type('0')
    
    // Submit form
    cy.get('button[type="submit"]').click()
    
    // Check validation message
    cy.contains('.invalid-feedback', 'Carga horária deve ser maior que zero').should('be.visible')
    cy.get('#cargaHoraria').should('have.class', 'is-invalid')
  })

  it('should fill form with valid data and clear validation errors', () => {
    cy.visit('/courses/new')
    
    // First trigger validation errors
    cy.get('button[type="submit"]').click()
    cy.get('#titulo').should('have.class', 'is-invalid')
    
    // Then fill valid data
    cy.get('#titulo').type('Curso Válido')
    cy.get('#categoria').type('Categoria Teste')
    cy.get('#cargaHoraria').type('40')
    
    // Submit form
    cy.get('button[type="submit"]').click()
    cy.wait('@createCourse')
    
    // Validation errors should be gone
    cy.get('.invalid-feedback').should('not.exist')
    cy.get('.is-invalid').should('not.exist')
  })

  it('should handle API error when creating course', () => {
    // Intercept with error response
    cy.intercept('POST', '/api/courses', {
      statusCode: 400,
      body: { error: 'Bad Request' }
    }).as('createCourseError')
    
    cy.visit('/courses/new')
    
    // Fill and submit form
    cy.get('#titulo').type('Curso com Erro')
    cy.get('#categoria').type('Teste')
    cy.get('#cargaHoraria').type('30')
    cy.get('button[type="submit"]').click()
    
    cy.wait('@createCourseError')
    
    // Check error message
    cy.get('.alert-danger').should('be.visible')
    cy.contains('Erro ao criar curso. Por favor, tente novamente.').should('be.visible')
    
    // Should not redirect
    cy.url().should('include', '/courses/new')
  })

  it('should show loading state during form submission', () => {
    // Intercept with delay to see loading state
    cy.intercept('POST', '/api/courses', {
      statusCode: 201,
      body: { id: 6, titulo: 'Curso Teste', categoria: 'Teste', cargaHoraria: 30 },
      delay: 1000
    }).as('createCourseDelayed')
    
    cy.visit('/courses/new')
    
    // Fill and submit form
    cy.get('#titulo').type('Curso com Loading')
    cy.get('#categoria').type('Teste')
    cy.get('#cargaHoraria').type('30')
    cy.get('button[type="submit"]').click()
    
    // Check loading state
    cy.get('button[type="submit"]').should('be.disabled')
    cy.get('.spinner-border').should('be.visible')
    
    cy.wait('@createCourseDelayed')
    
    // Loading should be gone
    cy.get('.spinner-border').should('not.exist')
  })

  it('should cancel and return to courses list', () => {
    cy.visit('/courses/new')
    
    // Fill some data
    cy.get('#titulo').type('Curso Cancelado')
    
    // Click cancel
    cy.get('a[routerLink="/courses"]').click()
    
    // Should navigate to courses list
    cy.url().should('include', '/courses')
    cy.url().should('not.include', '/new')
  })

  it('should handle form with only required fields', () => {
    cy.visit('/courses/new')
    
    // Fill only required fields
    cy.get('#titulo').type('Curso Mínimo')
    cy.get('#cargaHoraria').type('20')
    // Leave categoria empty
    
    // Submit form
    cy.get('button[type="submit"]').click()
    cy.wait('@createCourse')
    
    // Should succeed
    cy.get('.alert-success').should('be.visible')
    cy.contains('Curso criado com sucesso!').should('be.visible')
  })
})