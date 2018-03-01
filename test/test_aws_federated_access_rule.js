import {assert, expect, should} from 'chai'
import RuleRunner from './helpers/rule_runner'

const request = require('request')

describe('AwsFederatedAccess', () => {
  const rule_path = 'dist/aws-federated-access.js'

  const validuser = {
    blocked: false,
    email: 'andrewkrug@gmail.com',
    email_verified: true,
    identities: [
      {
        provider: 'github',
        user_id: '1731633',
        connection: 'github',
        isSocial: true
      }
    ],
    last_ip: '8.8.8.8',
    last_login: '2017-03-02T09:37:57.139Z',
    logins_count: 10,
    name: 'Andrew Krug',
    nickname: 'akrug',
    picture: 'https://avatars2.githubusercontent.com/u/1731633?v=3',
    created_at: '1970-01-01T13:11:34.478Z',
    updated_at: '2017-04-11T13:11:34.478Z',
    user_id: 'github|1731578'
  }

  const validcontext = {
    clientID: 'ju4KXE1fPksWMDRJbphK6Tfl3LPKBGul',
    clientName: 'login-service',
    connection: 'auth0',
    connectionStrategy: 'auth0',
    protocol: 'oidc-basic-profile',
    sessionID: 'session-id',
    request: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      ip: '188.6.125.49',
      hostname: 'ephemeralsystems.auth0.com',
      geoip:
      {
        country_code: 'US',
        country_code3: 'USA',
        country_name: 'United States',
        city_name: 'Ashland',
        latitude: 42.194575800,
        longitude: -122.709476700,
        time_zone: 'America/Los_Angeles',
        continent_code: 'NA'
      }
    }
  }

  // todo: ask andrew - this was returning stuff even when the client did not match...
  describe('when the client id does not match', () => {
    let testRule
    const rule_runner = new RuleRunner(rule_path)
    const mismatchContext = Object.assign({}, validcontext, {clientID: 'something-else'})

    beforeEach(() => {
      testRule = rule_runner.validate(validuser, mismatchContext)
    })

    it('does not return an error', () => {
      return testRule.then((result) => {
        expect(result).to.exist
        expect(result.error).not.to.exist
      })
    })

    it('adds the roleSession information', () => {
      return testRule.then((result) => {
        expect(result.user.awsRoleSession).not.to.exist
      })
    })

    it('does not add the role information', () => {
      return testRule.then((result) => {
        expect(result.user.awsRole).not.to.exist
      })
    })

    it('does not return SAML mappings', () => {
      return testRule.then((result) => {
        expect(result.context.samlConfiguration).to.deep.equal({})
      })
    })
  })

  describe('with a user not in the whitelist', () => {
    let testRule
    const rule_runner = new RuleRunner(rule_path)

    const invaliduser = {
      blocked: false,
      email: 'whoever@example.com',
      email_verified: true,
      identities: [
        {
          provider: 'github',
          user_id: '1731633',
          connection: 'github',
          isSocial: true
        }
      ],
      last_ip: '8.8.8.8',
      last_login: '2017-03-02T09:37:57.139Z',
      logins_count: 10,
      name: 'Who Ever',
      nickname: 'whoever',
      picture: 'https://avatars2.githubusercontent.com/u/1731633?v=3',
      created_at: '1970-01-01T13:11:34.478Z',
      updated_at: '2017-04-11T13:11:34.478Z',
      user_id: 'github|1731578'
    }

    beforeEach(() => {
      testRule = rule_runner.validate(invaliduser, validcontext)
    })

    it('returns UnauthorizedError', () => {
      return testRule.then((result) => {
        expect(result).to.exist
        expect(result.error).to.deep.equal({
          name: 'UnauthorizedError',
          code: 'unauthorized',
          message: 'Access denied.',
          statusCode: 401,
          description: 'Access denied.'
        })
      })
    })
  })

  describe('with a valid client and user', () => {
    let testRule
    const rule_runner = new RuleRunner(rule_path)

    beforeEach(() => {
      testRule = rule_runner.validate(validuser, validcontext)
    })

    it('does not return an error', () => {
      return testRule.then((result) => {
        expect(result).to.exist
        expect(result.error).not.to.exist
      })
    })

    it('adds the roleSession information', () => {
      return testRule.then((result) => {
        expect(result.user.awsRoleSession).to.equal('andrewkrug@gmail.com')
      })
    })

    it('adds the role information', () => {
      return testRule.then((result) => {
        expect(result.user.awsRole).to.deep.equal([
          'arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin,arn:aws:iam::576309420438:saml-provider/Auth0',
          'arn:aws:iam::576309420438:role/FederatedAWSAccountRead,arn:aws:iam::576309420438:saml-provider/Auth0'
        ])
      })
    })

    it('returns the context with SAML mappings', () => {
      return testRule.then((result) => {
        expect(result.context.samlConfiguration).to.deep.equal({
          mappings: {
            'https://aws.amazon.com/SAML/Attributes/Role': 'awsRole',
            'https://aws.amazon.com/SAML/Attributes/RoleSessionName': 'awsRoleSession',
            'https://aws.amazon.com/SAML/Attributes/SessionDuration': '43200'
          }
        })
      })
    })
  })
})
