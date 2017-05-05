'use strict'

const AE         = require('assert').AssertionError,
      test       = require('tap'),
      Target     = require('../lib/target'),
      TargetList = require('../lib/target-list'),
      initList   = new TargetList,
      list       = new TargetList,
      target1    = new Target(initList, 'test1', 'http://example.com/a'),
      target2    = new Target(initList, 'test2', 'http://example.com/b', 2),
      target3    = new Target(initList, 'test3', 'http://example.com/c', 3, true)

test.equals(target1.list, initList)
test.equals(target1.id, 'test1')
test.equals(target1.href(), 'http://example.com/a')
test.equals(target1.weight, 1, 'default weight should be set')
test.equals(target2.weight, 2, 'weight should be set')

list.add(target1)

// adding the same item multiple times should be ignored
list.add(target1)
list.addMany([ target1 ])

test.same(list.weights, [ 1 ], 'weights should be updated')
test.same(list.enabledItems.length, 1, 'enabledItems should be updated')

list.add(target3)

test.same(list.weights, [ 1, 3 ], 'weights should be updated')
test.same(list.enabledItems.length, 2, 'enabledItems should be updated')

list.add(target2)

test.same(list.weights, [ 1, 3, 2 ], 'weights should be updated')
test.same(list.enabledItems.length, 3, 'enabledItems should be updated')

list.remove(target3)

test.same(list.weights, [ 1, 2 ], 'weights should be updated')
test.same(list.enabledItems.length, 2, 'enabledItems should be updated')

target1.weight = 2

test.same(list.weights, [ 2, 2 ], 'weights should be updated')
test.same(list.enabledItems.length, 2, 'enabledItems should be updated')

target1.weight = 2

test.same(list.weights, [ 2, 2 ], 'weights should not be updated')
test.same(list.enabledItems.length, 2, 'enabledItems should be updated')

target2.enabled = false

test.same(list.weights, [ 2 ], 'weights should not be updated')
test.same(list.enabledItems.length, 1, 'enabledItems should be updated')
test.same(list.disabledItems.length, 1, 'disabledItems should be updated')

target2.weight = 1

test.same(list.weights, [ 2 ], 'weights should not be updated')

target2.enabled = false

test.same(list.weights, [ 2 ], 'weights should not be changed')
test.same(list.enabledItems.length, 1, 'enabledItems should not be changed')
test.same(list.disabledItems.length, 1, 'disabledItems should not be changed')

target2.enabled = true

test.same(list.weights, [ 2, 1 ], 'weights should be updated')
test.same(list.enabledItems.length, 2, 'enabledItems should be updated')
test.same(list.disabledItems.length, 0, 'disabledItems should be updated')

test.equals(list.findIndex(null), -1)
test.equals(list.findIndex(target2), 1)

test.equals(list.findById(null), null)
test.equals(list.findById('test2'), target2)

test.throws(() => {
    new TargetList('random')
}, AE)

test.doesNotThrow(() => {
    const list   = new TargetList,
          target = new Target(list, 1, 'http://example.com')

    new TargetList(TargetList.balancingMethod.random).add(target)
    new TargetList(TargetList.balancingMethod.urlHash).add(target)
    new TargetList(TargetList.balancingMethod.roundRobin).add(target)
    new TargetList(TargetList.balancingMethod.sourceIpHash).add(target)
})

const list2 = new TargetList

test.equals(list2.balancingMethod, TargetList.balancingMethod.roundRobin, 'balancingMethod should be accessible')

list2.addMany([
    target1,
    target2,
    target3
])

test.equals(list.pick(), target1)

list2.clear()

test.equals(list2.items.length, 0, 'list should be empty')
test.equals(list2.weights.length, 0, 'list should be empty')

test.equals(list2.pick(), null, 'pick() should return null for empty lists')

test.test('pick() from list with exactly one item', test => {
    const list   = new TargetList,
          target = new Target(list, 1, 'http://example.com')

    test.equals(list.pick(), target)
    test.end()
})

const balancer = list2._balancer

list2.generateBalancer()

test.equals(list2._balancer, balancer, 'balancer should not be regenerated if list is empty')

target1.weight = 1
target1.enabled = false
target2.weight = 1
target2.enabled = false

list2.add(target1)
list2.addMany([ target2 ])

test.equals(list2.weights.length, 0, 'weights should not be updated if disabled items are added')
test.equals(list2.items.length, 2, 'items should be updated if disabled items are added')
test.equals(list2.enabledItems.length, 0, 'enabledItems should not be updated if disabled items are added')
test.equals(list2.disabledItems.length, 2, 'disabledItems should be updated if disabled items are added')

list2.remove(target1)

test.equals(list2.items.length, 1, 'items should be updated if disabled items are removed')
test.equals(list2.disabledItems.length, 1, 'disabledItems should be updated if disabled items are removed')

list2.removeById('test2')

test.equals(list2.items.length, 0, 'items should be updated if disabled items are removed')
test.equals(list2.disabledItems.length, 0, 'disabledItems should be updated if disabled items are removed')

test.doesNotThrow(() => {
    list2.remove(null)
}, 'should not throw when user tries to remove non-existing items')

/* availability */

const list3 = new TargetList

list3.addMany([
    target1,
    target2
])

target1.weight = 1
target1.enabled = true
target2.enabled = true
target2.weight = 2

test.same(list3.weights, [ 1, 2 ])

target1.available = false

test.same(list3.weights, [ 2 ])
test.equals(target1.available, false, 'available prop should be accessed')

target1.available = false

test.same(list3.weights, [ 2 ])

target1.enabled = false

test.same(list3.weights, [ 2 ])

target1.available = true

test.same(list3.weights, [ 2 ])

target1.enabled = true

test.same(list3.weights, [ 2, 1 ])
