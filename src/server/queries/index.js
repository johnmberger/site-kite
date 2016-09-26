const knex = require('../db/knex');
const request = require('request');
var http = require('http');
module.exports = {get, addUser, checkForms, userInDb, checkNewUser, getProjects, compareUser, projectsApiCalls}

function get(table) {
  return knex(table);
}

function addUser(body) {
  return get('users')
  .where('username', body.username)
  .update({
    name: body.name,
    email: body.email,
    twitter: body.twitter,
    linkedin: body.linkedin,
    bio_desc: body.bio_desc,
    contact_desc: body.contact_desc
  });
}

function removeUser (id) {
  return get('users')
  .where('id', id)
  .del()
}

function checkForms(body) {
  var ok = true;
  for (var key in body) {
    if (body[key].length === 0 && key !== 'button') {
      ok = false;
    }
  }
  return ok;
}

function projectsApiCalls(arr) {
  var promise = arr.map(function (project) {
    return new Promise((resolve, reject) => {
      var options = {
        url: 'https://api.github.com/repos/' + project,
        headers: {
          'User-Agent': 'request'
        }
      }
      function wtf (error, response, body) {
        if (error) {
          console.log('error', error);
        }
        resolve({pinnedProjects: project, data:body})
        return body;
      }
      request(options, wtf)
    })
  })
  // console.log(promise);
  return Promise.all(promise)
}

function userInDb(user) {
  return get('users').where('username', user.username);
}

function getProjects(data) {
  if (!data.length) {
    return Promise.resolve(false);
  }
  return get('projects').where('user_id', data[0].id)
  .then((projects) => {
    data[0].projects = projects;
    return data;
  });
}

function checkNewUser(data) {
  if (data.length === 0) {
    return false;
  } else {
    if (data[0].email !== null) {
      return data;
    } else {
      return false;
    }
  }
}

function compareUser(user1, user2) {
  if (user1 === user2) {
    return true;
  }
  return false;
}
