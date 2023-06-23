import { supabase } from "../../support/supabaseClient"


describe('test fn_createPortfolio', () => {

    let dataset = [
        { name: 'professor', error: true },
        { name: 'student', error: true },
        { name: 'invalid', error: true },
        { name: 'professor-author', error: true },
        { name: 'student-author', error: false },
    ]

    afterEach(() => {
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

    dataset.forEach((test) => {

        it(test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .rpc("fn_createPortfolio", { arg_project_id: 728 })
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert((error !== null) === test.error)
            })
        })

    })
    it('duplicate', () => {
        cy.login('student-author')

        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc("fn_createPortfolio", { arg_project_id: 728 })
            return { data, error }
        }).then(({ data, error }) => {
            console.log(data, error)
            cy.customAssert((error !== null) === false)
        }) 

        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc("fn_createPortfolio", { arg_project_id: 728 })
            return { data, error }
        }).then(({ data, error }) => {
            console.log(data, error)
            cy.customAssert((error !== null) === true)
        }) 
    })
})

describe('test portfolio select access', () => {

    let dataset = [
        { name: 'professor', return: 0 },
        { name: 'student', return: 0 },
        { name: 'invalid', return: 0 },
        { name: 'professor-author', return: 1 },
        { name: 'student-author', return: 1 },
    ]

    before(() => {
        cy.login('student-author') 
        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc("fn_createPortfolio", { arg_project_id: 728 })
            if (error !== null) {
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

    dataset.forEach((test) => {

        it(test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('portfolio')
                    .select('*')
                    .eq('project_id',728)
                
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
                cy.customAssert(data.length === test.return)
            })
        })
    })
})

describe('test portfolio update access', () => {

    let dataset = [
        { name: 'professor', return: null },
        { name: 'student', return: null },
        { name: 'invalid', return: null },
        { name: 'professor-author', return: null },
        { name: 'student-author', return: 'test' },
    ]

    before(() => {
        cy.login('student-author') 
        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc("fn_createPortfolio", { arg_project_id: 728 })
            if (error !== null) {
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

    dataset.forEach((test) => {

        it(test.name, () => {
            cy.login(test.name)
            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('portfolio')
                    .update({text:'test'})
                    .eq('project_id', 728)
                
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
            })

            cy.login('student-author')
            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('portfolio')
                    .select('text')
                    .eq('project_id', 728)
                
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)

            })
        })

    })

})