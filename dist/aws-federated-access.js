function __bundlerWrapper(__bundlerArg1, __bundlerArg2, __bundlerCallback) {
  'use strict';

  var __bundlerConfig = {
    "baseUrl": "https://ephemeralsystems.auth0.com"
  };


  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
      }
    }return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
  }();

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var request = require('request-promise');
  var yaml = require('js-yaml');
  var flatten = require('array.prototype.flatten');

  var AccountRoles = function () {
    function AccountRoles() {
      _classCallCheck(this, AccountRoles);

      this.account_roles = [];
    }

    _createClass(AccountRoles, [{
      key: 'load_url',
      value: function load_url(url) {
        var _this = this;

        return request(url).then(function (response) {
          var account_role_map = yaml.safeLoad(response);
          return _this.account_roles.push(account_role_map['federated-access']);
        }).catch(function (error) {
          // better error handling would be a good thing
          console.log('something went wrong loading from: ', url);
          console.log(error.message);
        });
      }
    }, {
      key: 'load',
      value: function load(account_role_map) {
        return this.account_roles.push(account_role_map.federated_access);
      }
    }, {
      key: 'deref',
      value: function deref() {
        return this.account_roles;
      }
    }, {
      key: 'match',
      value: function match(user_string) {
        var matching_roles = this.account_roles.map(function (account) {
          return account.roles.map(function (role) {
            var role_name = Object.keys(role)[0];

            var users = role[role_name].users;
            // console.log('compare:', users, user_string)

            var foundEmail = users && users.some(function (user) {
              return user === user_string;
            });
            if (foundEmail) {
              return [role_name, account.auth_provider_arn].join(',');
            }

            var groups = role[role_name].groups;
            // console.log('compare:', groups, user_string)

            var foundGroup = groups && groups.some(function (user) {
              return user === user_string;
            });
            if (foundGroup) {
              return [role_name, account.auth_provider_arn].join(',');
            }
          });
        });

        return flatten(matching_roles).filter(function (r) {
          return r;
        });
      }
    }]);

    return AccountRoles;
  }();

  var account_role_map = {
    federated_access: {
      account_id: 576309420438,
      auth_provider_arn: 'arn:aws:iam::576309420438:saml-provider/Auth0',
      roles: [{
        'arn:aws:iam::576309420438:role/FederatedAWSAccountAdmin': {
          groups: null,
          users: ["jeffparr100@gmail.com", "andrewkrug@gmail.com"]
        }
      }, {
        'arn:aws:iam::576309420438:role/FederatedAWSAccountRead': {
          groups: null,
          users: ["jeffparr100@gmail.com", "andrewkrug@gmail.com"]
        }
      }]
    }
  };

  //This rule is managed by continuous release / continuous integration

  function AwsFederatedAccess(config, user, context, callback) {
    var CLIENT_IDS = ["ju4KXE1fPksWMDRJbphK6Tfl3LPKBGul" // AWS Account Federated Access Dev
    ];

    if (CLIENT_IDS.indexOf(context.clientID) === -1) {
      return callback(null, user, context);
    }

    var WHITELIST = ['andrewkrug@gmail.com', 'jeffparr100@gmail.com']; //authorized users

    var userHasAccess = WHITELIST.some(function (email) {
      return email === user.email;
    });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
    }

    var account_roles = new AccountRoles();
    account_roles.load(account_role_map);

    user.awsRole = account_roles.match(user.email);
    user.awsRoleSession = user.email;
    context.samlConfiguration.mappings = {
      'https://aws.amazon.com/SAML/Attributes/Role': 'awsRole',
      'https://aws.amazon.com/SAML/Attributes/RoleSessionName': 'awsRoleSession',
      'https://aws.amazon.com/SAML/Attributes/SessionDuration': '43200'
    };

    return callback(null, user, context);
  }

  AwsFederatedAccess(__bundlerConfig, __bundlerArg1, __bundlerArg2, __bundlerCallback);
}