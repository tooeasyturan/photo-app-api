const app = require('./app')
const http = require('http')
const config = require('./utils/config')


// const app = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' })
//   res.end('Hello World')
// })

app.get('/test', (req, res) => {
  res.send('<h1>Hello Backend!</h1>')
})

const server = http.createServer(app)

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})