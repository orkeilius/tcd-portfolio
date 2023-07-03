import { supabase } from "../../support/supabaseClient"


describe('test fn_createParagraph', () => {
    
    let portfolioId = undefined

    before(() => {
        cy.login('student-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc('fn_createPortfolio', { arg_project_id: 728 })
            if (error != null) {
                throw error
            }
            cy.wrap(data).then(x => portfolioId = x)
        })
    })

    after(() => {
        cy.login('student-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
            .from('portfolio')
            .delete()
            .eq('project_id',728)
            if (error != null) {
                throw error
            }
        })
    })
    
    let dataset = [
        { name: 'professor', error: true },
        { name: 'student', error: true },
        { name: 'invalid', error: true },
        { name: 'professor-author', error: true },
        { name: 'student-author', error: false },
    ]


    dataset.forEach((test) => {

        it(test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .rpc("fn_createParagraph", { portfolio_id: portfolioId })
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert((error !== null) === test.error)
            })
        })
    })
})

describe('test portfolio access', () => {

    let portfolioId = undefined

    before(() => {
        cy.login('student-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
            .rpc('fn_createPortfolio', { arg_project_id: 728 })
            if (error != null) {
                throw error
            }
            cy.wrap(data).then(x => portfolioId = x)
        })

        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc("fn_createParagraph", { portfolio_id: portfolioId })
            if (error != null) {
                throw error
            }
        })
    })
    
    after(() => {
        cy.login('student-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
            .from('portfolio')
            .delete()
            .eq('project_id',728)
            if (error != null) {
                throw error
            }
        })
    })

    let dataset = [
        { name: 'professor', return: 0 },
        { name: 'student', return: 0 },
        { name: 'invalid', return: 0 },
        { name: 'professor-author', return: 1 },
        { name: 'student-author', return: 1 },
    ]

    dataset.forEach((test) => {
        it( `select - ${test.name}`, () => {
            cy.login(test.name)
            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('paragraph')
                    .select('*')
                    .eq('portfolio',portfolioId)
             
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
                cy.customAssert(data.length === test.return)
            })
        })
    })

    dataset = [
        { name: 'professor', return: null },
        { name: 'student', return: null },
        { name: 'invalid', return: null },
        { name: 'professor-author', return: null },
        { name: 'student-author', return: 'test' },
    ]

    dataset.forEach((test) => {
        it( `update - ${test.name}`, () => {
            cy.login(test.name)
            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('paragraph')
                    .update({text:'test'})
                    .eq('portfolio', portfolioId)
             
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
            })
            cy.login('student-author')
            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('paragraph')
                    .select('text')
                    .eq('portfolio', portfolioId)
             
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
            })
        })
    })
})