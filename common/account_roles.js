const request = require('request-promise')
const yaml = require('js-yaml')
const flatten = require('array.prototype.flatten')

export default class AccountRoles {
  constructor () {
    this.account_roles = []
  }

  load_url (url) {
    return request(url).then((response) => {
      const account_role_map = yaml.safeLoad(response)
      return this.account_roles.push(account_role_map['federated-access'])
    }).catch((error) => {
      // better error handling would be a good thing
      console.log('something went wrong loading from: ', url)
      console.log(error.message)
    })
  }

  load (account_role_map) {
    return this.account_roles.push(account_role_map.federated_access)
  }

  deref () {
    return this.account_roles
  }

  match (user_string) {
    let matching_roles = this.account_roles.map((account) => {
      return account.roles.map((role) => {
        const role_name = Object.keys(role)[0]

        const users = role[role_name].users
        // console.log('compare:', users, user_string)

        const foundEmail = users && users.some(user => user === user_string)
        if (foundEmail) {
          return [role_name, account.auth_provider_arn].join(',')
        }

        const groups = role[role_name].groups
        // console.log('compare:', groups, user_string)

        const foundGroup = groups && groups.some(user => user === user_string)
        if (foundGroup) {
          return [role_name, account.auth_provider_arn].join(',')
        }
      })
    })

    return flatten(matching_roles).filter(r => r)
  }
}
