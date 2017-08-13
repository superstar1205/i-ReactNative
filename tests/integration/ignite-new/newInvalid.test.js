const test = require('ava')
const execa = require('execa')
const tempy = require('tempy')
const { contains } = require('ramda')

const IGNITE = `${process.cwd()}/bin/ignite`

test.before(t => {
  const tempDir = tempy.directory()
  process.chdir(tempDir)
})

test('requires a name', async t => {
  try {
    await execa(IGNITE, ['new'])
    t.fail()
  } catch (err) {
    t.is(err.stdout, 'ignite new <projectName>\n\nProject name is required\n')
    t.is(err.code, 5)
  }
})

test(`doesn't allow kebab-case`, async t => {
  try {
    await execa(IGNITE, ['new', 'chicken-kebab'])
    t.fail()
  } catch (err) {
    t.is(err.stdout, 'Please use camel case for your project name. Ex: ChickenKebab\n')
    t.is(err.code, 5)
  }
})

test('numeric project name', async t => {
  try {
    await execa(IGNITE, ['new', '123456'])
    t.fail()
  } catch (err) {
    t.is(err.code, 5)
    t.true(contains('Please use at least one non-numeric', err.stdout))
  }
})
