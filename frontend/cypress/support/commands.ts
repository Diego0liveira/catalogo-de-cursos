// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login (if needed in the future)
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-cy="email"]').type(email)
  cy.get('[data-cy="password"]').type(password)
  cy.get('[data-cy="login-button"]').click()
})

// Custom command to wait for Angular to be ready
Cypress.Commands.add('waitForAngular', () => {
  cy.window().then((win: any) => {
    return new Cypress.Promise((resolve) => {
      if (win.getAllAngularTestabilities) {
        const testabilities = win.getAllAngularTestabilities()
        if (testabilities.length === 0) {
          resolve(undefined)
          return
        }
        
        let count = testabilities.length
        testabilities.forEach((testability: any) => {
          testability.whenStable(() => {
            count--
            if (count === 0) {
              resolve(undefined)
            }
          })
        })
      } else {
        resolve(undefined)
      }
    })
  })
})