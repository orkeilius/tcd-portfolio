
describe('test acces', () => {

  beforeEach(() => {
    cy.visit('/portfolio/24')
  })
  afterEach(() => {
    cy.logout()
  })

  it('access professor', () => {
    cy.login('professor')
    cy.get('main').should('not.exist')
  })
  it('access student', () => {
    cy.login('student')
    cy.get('main').find('input')
  })
  it('access invalid', () => {
    cy.login('invalid')
    cy.get('main').should('not.exist')
  })
})

function deleteAllParagraph() {
  cy.get("button:contains('delete')").each((elem) => {

    cy.get(elem).click({ force: true })
    cy.get('button:contains(confirm):visible').click()
    cy.wait(150)
  })
  cy.get(":contains('delete')").should('not.exist')
  cy.wait(100)

}

 describe('test project system', () => {
   beforeEach(() => {
     cy.visit('/portfolio/24')
     cy.login('student')
     //deleteAllProject()
   })
   afterEach(() => {
     cy.visit('/portfolio/24')
     deleteAllParagraph()
     cy.logout()
   })

   it.only('create project', () => {
    cy.contains('Add a paragraph').click()
     cy.get('textarea')
   })

  it('test input portfolio', () => {

    const test_subTitle = ['this is a title', 'tilte', 'Le titile', 'string-4', 'hola']
    const test_text = ['this is a loooooooooooooooooooooooooooooooooooooooooooooooooooooooong text', 'e', '_______', 'string-4', 'unit text']
    test_text.forEach(text => {
      cy.contains('Add a paragraph').click()
    })
    cy.wait(100)

    cy.get('textarea').each((elem, index) => {
      cy.get(elem)
      cy.get(elem.parent()).find('input[placeholder="add a subtitle ..."]').type(test_subTitle[index])
      cy.get(elem.parent()).find('textarea[placeholder="add a text ..."]').type(test_text[index]) 
    });
    cy.wait(1000)
    test_subTitle.forEach(text => {
      cy.get(`input[value="${text}"]`)
    });
  })

  it.only('upload', () => {
    cy.contains('Add a paragraph').click()
    cy.get('input[type=file]').selectFile({
      contents: Cypress.Buffer.from('file contents'),
      fileName: 'file.txt',
      mimeType: 'text/plain',
      lastModified: Date.now(),
    },{force:true})
    cy.contains('uploading file.txt')

    cy.get('button[aria-label="download button"]').click()
    cy.intercept("**/storage/v1/object/sign/media/** ", { statusCode: 200 }).as('download')
    cy.wait('@download')

    cy.get('button[aria-label="delete button"]').click()
    cy.contains('file.text').should('not.exist')
  })
})

