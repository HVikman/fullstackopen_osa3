const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')
app.use(cors())

app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('build'))

app.use(
  morgan(function (tokens, req, res) {
    if (req.method === 'POST') {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res),
        JSON.stringify(req.body),
      ].join(' ')
    }
    return null
  })
)

//homepage
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

//info page
app.get('/info', (req, res) => {
  Person.count({}).then((persons) => {
    res.send(`<p>Phonebook has info for ${persons} people</p> ${new Date()}`)
  })
})

//get all
app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons)
  })
})

//get single person
app.get('/api/persons/:id?', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch((error) => next(error))
})

//delete a person
app.delete('/api/persons/:id?', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch((error) => next(error))
})

//add a person
app.post('/api/persons', (req, res, next) => {
  const person = new Person({
    name: req.body.name,
    number: req.body.number,
  })
  person
    .save()
    .then((savedPerson) => {
      console.log(savedPerson)

      res.json(savedPerson)
    })
    .catch((error) => {
      next(error)
    })
})

//edit a person
app.put('/api/persons/:id', (req, res, next) => {
  const updatedPerson = {
    name: req.body.name,
    number: req.body.number,
  }

  Person.findByIdAndUpdate(req.params.id, updatedPerson, { new: true })
    .then((updated) => {
      if (!updated) {
        return res.status(404).json({ error: 'not found' })
      }
      console.log(updated)
      res.json(updated)
    })
    .catch((error) => {
      next(error)
    })
})

const errorHandler = (error, req, res) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  res.status(500).json({ error: 'Internal server error' })
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
