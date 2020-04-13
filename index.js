const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const socketsIo = require('socket.io')


// const app = http.createServer((req, res) => {
//   res.writeHead(200, { 'Content-Type': 'text/plain' })
//   res.end('Hello World')
// })

app.get('/test', (req, res) => {
  res.send('<h1>Hello Backend!</h1>')
})



// io.on('connection', socket => {
//   console.log('New WS connection')
// })

const server = http.createServer(app)

const io = socketsIo(server)

io.on("connection", socket => {
  console.log("New client connected"), setInterval(
    () => getApiAndEmit(socket),
    10000
  );
  socket.on("disconnect", () => console.log("Client disconnected"));
});

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})