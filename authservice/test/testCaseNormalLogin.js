var chakram = require('chakram'),
    expect = chakram.expect;

describe('A valid user wants to get a valid token to access protected resources, and sends his “username” and “password”', function() {
    it('Should return HTTP Status 200, and an Entity like: {“token” : “<valor descrito acima>”>}; And the timeout period should be valid, against external parameter;', function() {
        var user = {'userName': 'cleuton', 'password': 'test'};
        var options = {'headers' : {'Content-type': 'application/json'}};
        var response = chakram.post("http://localhost:3000/auth/token", user, options);
        expect(response).to.have.status(200);
        expect(response).to.have.json('token', function (token) {
            // Check whether the token is valid
            console.log("Token: " + token);
        });
        return chakram.wait();
    });
});