const express = require('express');
const bodyParser = require('body-parser');
const customersData = require('./customers.json');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// List API with search and pagination
app.get('/customers', (req, res) => {
  const { firstName, lastName, city, page, limit } = req.query;

  let results = customersData;

  if (firstName) {
    results = results.filter(customer => customer.first_name.toLowerCase().includes(firstName.toLowerCase()));
  }

  if (lastName) {
    results = results.filter(customer => customer.last_name.toLowerCase().includes(lastName.toLowerCase()));
  }

  if (city) {
    results = results.filter(customer => customer.city.toLowerCase().includes(city.toLowerCase()));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResults = results.slice(startIndex, endIndex);

  res.json(paginatedResults);
});

// API to get a single customer by ID
app.get('/customers/:id', (req, res) => {
  const { id } = req.params;
  const customer = customersData.find(c => c.id === parseInt(id));

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json(customer);
});

// API to list unique cities with the number of customers from each city
app.get('/cities', (req, res) => {
  const cities = {};

  customersData.forEach(customer => {
    if (!cities[customer.city]) {
      cities[customer.city] = 1;
    } else {
      cities[customer.city]++;
    }
  });

  res.json(cities);
});

// API to add a customer with validations
app.post('/customers', (req, res) => {
  const { id, first_name, last_name, city, company } = req.body;

  if (!id || !first_name || !last_name || !city || !company) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existingCustomer = customersData.find(customer => customer.id === parseInt(id));

  if (!existingCustomer) {
    return res.status(400).json({ error: 'Customer with the provided ID does not exist' });
  }

  // Assuming city and company cannot be modified
  if (existingCustomer.city !== city || existingCustomer.company !== company) {
    return res.status(400).json({ error: 'Invalid city or company' });
  }

  // Assuming ID should be unique
  const duplicateId = customersData.some(customer => customer.id === parseInt(id));

  if (duplicateId) {
    return res.status(400).json({ error: 'Customer with the provided ID already exists' });
  }

  // Assuming we can add the customer to the customersData array
  customersData.push(req.body);

  res.json({ message: 'Customer added successfully' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
