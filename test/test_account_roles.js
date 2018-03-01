import {assert, expect, should} from 'chai'
import AccountRoles from '../common/account_roles'
import account_role_map from './fixtures/aws-federated-access'
import account_role_map2 from './fixtures/aws-federated-access-account2'

describe('AccountRoles', () => {
  let account_roles
  beforeEach(() => {
    account_roles = new AccountRoles()
  })

  it('returns empty if no files have been loaded', () => {
    expect(account_roles.deref()).to.be.empty
  })

  describe('#load', function() {
    it('loads from and Object', () => {
      account_roles.load(account_role_map)
      expect(account_roles.deref()).to.be.deep.equal([
        {
          account_id: 576309420438,
          auth_provider_arn: 'arn:aws:iam::576309420438:saml-provider/Auth0',
          roles: [
            {
              'arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin': {
                groups: null,
                users: [
                  "jeffparr100@gmail.com",
                  "andrewkrug@gmail.com"
                ]
              }
            },
            {
              'arn:aws:iam::576309420438:role/FederatedAWSAccountRead': {
                groups: null,
                users: [
                  "jeffparr100@gmail.com",
                  "andrewkrug@gmail.com"
                ]
              }
            }
          ]
        }
      ])
    })

    it('can load a second Object', () => {
      account_roles.load(account_role_map)
      account_roles.load(account_role_map2)

      expect(account_roles.deref()).to.be.deep.equal([
        {
          account_id: 576309420438,
          auth_provider_arn: 'arn:aws:iam::576309420438:saml-provider/Auth0',
          roles: [
            {
              'arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin': {
                groups: null,
                users: [
                  "jeffparr100@gmail.com",
                  "andrewkrug@gmail.com"
                ]
              }
            },
            {
              'arn:aws:iam::576309420438:role/FederatedAWSAccountRead': {
                groups: null,
                users: [
                  "jeffparr100@gmail.com",
                  "andrewkrug@gmail.com"
                ]
              }
            }
          ]
        },
        {
          account_id: 12345,
          auth_provider_arn: 'arn:aws:iam::576309420438:saml-provider/Auth0',
          roles: [
            {
              'arn:aws:iam::12345:role/FederatedAWSAccountAdmin': {
                groups: null,
                users: [
                  "jeffparr100@gmail.com",
                  "andrewkrug@gmail.com"
                ]
              }
            },
            {
              'arn:aws:iam::12345:role/FederatedAWSAccountRead': {
                groups: ['readers'],
                users: null
              }
            }
          ]
        }
      ])
    })
  })



  describe('#load_url', () => {
    // the yml file has syntactic errors so this isn't working
    xit('maps account roles', () => {
      const url = 'https://s3-us-west-2.amazonaws.com/sso-data.threatresponse.cloud/aws-federated-access.yml'
      return account_roles.load_url(url).then((result) => {
        expect(account_roles.deref()).to.be.deep.equal([
          {
            account_id: 576309420438,
            auth_provider_arn: 'arn:aws:iam::576309420438:saml-provider/Auth0',
            roles: [
              {
                'arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin': {
                  groups: null,
                  users: [
                    "jeffparr100@gmail.com",
                    "andrewkrug@gmail.com"
                  ]
                }
              },
              {
                'arn:aws:iam::576309420438:role/FederatedAWSAccountRead': {
                  groups: null,
                  users: [
                    "jeffparr100@gmail.com",
                    "andrewkrug@gmail.com"
                  ]
                }
              }
            ]
          }
        ])
      })
    })

    it('catches bad urls', () => {
      // it would be better to reraise and force handling upstream
      const url = 'https://s3-us-west-2.amazonaws.com/sso-data.threatresponse.cloud/badfile.yml'
      return account_roles.load_url(url).then((result) => {
        expect(result).not.to.exist
      })
    })
  })

  describe('#match', () => {
    beforeEach(() => {
      account_roles.load(account_role_map)
      account_roles.load(account_role_map2)
    })

    it('returns roles matched to email', () => {
      expect(account_roles.match('jeffparr100@gmail.com')).to.deep.equal([
        'arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin,arn:aws:iam::576309420438:saml-provider/Auth0',
        'arn:aws:iam::576309420438:role/FederatedAWSAccountRead,arn:aws:iam::576309420438:saml-provider/Auth0',
        'arn:aws:iam::12345:role/FederatedAWSAccountAdmin,arn:aws:iam::576309420438:saml-provider/Auth0'
      ])
    })

    it('returns roles matched to group', () => {
      expect(account_roles.match('readers')).to.deep.equal([
        'arn:aws:iam::12345:role/FederatedAWSAccountRead,arn:aws:iam::576309420438:saml-provider/Auth0'
      ])
    })
  })
})


