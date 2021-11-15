import postcssValueParser from "postcss-value-parser"

export type Unit = "" | "%" | "deg" | "rad" | "grad" | "turn"

export type NumberWithUnit<U extends Unit> =
    | NumberWithUnitValid<U>
    | NumberWithUnitInvalid
abstract class AbsNumberWithUnit<
    U extends Unit,
    D extends { number: number; string: string; unit: U } | null,
> {
    public readonly withComma = false

    private readonly node: FunctionArgument

    private readonly data: D

    public constructor(node: FunctionArgument, data: D) {
        this.node = node
        this.data = data
    }

    public get value(): D {
        const { data } = this
        return data
    }

    public toString(): string {
        return this.node.toString()
    }
}

export class NumberWithUnitValid<U extends Unit> extends AbsNumberWithUnit<
    U,
    { number: number; string: string; unit: U }
> {
    public readonly valid = true
}
export class NumberWithUnitInvalid extends AbsNumberWithUnit<Unit, null> {
    public readonly valid = false

    public constructor(node: FunctionArgument) {
        super(node, null)
    }
}

export type NumberWithUnitWithComma<U extends Unit> =
    | NumberWithUnitWithCommaValid<U>
    | NumberWithUnitWithCommaInvalid
abstract class AbsNumberWithUnitWithComma<
    U extends Unit,
    N extends NumberWithUnit<U>,
    D extends Readonly<{ number: number; string: string; unit: U }> | null,
> {
    public readonly withComma = true

    private readonly comma: FunctionArgument

    private readonly node: N

    public constructor(comma: FunctionArgument, node: N) {
        this.comma = comma
        this.node = node
    }

    public get value(): D {
        const { node } = this
        return node.value as D
    }

    public withoutComma(): N {
        return this.node
    }

    public toString(): string {
        return `${this.comma}${this.node}`
    }
}
export class NumberWithUnitWithCommaValid<
    U extends Unit,
> extends AbsNumberWithUnitWithComma<
    U,
    NumberWithUnitValid<U>,
    { number: number; string: string; unit: U }
> {
    public readonly valid = true
}
export class NumberWithUnitWithCommaInvalid extends AbsNumberWithUnitWithComma<
    Unit,
    NumberWithUnit<Unit>,
    null
> {
    public readonly valid = false
}

export class FunctionArgument {
    private readonly raws: Readonly<{ before: string; after: string }>

    public readonly node: postcssValueParser.Node

    public constructor(
        before: postcssValueParser.Node[],
        node: postcssValueParser.Node,
        after?: postcssValueParser.Node[],
    ) {
        this.raws = {
            before: before.map((n) => postcssValueParser.stringify(n)).join(""),
            after:
                after?.map((n) => postcssValueParser.stringify(n)).join("") ||
                "",
        }
        this.node = node
    }

    public toString(): string {
        return `${this.raws.before}${postcssValueParser.stringify(this.node)}${
            this.raws.after
        }`
    }
}

export type AlphaArgument = AlphaArgumentValid | AlphaArgumentInvalid

export abstract class AbsAlphaArgument<
    A extends NumberWithUnit<"" | "%">,
    V extends number | null,
> {
    private readonly divNode: FunctionArgument

    private readonly alphaNode: A

    public readonly value: V

    public constructor(divNode: FunctionArgument, alphaNode: A, alpha: V) {
        this.divNode = divNode
        this.alphaNode = alphaNode
        this.value = alpha
    }

    public get div(): string {
        return this.divNode.node.value
    }

    public toAlphaNString(): string {
        return `${this.alphaNode}`
    }

    public toString(): string {
        return `${this.divNode}${this.alphaNode}`
    }
}

export class AlphaArgumentValid extends AbsAlphaArgument<
    NumberWithUnitValid<"" | "%">,
    number
> {
    public get valid(): true {
        return true
    }
}
export class AlphaArgumentInvalid extends AbsAlphaArgument<
    NumberWithUnit<"" | "%">,
    number | null
> {
    public get valid(): false {
        return false
    }
}
