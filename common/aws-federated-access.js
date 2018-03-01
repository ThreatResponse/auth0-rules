const account_role_map = {
  federated_access: {
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
}
export default account_role_map
