module.exports = (function(){

    return {
        protocol:"http",
        env: 'test',
        host:'jira.[yourjiraorghere].org',
        port:'80',
        user:'username',
        password:'password',
        apiVersion: 'latest',
        minify: true
    };
})();