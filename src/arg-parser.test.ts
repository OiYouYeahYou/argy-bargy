import { describe, expect, test } from '@jest/globals'

import { ArgParser } from './arg-parser'

function commonParser() {
	const parser = new ArgParser()
	parser.addOption({
		name: 'help',
		short: 'h',
		description: 'Provides help',
	})
	parser.addOption({
		name: 'sudo',
		description:
			"Get out of jail card for the people who don't know their own power",
	})
	parser.addOption({
		name: 'test',
		short: 't',
		description: 'Test if assumptions are valid',
	})
	parser.addOption({
		name: 'install',
		short: 'i',
		description: 'Install half of the requirements needed',
	})
	return parser
}

describe('options', () => {
	test('accepts options', () => {
		const parser = new ArgParser()
		parser.addOption({
			name: 'help',
			short: 'h',
			description: 'Provides help',
		})
	})

	test('generates help text', () => {
		const parser = commonParser()
		console.log(parser.help())
	})
})

describe('parsing', () => {
	// test('parsing an empty array', () => {
	// 	const parser = new ArgParser()
	// 	const result = parser.parse([])
	// 	expect(result.success).toEqual(true)
	// })

	// test('parsing options without them being set', () => {
	// 	const parser = new ArgParser()
	// 	const result = parser.parse(['--help'])
	// 	expect(result.success).toEqual(false)
	// })

	test('parsing set options', () => {
		const parser = new ArgParser()
		parser.addOption({
			name: 'help',
			short: 'h',
			description: 'Provides help',
		})
		const result = parser.parse(['--help'])
		console.log(result)
		expect(result.success).toEqual(true)
		expect(result).toMatchSnapshot()
	})

	// test('parsing an empty array', () => {
	// 	const parser = new ArgParser()
	// 	parser.parse([])
	// })
})
