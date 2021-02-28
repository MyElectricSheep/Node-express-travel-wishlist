const express = require("express");
let countries = require('../data/countries')
const { body, validationResult } = require("express-validator");

const wishlistRouter = express.Router();

const countryValidations =
  // https://express-validator.github.io/docs/index.html
  // https://express-validator.github.io/docs/check-api.html
  [
    body("name").not().isEmpty().isLength({ min: 2 }),
    // Here we could check if the field is not empty and the length match a 2 or 3 letter code:
    // body("alpha2Code").not().isEmpty().isLength({ min: 2 }),
    // body("alpha3Code").not().isEmpty().isLength({ min: 3 }),

    // But even better, there's a custom validator for that :)
    // https://github.com/validatorjs/validator.js
    body("alpha2Code").isISO31661Alpha2(),
    body("alpha3Code").isISO31661Alpha3(),
  ];

// Utility function to check if a country is present in the wishlist
const retrieveCountry = (code) => {
  if (!code) return null;
  const countryCode = code.toUpperCase();
  return countries.find(
    (c) => c.alpha2Code === countryCode || c.alpha3Code === countryCode
  );
};

// Edit a specific resource on the server
wishlistRouter.put("/:code", countryValidations, (req, res) => {
  const country = retrieveCountry(req.params.code);

  if (!country) {
    return res.status(404).send("This country is not in the wishlist");
  } else {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, alpha2Code, alpha3Code, visited } = req.body;

    country.name = name;
    country.alpha2Code = alpha2Code;
    country.alpha3Code = alpha3Code;
    // (for the bonus of part 5)
    country.visited = visited

    res.status(200).send(country);
  }
});

// Delete a resource on the server
wishlistRouter.delete("/:code", (req, res) => {
  const country = retrieveCountry(req.params.code);

  if (!country) {
    return res.status(404).send("This country is not in the wishlist");
  } else {
    // ################################################# //
    // OPTION 1: fully remove the element from the array //
    // ################################################# //

    // A) Remove the element using splice:
    //   const index = countries.indexOf(country);
    //   countries.splice(index, 1);

    // B) Remove the element using filter:
    // const filteredCountries = countries.filter((c) => c.id !== country.id);
    // countries = filteredCountries;

    // ########################################################## //
    // OPTION 2: update the "visited" boolean flag of the country //
    // ########################################################## //
    if (country.visited) return res.status(403).send("This country has already been visited! Good job you!")
    country.visited = true

    res.status(200).send(country);
  }
});

// Create a resource on the server
wishlistRouter.post("/", countryValidations, (req, res) => {
  // Validators are passed as an array of validation middlewares
  console.log(req.body)

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, alpha2Code, alpha3Code } = req.body;

  const alreadyExists = [
    retrieveCountry(alpha2Code),
    retrieveCountry(alpha3Code),
  ];

  // We check if at least one value is truthy in the alreadyExists array
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
  // console.log(alreadyExists.some(el => el))
  if (alreadyExists.some((el) => el))
    return res.status(403).send("This country already exists in the wishlist");
  // https://httpstatuses.com/403

  const newCountry = {
    id: countries.length + 1,
    name,
    alpha2Code,
    alpha3Code,
    // (for the bonus of part 5)
    visited: false
  };
  countries.push(newCountry);
  res.status(201).send(newCountry);

//   Or, for step 7, redirect the user back to the home page after adding the country:
//   res.status(201).redirect('/home')
});

// GET one specific country
wishlistRouter.get("/:code", (req, res) => {
  const country = retrieveCountry(req.params.code);
  if (country) {
    res.json(country);
  } else {
    res.status(404).send("This country is not in the wishlist");
  }
});

// GET all countries route
wishlistRouter.get("/", (req, res) => {

    // https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
    const compareAlphabetically = (a, b) => {
        if (a.name > b.name) return 1;
        if (b.name > a.name) return -1;
        return 0;
      };

    // ################################################ //
    // OPTION 1: Only one query string filter parameter //
    // ################################################ //

  if (req.query.sort === "true") {
    // Boolean values will be passed as "true" or "false" (string type) in the query string
    // if you do want to use a "real" boolean flag, you can use https://www.npmjs.com/package/express-query-boolean
    
    // Array.sort actually changes, or mutates the original array it sorts
    // (meaning subsequent requests, even without the query string, would return the sorted array)
    // To avoid this, you can create a new instance of the array to be sorted and modify that instead.
    // So here, we use the spread syntax + the array literal syntax to instantiate
    // a new array with the values of the target one, and we sort the new array:
    const sortedCountries = [...countries].sort(compareAlphabetically);
    res.send(sortedCountries);
  } else {
    res.send(countries);
  }

    // ###################################################### //
    // OPTION 2 / Step 5 bonus: Multiple query string filters //
    // ###################################################### //

//   if (Object.keys(req.query).length) {
//       // We check if there's any query string parameters passed with the query
//       // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
      
//       // We destructure the query object for easy further access of its properties
//       const { visited, sort } = req.query

//       // We create a copy of the original array, so as not to mutate it
//       let filteredCountries = [...countries]

//       if (visited) {
//           if (visited === "true") {
//             filteredCountries = filteredCountries.filter(c => c.visited)
//           } else if (visited === "false") {
//             filteredCountries = filteredCountries.filter(c => !c.visited)
//           }
        
//       }

//       if (sort === "true") {
//         filteredCountries = filteredCountries.sort(compareAlphabetically);
//       }

//       res.json(filteredCountries)

//   } else {
//     res.send(countries);
//   }

});

module.exports = wishlistRouter;
