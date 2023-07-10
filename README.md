# TCD portfolio 
website to host portfolio and project for trinity college
using supabase and react

## how to install

### set up website
``` shell
npm install
npm run build 
serve -s build
```

don't forget to configure the env variable

``` python
VITE_BASE_URL # Use to make join link. default http://localhost:3000
VITE_LOCALE # Locales use for the website. Corespond to a files name in src/locales. default : en (for en.json)
```

### set up database

to set up the db use the `supabase/shema.sql`

to add the first admin account, make a account on the website then edit your row in `userInfo` table to `role = 0`

then in the admin panel of the website your able to change role of other user

## testing 

make a 'cypress.env.json' file :

``` json
{
"login_password": "password use to make test account",
"join_code": "join code used for database testing"
}
```

### test account
by default the tests use this login
``` js
    email: `${user}@cypress-example.local`,
    password: Cypress.env("login_password"),
```
where user can be `professor`,`student`,`professor-author`,`student-author` and `invalid` (don't exist in the db)

this can be change in `cypress\support\commands.js` and `cypress\e2e\test-login.cy.js`

## other information

* email templace are in `docs/email template`