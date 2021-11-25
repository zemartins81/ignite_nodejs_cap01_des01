const express = require('express');
const cors = require('cors');
const {v4: uuidV4} = require('uuid')

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const filteredUser = users.find(user => user.username === username)

  if(filteredUser) request.filteredUser = filteredUser

  return next()
}

app.post('/users',  (request, response) => {

  const {name, username} = request.body

  const verifyExistsUsername = users.some(user => user.username === username)

  if(verifyExistsUsername) {
    return response.status(400).send({error: "user already exists!"})
  }  

  const newUser = {
    id: uuidV4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  if(!request.filteredUser) {
    return response.status(404).json({error: 'User not found!'})
  }

  return response.send(request.filteredUser.todos)


});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  if(!request.filteredUser) {
    return response.status(404).json({error: 'User not found!'})
  }

  const filteredUser = request.filteredUser
  const {title, deadline} = request.body

  const newTodo = {
    id:uuidV4(),
    title,
    done: false,
    deadline: new Date(deadline), 
	  created_at: new Date()
  }

  filteredUser.todos.push(newTodo)

  const newUsers = users.map(user => user.id !== filteredUser.id ? user : filteredUser)

  user = [...newUsers]

  return response.status(201).send(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  if(!request.filteredUser) {
    return response.status(404).send({error: 'User not found!'})
  }

  const filteredUser = request.filteredUser

  const todos = filteredUser.todos

  const {id} = request.params

  const filteredTodo = todos.find(todo => todo.id === id)

  if(!filteredTodo) return response.status(404).send({error: "todo not found!"})



});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  if(!request.filteredUser) {
    return response.status(404).send({error: 'User not found!'})
  }

  const filteredUser = request.filteredUser

  const todos = filteredUser.todos

  const {id} = request.params

  const filteredTodo = todos.find(todo => todo.id === id)

  if(!filteredTodo) return response.status(404).send({error: "todo not found!"})


});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  if(!request.filteredUser) {
    return response.status(404).send({error: 'User not found!'})
  }

  const {id} = request.params

  const filteredUser = request.filteredUser

  const todos = filteredUser.todos

  const filteredTodo = todos.some(todo => todo.id === id)

  if(!filteredTodo) return response.status(404).send({error: "todo not found!"})

  filteredUser.todos = todos.filter(todo => todo.id !== id)

  users = users.map(user => user.id !== filteredUser.id ? user : filteredUser)

  return response.status(204).send()

});

module.exports = app;