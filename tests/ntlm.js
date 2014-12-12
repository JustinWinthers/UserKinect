var ntlm = require('request-ntlm');

var opts = {
    username: 'jew1',
    password: 'Logan1000',
    domain: '',
    workstation: '',
    url: 'https://rpdmock.rs.nreca.org/RsApi/v1/StatementBenefitsCalculation/417151859'
};
var json = {
    // whatever object you want to submit
};

// turn off ssl validation checking
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"


ntlm.get(opts, json, function(err, response) {

    console.log (response);


});