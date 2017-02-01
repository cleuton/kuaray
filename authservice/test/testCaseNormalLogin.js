var chakram = require('chakram'),
    expect = chakram.expect;
var base64 = require('base-64');
var crypto = require('crypto');
var fs = require('fs');
var publicPem = fs.readFileSync('../../../cert/cleutonsampaio.crt');
var pubkey = publicPem.toString();

//*********************** */
var minutes = 1;
// parametrizar
//*********************** */

describe('A valid user wants to get a valid token to access protected resources, and sends his “username” and “password”', function() {
    it('Should return HTTP Status 200, and an Entity like: {“token” : “<valor descrito acima>”>}; And the timeout period should be valid, against external parameter;', function() {
        var user = {'userName': 'cleuton', 'password': 'test'};
        var options = {'headers' : {'Content-type': 'application/json'}};
        var response = chakram.post("http://localhost:3000/auth/token", user, options);
        expect(response).to.have.status(200);
        expect(response).to.have.json('token', function (token) {
            // decode from base64:
            var decoded = base64.decode(token);
            var tokenarray = decoded.split(';');
            var signature = tokenarray[tokenarray.length - 1];
            var originaltoken = "";
            for (var x=0; x<tokenarray.length -1;x++) {
                if(originaltoken.length > 0) {
                    originaltoken += ";"
                }
                originaltoken += tokenarray[x];
            }
            var verify = crypto.createVerify('RSA-SHA256');
            verify.update(originaltoken);
            expect(verify.verify(pubkey, signature, 'hex')).to.be.true;
            var logindate = new Date(tokenarray[1]);
            var timeout = new Date(tokenarray[3]);
            var difference = timeout - logindate;
            var minutesdiff = minutes * 60000
            expect(difference == minutesdiff).to.be.true;
        });
        return chakram.wait();
    });
});