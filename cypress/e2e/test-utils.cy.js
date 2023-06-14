
describe('test login professor', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
    cy.contains('not connected')

    cy.login("professor")
    cy.contains('professor cypress')

    cy.logout()
    cy.contains('not connected')


  })

})
describe('test login student', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
    cy.contains('not connected')

    cy.login("student")
    cy.contains('student cypress')
      
    cy.logout()
    cy.contains('not connected')
  })
})

describe('test login invalid', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000')
    cy.contains('not connected')

    cy.login("invalid")
    cy.contains('not connected')

    cy.logout()
    cy.contains('not connected')
  })
})