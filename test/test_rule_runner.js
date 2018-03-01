import {assert, expect, should} from 'chai'
import RuleRunner from './helpers/rule_runner'

describe('RuleRunner', () => {
  it('can load a rule', () => {
    const rule_runner = new RuleRunner("dist/aws-federated-access.js")
    expect(rule_runner).to.exist
  })

  xit('should have more tests :)', () => {

  })
})
