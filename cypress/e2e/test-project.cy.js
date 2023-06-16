

function deleteAllProject() {
  cy.get('main').find('input').each((elem) => {

    cy.get(elem).parent()
      .contains('delete').click({ force: true })
    cy.get('button:contains(confirm):visible').click()
    cy.wait(150)
  })
  cy.get('main').find('input').should('not.exist')
  cy.wait(100)

}


describe('test acces', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000/project')
  })
  afterEach(() => {
    cy.logout()
  })

  it('access professor', () => {
    cy.login('professor')
    cy.contains("+")
  })
  it('access student', () => {
    cy.login('student')
    cy.contains('project-for-cypress')
  })
  it('access invalid', () => {
    cy.login('invalid')
    cy.contains('project').should('not.exist')
  })
})

describe('test project system', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/project')
    cy.login('professor')
    //deleteAllProject()
  })
  afterEach(() => {
    cy.visit('http://localhost:3000/project')
    cy.logout()
    cy.login('professor')
    deleteAllProject()
    cy.logout()
  })


  it('create project', () => {
    cy.contains('+').click()
  })

  it('test input project', () => {

    const test_text = ['test', 'e', '_______', 'string-4', 'unit test']
    test_text.forEach(text => {
      cy.contains('+').click()
    })
    cy.wait(100)

    cy.get('input[value="untitled project"]').each((elem, index) => {
      cy.get(elem).clear().type(test_text[index]).wait(50)
    });
    test_text.forEach(text => {
      cy.get(`input[value="${text}"]`)
    });
  })

  it('make a link', () => {
    cy.contains('+').click()
    cy.contains('generate a invite link').click()
    cy.contains('Copy invite link').click()
    cy.contains('copied !')
  })

  it('join and kick', () => {
    cy.contains('+').click()
    cy.contains('generate a invite link').click()
    cy.contains('Copy invite link').click()
    cy.contains('copied !')

    let link = ''
    cy.window().then(async (text) => {
      link = await text.navigator.clipboard.readText();
      cy.login('student')
      cy.visit(link)
      cy.contains('untitled project')

      cy.visit('/project')

      cy.login('professor')
      cy.contains('student cypress')
      cy.get('button[aria-label="kick user button"]').click()
      cy.get('button:contains(confirm):visible').click()
      cy.contains('student cypress').should('not.exist')

      cy.login('student')
      cy.contains('untitled project').should('not.exist')

    })
  })

  it('join and make portfolio', () => {
    cy.contains('+').click()
    cy.contains('generate a invite link').click()
    cy.contains('Copy invite link').click()
    cy.contains('copied !')

    let link = ''
    cy.window().then(async (text) => {
      link = await text.navigator.clipboard.readText();
      cy.login('student')
      cy.visit(link)
      cy.contains('untitled project')
      cy.contains('make a new portfolio').click()
      cy.get('input[value="untitled portfolio"]')

    })
  })

})

