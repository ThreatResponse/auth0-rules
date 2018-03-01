const auth0_runtime = require('auth0-rules-runtime')

export default class RuleRunner {
  constructor (rule_path) {
    this.rule_path = rule_path
  }

  runtime (user, context) {
    return auth0_runtime(this.rule_path, user, context).catch((error) => {
      console.log(`There is an error in setup: ${error.message}`)
      if (error.validationErrors) {
        console.log(error.validationErrors)
      }
    })
  }

  validate (user, context) {
    return this.runtime(user, context).then((result) => {
      if (result.error) {
        console.log(`An error has been returned to the callback. ${result.error.message}`)
      }
      return result
    })
  }
}
