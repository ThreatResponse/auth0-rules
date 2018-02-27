const auth0runner = require("auth0-rule-sandbox");

var assert = require("chai").assert;
var expect = require("chai").expect;
var should = require("chai").should();

// Load the rule
const rule_path = "../rules/aws-federated-access.js";

// These options should result in a successful auth and access.
const good_options = {
  user: {
    "name": "Andrew Krug",
    "email": "andrewkrug@gmail.com",
    "email_verified": true
  },
  context: {
    "clientID": "ju4KXE1fPksWMDRJbphK6Tfl3LPKBGul",
    "clientName": "AWS Federated Access",
    "connectionStrategy": "auth0",
    "samlConfiguration":   {} //Only required if SAML Client
  },
  configuration: {
    oidc_conformant: "true"
  },
  globals: {
    request: require("request")
  }
};

//These options should result in no access
const bad_options = {
  user: {
    "name": "Evil Bob",
    "email": "evilbob@bad.xyz",
    "email_verified": true
  },
  context: {
    "clientID": "juasakjhsadjsdhdsfhsdjfhsdf",
    "clientName": "Not AWS Federated Access",
    "connectionStrategy": "auth0",
    "samlConfiguration":   {} //Only required if SAML Client
  },
  configuration: {
    oidc_conformant: "true"
  },
  globals: {

    request: require("request")
  }
};

const good_user_result = {
  name: "Andrew Krug",
  email: "andrewkrug@gmail.com",
  email_verified: true,
  awsRole:
   [
     "arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin,arn:aws:iam::576309420438:saml-provider/Auth0",
     "arn:aws:iam::576309420438:role/FederatedAWSAccountRead,arn:aws:iam::576309420438:saml-provider/Auth0"
   ],
  awsRoleSession: "andrewkrug@gmail.com"
}

const good_client_result = {
  clientID: "ju4KXE1fPksWMDRJbphK6Tfl3LPKBGul",
  clientName: "AWS Federated Access",
  connectionStrategy: "auth0",
  samlConfiguration:
   { mappings:
      { "https://aws.amazon.com/SAML/Attributes/Role": "awsRole",
        "https://aws.amazon.com/SAML/Attributes/RoleSessionName": "awsRoleSession",
        "https://aws.amazon.com/SAML/Attributes/SessionDuration": "43200" }
    }
}

describe("It should load and trigger code for the good client and user", function () {
   console.log("running test...");
   auth0runner(rule_path, good_options, function(err, user, context) {
     if (err) {
       console.log("There was an error resulting in access failure.");
       console.log(err);
     } else {
       expect(user).to.deep.equal(good_user_result);
       user.email.should.equal("andrewkrug@gmail.com")
       console.log(user, context)
     }
   });
});

describe("It should load and trigger code for the bad client and user", function () {
   console.log("running test...");
   try {
       auth0runner(rule_path, bad_options, function(err, user, context) {
         if (err) {
           err.should.exist;
         } else {
           console.log("The rule failed to deny access.");
           console.log(user, context);
         }
       });
    }
    catch (err){
      console.log("The rule succeeded in denying access by raising an error.")
      expect(err).to.exist;
    }

});
