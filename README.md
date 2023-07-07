# TCD portfolio 
website to host portfolio and project for trinity college
using supabase and react

## how to install
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


## testing 

make a 'cypress.env.json' file :

``` json
{
"login_password": "password use to make test account",
"join_code": "join code used for database testing"
}
```