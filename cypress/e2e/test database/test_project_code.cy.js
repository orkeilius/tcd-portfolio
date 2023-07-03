
import { supabase } from "../../support/supabaseClient"


describe('test project_code access', () => {

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
                    join_code: Cypress.env("join_code"),
                    join_id: projectId
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
                .neq('id', 728)
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
        { name: 'student-author', return: 0 },
    ]
    dataset.forEach((test) => {

        it("select - " + test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {

                const { data, error } = await supabase
                .from('project_code')
                .select('*')
                .eq('id',projectId)
                
                return { data, error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert(error === null)
                cy.customAssert(data.length === test.return)
            })
        })
    })


    dataset = [
        { name: 'professor', error: true  },
        { name: 'student', error: true },
        { name: 'invalid', error: true },
        { name: 'professor-author', error: false },
        { name: 'student-author', error: true },
    ]
    dataset.forEach((test) => {

        it("insert - " + test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                let expire = new Date(Date.now());

                const { error } = await supabase
                .from('project_code')
                .upsert([
                  { id: projectId, code: Cypress.env("join_code"), expire: expire.toISOString()},
                ])
                
                return { error }
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert((error !==null) === test.error)
            })
        })
    })
})





describe('test fn_joinProject', () => {

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
    })

    after(() => {
        cy.login('professor-author')
        cy.supabase(async () => {
            const { data, error } = await supabase
                .from('project')
                .delete()
                .neq('id', 728)
            if (error != null) {
                throw error
            }
        })
    })

    let dataset = [
        { name: 'professor', error: true  },
        { name: 'student', error: true },
        { name: 'invalid', error: true },
        { name: 'professor-author', error: true },
    ]
    dataset.forEach((test) => {

        it("insert - " + test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .rpc('fn_joinProject', {
                        join_code: 'invalidCode',
                        join_id: projectId
                    })
                return ({error})
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert((error !==null) === test.error)
            })
        })
    })

    dataset = [
        { name: 'professor', error: false  },
        { name: 'student', error: false },
        { name: 'invalid', error: true },
        { name: 'professor-author', error: true },
    ]
    dataset.forEach((test) => {

        it("valid - " + test.name, () => {
            cy.login(test.name)

            cy.supabase(async () => {
                const { data, error } = await supabase
                    .rpc('fn_joinProject', {
                        join_code: Cypress.env("join_code"),
                        join_id: projectId
                    })
                return ({error})
            }).then(({ data, error }) => {
                console.log(data, error)
                cy.customAssert((error !==null) === test.error)
            })
        })
    })
})