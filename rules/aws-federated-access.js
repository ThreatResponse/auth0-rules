//This rule is managed by continuous release / continuous integration
// Do not edit this rule here.
// Visit https://github.com/threatresponse/auth0-rules to contribute.

import AccountRoles from '../common/account_roles'
import account_role_map from '../common/aws-federated-access'

export default function AwsFederatedAccess(config, user, context, callback) {
  const CLIENT_IDS = [
    "ju4KXE1fPksWMDRJbphK6Tfl3LPKBGul" // AWS Account Federated Access Dev
  ]

  if (CLIENT_IDS.indexOf(context.clientID) === -1) {
    return callback(null, user, context)
  }

  const WHITELIST = [ 'andrewkrug@gmail.com', 'jeffparr100@gmail.com' ]; //authorized users

  var userHasAccess = WHITELIST.some((email) => {
    return email === user.email
  })

  if (!userHasAccess) {
    return callback(new UnauthorizedError('Access denied.'));
  }

  const account_roles = new AccountRoles()
  account_roles.load(account_role_map)

  user.awsRole = account_roles.match(user.email)
  user.awsRoleSession = user.email
  context.samlConfiguration.mappings = {
    'https://aws.amazon.com/SAML/Attributes/Role': 'awsRole',
    'https://aws.amazon.com/SAML/Attributes/RoleSessionName': 'awsRoleSession',
    'https://aws.amazon.com/SAML/Attributes/SessionDuration': '43200'
  }

  return callback(null, user, context);
}

