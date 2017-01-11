var chakram = require('chakram'),
    expect = chakram.expect;

describe('A valid user wants to get a valid token to access protected resources, and sends his “username” and “password”', function() {
    it('Should return HTTP Status 200, a Header “location”, and an Entity like: {“token” : “<valor descrito acima>”>}', function() {
        var user = {'username': 'cleuton', 'password': 'test'};
        var options = {'headers' : {'Content-type': 'application/json'}};
        var response = chakram.post("http://localhost:3000/auth/token", user, options);
        expect(response).to.have.status(200);
        expect(response).to.have.header('location');
        expect(response).to.have.json('token', function (token) {
            // Check whether the token is valid
            console.log("Token: " + token);
        });
        return chakram.wait();
    });
});