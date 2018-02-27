//This rule is managed by continuous release / continuous integration
// Do not edit this rule here.
// Visit https://github.com/threatresponse/auth0-rules to contribute.

function (user, context, callback) {
  var CLIENT_IDS = [
    "ju4KXE1fPksWMDRJbphK6Tfl3LPKBGul" // AWS Account Federated Access Dev
  ];

  var whitelist = [ 'andrewkrug@gmail.com', 'jeffparr100@gmail.com' ]; //authorized users
  var userHasAccess = whitelist.some(
    function (email) {
      return email === user.email;
    });

  if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
  }

  var DATA = {
    "accounts": {
      "576309420438" : "arn:aws:iam::576309420438:saml-provider/Auth0"
    },
    "account_role_group_mapping" : {
      "576309420438" : {
        "arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin" : [],
        "arn:aws:iam::576309420438:role/FederatedAWSAccountRead" : []
      }
    }
  };

  var awsRole = [];
  var intersects = function(a1, a2) {
    return a1.filter(function(n) {
      return a2.indexOf(n) !== -1;
    });
  };

  if (userHasAccess === true) {
    console.log(user.email + ' was allowed access to the console.');
    if (CLIENT_IDS.indexOf(context.clientID) >= 0) {
      for (var account in DATA.account_role_group_mapping) {
        for (var roleArn in DATA.account_role_group_mapping[account]) {
            awsRole.push(roleArn + "," + DATA.accounts[account]);
        }
      }
    }
    user.awsRole = awsRole;
    user.awsRoleSession = user.email;
    context.samlConfiguration.mappings = {
      "https://aws.amazon.com/SAML/Attributes/Role": "awsRole",
      "https://aws.amazon.com/SAML/Attributes/RoleSessionName": "awsRoleSession",
      "https://aws.amazon.com/SAML/Attributes/SessionDuration": "43200"
    };
    return callback(null, user, context);
  }


  callback(null, user, context);
}
