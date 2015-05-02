import {Scanner, Token, TokenKind} from './scanner';

export interface IParserHandler {
    onString(str: string): void;
    onNumber(num: number): void;
    onBoolean(bool: boolean): void;
    onNull(): void;
    onKeyStart(str: string): void;
    onKeyEnd(str: string): void;
    onIndexStart(index: number): void;
    onIndexEnd(index: number): void;
    onObjectStart(): void;
    onObjectEnd(): void;
    onArrayStart(): void;
    onArrayEnd(): void;
}

export class Parser {

    private currentToken: Token = null;

    constructor (private scanner: Scanner, private handler: IParserHandler) {

    }

    parse(source: string): void {
        this.scanner.scan(source);
        this.pullToken();
        this.parseValue();
        this.pullToken();
        this.check(TokenKind.END_OF_INPUT);
    }

    private parseValue(): void {
        this.check([TokenKind.STRING, TokenKind.CURLY_OPEN, TokenKind.NUMBER, TokenKind.BRACKET_OPEN, TokenKind.BOOLEAN, TokenKind.NULL]);
        switch (this.currentToken.kind) {
            case TokenKind.CURLY_OPEN:
                this.parseObject();
                break;
            case TokenKind.STRING:
                this.parseString();
                break;
            case TokenKind.NUMBER:
                this.parseNumber();
                break;
            case TokenKind.BRACKET_OPEN:
                this.parseArray();
                break;
            case TokenKind.BOOLEAN:
                this.parseBoolean();
                break;
            case TokenKind.NULL:
                this.parseNull();
                break;
        }
    }

    private parseNull(): void {
        this.check(TokenKind.NULL);
        this.handler.onNull();
    }

    private parseBoolean(): void {
        this.check(TokenKind.BOOLEAN);
        this.handler.onBoolean(this.currentToken.text === 'true' ? true : false);
    }

    private parseObject(): void {
        this.check(TokenKind.CURLY_OPEN);
        this.handler.onObjectStart();
        do {
            this.pullToken();
            this.parseKey();
            const key = this.currentToken.text;
            this.pullToken();
            this.check(TokenKind.COLON);
            this.pullToken();
            this.parseValue();
            this.handler.onKeyEnd(key);
            this.pullToken();
            this.check([TokenKind.CURLY_CLOSE, TokenKind.COMMA]);
            if (this.currentToken.kind === TokenKind.CURLY_CLOSE) {
                this.handler.onObjectEnd();
                return;
            }
        } while (true);
    }

    private parseArray(): void {
        this.check(TokenKind.BRACKET_OPEN);
        this.handler.onArrayStart();
        let index = 0;
        do {
            this.pullToken();
            this.handler.onIndexStart(index);
            this.parseValue();
            this.handler.onIndexEnd(index);
            this.pullToken();
            this.check([TokenKind.BRACKET_CLOSE, TokenKind.COMMA]);
            if (this.currentToken.kind === TokenKind.BRACKET_CLOSE) {
                this.handler.onArrayEnd();
                return;
            }
            index++;
        } while (true);
    }

    private parseKey(): void {
        this.check(TokenKind.STRING);
        this.handler.onKeyStart(this.convertString(this.currentToken.text));
    }

    private parseString(): void {
        this.check(TokenKind.STRING);
        this.handler.onString(this.convertString(this.currentToken.text));
    }

    private convertString(str: string): string {
        return str.slice(1, -1)
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\\//g, '\/')
            .replace(/\\b/g, '\b')
            .replace(/\\f/g, '\f')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t');
    }

    private parseNumber(): void {
        this.check(TokenKind.NUMBER);
        this.handler.onNumber(parseFloat(this.currentToken.text));
    }

    private check(expected: TokenKind|TokenKind[]): void {
        const _expected = <TokenKind[]>(Array.isArray(expected) ? expected : [expected]);
        if (_expected.indexOf(this.currentToken.kind) === -1) {
            this.throwExpected(_expected);
        }
    }

    private pullToken(): void {
        const old = this.currentToken;
        this.currentToken = this.scanner.next();
        if (this.currentToken === null) {
            console.log(old);
            throw this.createError('Unexpected end of file');
        }
    }

    private throwExpected(kinds: TokenKind[]): void {
        const expectedKindsDescription = kinds.map(kind => TokenKind[kind]).join(', ');
        const actualKindDescription = TokenKind[this.currentToken.kind] + ': ' + this.currentToken.text;
        throw this.createError(`Expected ${expectedKindsDescription}, got ${actualKindDescription}`);
    }

    private createError(msg: string): Error {
        return new Error(`Parse error: ${msg}`);
    }
}
