// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


import { supabase } from "./supabaseClient";


Cypress.Commands.add('login', async(user) => {
    const { error } = await supabase.auth.signInWithPassword({
        email: `${user}@cypress-example.local`,
        password: Cypress.env("login_password"),
    });
    error && console.error(error);
})

Cypress.Commands.add('logout',async () => {
    const { error } = await supabase.auth.signOut()
    error && console.error(error);
})