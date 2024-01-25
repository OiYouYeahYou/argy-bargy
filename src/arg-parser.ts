import { z } from 'zod'

const optionArgSlurp = /^--$/
const optionArgLong = /^--/
const optionArgShort = /^-/
const options: Record<string, Info> = {}
const shortOptions: Record<string, Info> = {}

class ParserError extends Error {}

type Info = z.infer<typeof InfoSchema>

const InfoSchema = z.strictObject({
	name: z.string().min(3),
	short: z.string().length(1).optional(),
	takesValue: z.boolean().optional(),
	description: z.string(),
	usage: z.string().array().optional(),
})

export class ArgParser {
	private short: Record<string, Info> = {}
	private long: Record<string, Info> = {}
	parse(args = process.argv.slice(2)) {
		const plainArgs: string[] = []
		let unparsed
		const errors: ParserError[] = []
		const values = {}

		let arg
		let valueTaker
		let lastOpt
		while ((arg = args.shift())) {
			if (valueTaker) {
				if (
					arg.match(optionArgSlurp) ||
					arg.match(optionArgLong) ||
					arg.match(optionArgShort)
				) {
					errors.push(
						new ParserError(`Option "${lastOpt}" requires a value`)
					)
					// This is weird: we could easily just fail here
					// Also, how do we allow dash prefixed values. Maybe just force `opt=value` syntax
				} else {
					valueTaker = undefined
					continue
				}
			}

			if (arg.match(optionArgSlurp)) {
				unparsed = args
				break
			} else if (arg.match(optionArgLong)) {
				const [opt, value] = arg.replace(optionArgLong, '').split('=')
				const info = this.long[opt]
				if (!info) {
					errors.push(new ParserError(`--${opt} does not exist`))
					continue
				}

				const { name, takesValue } = info
				if (takesValue) {
					if (typeof value === 'string') {
						values[name] = value
					} else {
						valueTaker = info
						lastOpt = `--${opt}`
					}
				} else {
					values[name] = true
				}

				continue
			} else if (arg.match(optionArgShort)) {
				const opts = arg.replace(optionArgShort, '').split('')
				for (const opt of opts) {
					const info = this.short[opt]
					if (!info) {
						errors.push(new ParserError(`${opt} does not exist`))
						continue
					}

					const { name, takesValue } = info
					if (takesValue) {
						valueTaker = info
						lastOpt = `-${opt}`
					} else {
						values[name] = true
					}
				}
			} else {
				plainArgs.push(arg)
				continue
			}
		}

		return errors.length
			? {
					success: false as const,
					errors,
			  }
			: {
					success: true as const,
					plainArgs,
					unparsed,
			  }
	}

	addOption(info: Info) {
		const parsed = InfoSchema.safeParse(info)
		if (!parsed.success) {
			throw new TypeError('Info parameter is invalid')
		}

		const { name, short } = info
		if (name in this.long) {
			throw new Error(`The option "--${name}" already exists`)
		}
		this.long[name] = info

		if (short) {
			if (short in this.short) {
				throw new Error(`The option "--${short}" already exists`)
			}
			this.short[short] = info
		}
	}

	help(options?: HelpOptions) {
		const _options = options
			? { ...defaultHelpOptions, ...options }
			: defaultHelpOptions
		const infos = Object.values(this.long).sort((a, b) =>
			a.name.localeCompare(b.name)
		)

		const lengthOfFirstPart = infos.reduce(
			(acc, { name }) => Math.max(acc, name.length),
			-Infinity
		)
		const sum = lengthOfFirstPart + 3 + 1
		const useSameLine = true
		if (useSameLine) {
			return infos
				.map(({ name, short, description }) => {
					const a = short ? `-${short},` : '   '
					let options = `${a} --${name} `.padEnd(lengthOfFirstPart)

					if (
						_options.width === 0 ||
						options.length + description.length < _options.width
					) {
						options += description
					} else {
						const parts = description.split(/\s+/)
						let part
						while ((part = parts.shift())) {
							//
						}
					}

					return `${short ? `-${short},` : '   '} --${name.padEnd(
						lengthOfFirstPart
					)} ${description}`
				})
				.join('\n')
		} else {
		}
	}
}

const defaultHelpOptions = {
	/** Define the max line width, otherwise wrap the description */
	width: 0,
	minWidth: 40,
}

type HelpOptions = Partial<typeof defaultHelpOptions>
