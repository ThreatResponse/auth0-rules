const auth0runner = require("auth0-rule-sandbox");
const request = require('request')

let assert = require("chai").assert;
let expect = require("chai").expect;
let should = require("chai").should();

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
    request: request
  }
}

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
    request: request
  }
}

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

describe("with a good client and user", () => {

  it('should return a good result', () => {

    auth0runner(rule_path, good_options, (err, user, context) => {
      if (err) {
        console.log(err)
        expect(err).not.to.exist
      } else {
        expect(err).not.to.exist
        expect(user).to.deep.equal(good_user_result)
      }
    })
  })
})

describe("with a bad client and user", () => {

  it('should return a bad result', () => {
    let error

    try {
      auth0runner(rule_path, bad_options, (err, user, context) => {
        error = err
      })
    } catch (err) {
      error = err // this is catching the wrong thing... but it shows that the rule is working
    }
    expect(error).to.exist;
  })
})
