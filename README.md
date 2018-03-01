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
4. `yarn test` or `yarn watch`
5. Pull request

## ES2015 Support Via Babel

This build pipeline now supports building rules in ES2015.
Simply do the following:

1. Write your file in the `rules` directory.
2. Write your json file that defines the auth0 rule precedence.
3. Run `yarn run gulp` # Gulp will then build the ECMAScript5 version to `dist/`
4. Deploy to auth0 from dist.

> Note as a means of centralizing testable duplicated code you may write modules inside of common and bundle them into every rule that is built.

_Don't forget to write tests to cover your code!_

## Future

* Style lint ECMAScript5 in pipeline
* Agree on styles
* PhantomJS test lock components
