const express = require('express');
const wishlistRouter=  require('./routes/wishlistRouter')
const countries = require('./data/countries')

const app = express()

// set the view engine to ejs
app.set('view engine', 'ejs');

// https://expressjs.com/en/4x/api.html#express.json
app.use(express.json());

// http://expressjs.com/en/4x/api.html#express.urlencoded
app.use(express.urlencoded({ extended: false }));
// Only necessary to handle parsing of form data sent as x-www-form-urlencoded
// For step 7 (EJS)

app.use('/api/countries', wishlistRouter)

app.get('/', (req, res) => {
    res.send('Welcome to the Travel Wish List API')
})

// For part 7
app.get('/home', (req, res) => {
    // use res.render to load up an ejs view file
    res.render('index', { countries, numberOfCountries: countries.length });
    // res.render() will look in a views folder for the view. 
    // So we only have to define index since the full path is views/index.
});

app.all('*', (req, res) => {
    res.redirect('/');
  });

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})