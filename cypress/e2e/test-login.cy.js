

describe('test login connection', () => {
  const datas = [
    { name: 'professor', expected: 'professor cypress', logout: true },
    { name: 'student', expected: 'student cypress', logout: true },
    { name: 'invalid', expected: 'login invalid', logout: false }
  ]

  datas.forEach(data => {
    it(data.name, () => {

      cy.visit('http://localhost:3000')
      cy.contains('not connected')

      cy.contains('Log in').click()

      cy.get('header').find('form').as('login')
      cy.get('@login').find('input[placeholder=email]', { timeout: 10000 }).type(`${data.name}@cypress-example.local`)
      cy.get('@login').find('input[placeholder=password]').type(Cypress.env("login_password"));
      cy.get('@login').submit()

      cy.contains(data.expected)

      if (data.logout) {
        cy.contains('Log out').click()
      }
      cy.contains('not connected')
    })

  })
})

describe('test login menu', () => {

  it('menu open/close', () => {

    cy.visit('http://localhost:3000')
    cy.get('header > div > div').as('menu')

    cy.get('@menu').find('input').should('not.be.visible')
    cy.get('@menu').click()
    cy.get('@menu').find('input').should('be.visible')
    cy.get('#root').click()
    cy.get('@menu').find('input').should('not.be.visible')

  })
  it('singup link', () => {

    cy.visit('http://localhost:3000')
    cy.get('header > div > div').as('menu')

    cy.get('@menu').click()
    cy.contains('create an account').click()
    cy.contains('Sing Up')
  })

})
