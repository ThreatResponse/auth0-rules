# auth0-rules
Reference rules for integration for auth0.

## Build Status
[![Build Status](https://travis-ci.org/ThreatResponse/auth0-rules.svg?branch=master)](https://travis-ci.org/ThreatResponse/auth0-rules)

## Rules contained in this repository

* aws-federated-access:  This rule was adapted from @gene1wood for use in the social login setup to access the
ThreatResponse AWS Console.

## Testing

* Rules are tested on pull request using travisCI and Mocha/Chai.
* Hosted lock page is still untested.

## Development

1. Clone the repository.
2. yarn install
3. Iterate
4. `yarn run test`
5. Pull request

## Future

* Style lint ECMAScript5 in pipeline
* Agree on styles
* PhantomJS test lock components
