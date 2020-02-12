const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const graphqlHTTP = require('express-graphql')
const schema = require('./app/schema/schema.js')
const dbConfig = require('./config/database.config.js')
app.use(cors())

mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)

mongoose.connect(dbConfig.url)
.then(() => { console.log("Connected Successfully to the DB!") })
.catch((errors) => { console.log(errors) })


app.get('/', (req, res) => {
    res.send({
        message: "Hello World, try /graphql!"
    })
})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

app.listen('4000', () => {
    console.log('The server is running on port 4000!')
})