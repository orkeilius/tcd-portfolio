


const datas = [
  { name: 'professor', expected: 'be.ok' },
  { name: 'student', expected: 'be.ok' },
  { name: 'invalid', expected: 'not.exist' }
]

describe('test headers', () => {
  datas.forEach(data => {
    it(data.name, () => {
      cy.visit('http://localhost:3000')
      cy.contains('My projects').should('not.exist')

      cy.login(data.name)

      cy.contains('My projects').should(data.expected)


      cy.logout()
      cy.contains('My projects').should('not.exist')

    })

  })
})
