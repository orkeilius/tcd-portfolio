

function fill(value) {
  cy.get('main').find('form').as('form')

  cy.get('@form').find('input[placeholder="first name"]').type(value?.firstname ?? 'first name')
  cy.get('@form').find('input[placeholder="last name"]').type(value?.lastname ?? 'last name')
  cy.get('@form').find('input[placeholder="email"]').type(value?.email ?? 'test@cypress.local')
  cy.get('@form').find('input[placeholder="password"]').type(value?.password ?? 'securePassword_0')
  cy.get('@form').find('input[placeholder="confirm password"]').type(value?.password2 ?? 'securePassword_0')

}

describe('test sing up input', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000/singup')
    cy.get('main').find('form').as('form')

  })

  it('input correspondind value', () => {
    cy.get('@form').find('input[placeholder="first name"][type="text"]')
    cy.get('@form').find('input[placeholder="last name"][type="text"]')
    cy.get('@form').find('input[placeholder="email"][type="email"]')
    cy.get('@form').find('input[placeholder="password"][type="password"]')
    cy.get('@form').find('input[placeholder="confirm password"][type="password"]')
  })

  it('empty', () => {
    cy.get('@form').submit()
    cy.contains('error')
  })
  it('full', () => {
    fill()

    cy.get('@form').submit()
    cy.contains('account created')
  })

  const inputValue = ['firstname', 'lastname', 'email']
  inputValue.forEach(key => {
    it(`missing ${key}`, () => {
      fill({ [key]:'{del}' })
      cy.get('@form').submit()
      cy.contains('error')
    })

    it(`too small ${key}`, () => {
      fill({ [key]:'a' })
      cy.get('@form').submit()
      cy.contains('error')
    })

  })

  it('wrong email', () => {
    fill({email:'not an email'})

    cy.get('@form').submit()
    cy.contains('error')
  })

  it('mismatching password', () => {
    fill({password:'wrong password'})

    cy.get('@form').submit()
    cy.contains('missmatching password')
  })
  it('password too small', () => {
    fill({password:'a',password2:'a'})

    cy.get('@form').submit()
    cy.contains('error')
  })

})