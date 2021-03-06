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
        switch (this.currentToken.kind) {
            case TokenKind.CURLY_OPEN:
                this.parseObjectNoCheck();
                break;
            case TokenKind.STRING:
                this.parseStringNoCheck();
                break;
            case TokenKind.NUMBER:
                this.parseNumberNoCheck();
                break;
            case TokenKind.BRACKET_OPEN:
                this.parseArrayNoCheck();
                break;
            case TokenKind.BOOLEAN:
                this.parseBooleanNoCheck();
                break;
            case TokenKind.NULL:
                this.parseNullNoCheck();
                break;
            default:
                this.throwExpected([TokenKind.STRING, TokenKind.CURLY_OPEN, TokenKind.NUMBER, TokenKind.BRACKET_OPEN, TokenKind.BOOLEAN, TokenKind.NULL]);
        }
    }

    private parseNullNoCheck(): void {
        this.handler.onNull();
    }

    private parseBooleanNoCheck(): void {
        this.handler.onBoolean(this.currentToken.text[0] === 't');
    }

    private parseObjectNoCheck(): void {
        this.handler.onObjectStart();
        do {
            this.pullToken();
            this.check(TokenKind.STRING);
            this.parseKeyNoCheck();
            const key = this.currentToken.text;
            this.pullToken();
            this.check(TokenKind.COLON);
            this.pullToken();
            this.parseValue();
            this.handler.onKeyEnd(key);
            this.pullToken();
            switch (this.currentToken.kind) {
                case TokenKind.COMMA:
                    break;
                case TokenKind.CURLY_CLOSE:
                    this.handler.onObjectEnd();
                    return;
                default:
                    this.throwExpected([TokenKind.CURLY_CLOSE, TokenKind.COMMA]);
            }
        } while (true);
    }

    private parseArrayNoCheck(): void {
        this.handler.onArrayStart();
        let index = 0;
        do {
            this.pullToken();
            this.handler.onIndexStart(index);
            this.parseValue();
            this.handler.onIndexEnd(index);
            this.pullToken();
            switch (this.currentToken.kind) {
                case TokenKind.COMMA:
                    break;
                case TokenKind.BRACKET_CLOSE:
                    this.handler.onArrayEnd();
                    return;
                default:
                    this.throwExpected([TokenKind.BRACKET_CLOSE, TokenKind.COMMA]);
            }
            index++;
        } while (true);
    }

    private parseKeyNoCheck(): void {
        this.handler.onKeyStart(this.convertString(this.currentToken.text));
    }

    private parseStringNoCheck(): void {
        this.handler.onString(this.convertString(this.currentToken.text));
    }

    private convertString(str: string): string {
        str = str.slice(1, -1);
        if (!/\\/.test(str)) {
            return str;
        } else {
            return str.replace(/\\"/g, '"')
                      .replace(/\\\\/g, '\\')
                      .replace(/\\\//g, '\/')
                      .replace(/\\b/g, '\b')
                      .replace(/\\f/g, '\f')
                      .replace(/\\n/g, '\n')
                      .replace(/\\r/g, '\r')
                      .replace(/\\t/g, '\t');
        }
    }

    private parseNumberNoCheck(): void {
        this.handler.onNumber(parseFloat(this.currentToken.text));
    }

    private check(expected: TokenKind): void {
        if (expected !== this.currentToken.kind) {
            this.throwExpected([expected]);
        }
    }

    private pullToken(): void {
        this.currentToken = this.scanner.next();
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
