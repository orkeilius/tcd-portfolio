import { supabase } from "../../support/supabaseClient"


describe('test fn_createProject', () => {

    const dataset = [
        { name: 'professor', error: false },
        { name: 'student', error: true },
        { name: 'invalid', error: true }
    ]

    after(() => {
        cy.login('professor-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
                .from('project')
                .delete()
                .eq('name','untitled project')
            if (error != null) {
                throw error
            }
        })
    })

    dataset.forEach(test => {
        it(test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .rpc('fn_createProject')
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert((error !== null) === test.error)
            })
        })
    })
})

describe('test project access', () => {

    let projectId = undefined

    before(() => {
        cy.login('professor-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc('fn_createProject')
            if (error != null) {
                throw error
            }
            cy.wrap(data).then(x => projectId = x)
        })
        cy.supabase(async () => {
            let expire = new Date(Date.now());
            expire.setHours(expire.getHours() + 1);
            const { error } = await supabase.from("project_code").upsert({
                id: projectId,
                code: Cypress.env("join_code"),
                expire: expire.toISOString(),
                });
            if (error != null) {
                throw error
            }
        })
        
        cy.login('student-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
                .rpc('fn_joinProject', {
                    join_code : Cypress.env("join_code"), 
                    join_id : projectId
                })
            if (error != null) {
                throw error
            }
        })
    })

    after(() => {
        cy.login('professor-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
                .from('project')
                .delete()
                .neq('id',728)
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

        it("select - " + test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('project')
                    .select('*')
                    .eq('id', projectId)
                
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
                cy.customAssert(data.length === test.return)
            })
        })
    })

     dataset = [
        { name: 'professor', return: 'untitled project' },
        { name: 'student', return: 'untitled project' },
        { name: 'invalid', return: 'untitled project' },
        { name: 'student-author', return: 'untitled project' },
        { name: 'professor-author', return: 'test' },
    ]
    dataset.forEach((test) => {
        it("update - "+test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('project')
                    .update({ name: 'test' })
                    .eq('id', projectId)
                    .select()
                
                return { data, error }
            })

            cy.login('professor-author')
            cy.supabase(async () => {
                const { data, error } = await supabase
                    .from('project')
                    .select('name')
                    .eq('id', projectId)
                
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
                cy.customAssert(data[0].name=== test.return)
            })
        })
    })
})