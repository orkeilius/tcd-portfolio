


const datas = [
  { name: 'professor', expected: 'professor cypress' },
  { name: 'student', expected: 'student cypress' },
]

describe('test login utils', () => {
  datas.forEach(data => {
    it(data.name, () => {
      cy.visit('http://localhost:3000')
      cy.contains('not connected')
      
      cy.intercept('*token?grant_type=password').as('requestLogin')
      cy.login(data.name)

      cy.contains(data.expected)

      cy.logout()
      cy.contains('not connected')
    })

  })
})
