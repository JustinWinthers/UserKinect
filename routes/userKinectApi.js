//setup the routes

module.exports = function (app){


    // get the jiraConnect client side library
    app.get('/userKinect.js', require('../services/getUserKinect'));

    // get the template for the jiraConnect UI - called client side
    app.get('/tmpl/:template', require('../services/getTemplate'));

    // get the jiraUser details
    app.get('/jiraUser', require('../services/getJiraUser'));

    // get list of projects available to the logged in user or default server user id
    app.get('/jiraProjects', require('../services/getJiraProjects'));

    // get project details [components, issue types]
    app.get('/jiraProjects/:project', require('../services/getJiraProject'));

    // create new jiraIssue with image attached
    app.post('/add/jiraIssue', require('../services/addJiraIssue'));



};
