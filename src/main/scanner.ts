export class Scanner {

    private index = 0;
    private inputLength = 0;
    private tokenStartIndex = 0;
    private input = '';
    private startLine = 1;
    private startColumn = 1;
    private currentLine = 1;
    private currentColumn = 1;
    private currentChar = '';

    scan (input: string) {
        this.input = input;
        this.inputLength = input.length;
        this.reset();
    }
    
    private reset() {
        this.index = 0;
        this.tokenStartIndex = 0;
        this.startLine = 1;
        this.startColumn = 1;
        this.currentLine = 1;
        this.currentColumn = 1;
        this.currentChar = this.input[0];
    }

    next (): Token {
        do {
            if (this.isOneCharToken(this.currentChar)) {
                return this.nextOneCharToken();
            } else if (this.currentChar === '"') {
                return this.nextString();
            } else if (this.canStartNumber(this.currentChar)) {
                return this.nextNumber();
            } else if (this.currentChar === 't') {
                return this.nextTrue();
            } else if (this.currentChar === 'f') {
                return this.nextFalse();
            } else if (this.currentChar === 'n') {
                return this.nextNull();
            } else if (this.isBlank(this.currentChar)) {
                this.nextChar();
            } else if (this.currentChar === undefined) {
                return this.createToken(TokenKind.END_OF_INPUT);
            } else {
                this.throwUnexpectedCharacterError();
            }
        } while (true);
    }

    hasNext (): boolean {
        return this.index < this.inputLength;
    }

    private nextOneCharToken (): Token {
        this.startNewToken();
        const currentChar = this.currentChar;
        this.nextChar();
        return this.createToken(this.charToTokenKind(currentChar));
    }

    private nextTrue (): Token {
        this.startNewToken();
        this.nextChar();
        if (this.currentChar !== 'r') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 'u') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 'e') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        return this.createToken(TokenKind.BOOLEAN);
    }

    private nextFalse (): Token {
        this.startNewToken();
        this.nextChar();
        if (this.currentChar !== 'a') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 'l') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 's') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 'e') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        return this.createToken(TokenKind.BOOLEAN);
    }

    private nextNull (): Token {
        this.startNewToken();
        this.nextChar();
        if (this.currentChar !== 'u') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 'l') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        if (this.currentChar !== 'l') {
            throw this.throwUnexpectedCharacterError();
        }
        this.nextChar();
        return this.createToken(TokenKind.NULL);
    }

    private nextString (): Token {
        this.startNewToken();
        let allowNextQuote = false;
        while (this.nextChar() !== '"' || allowNextQuote) {
            if (this.currentChar === '\\') {
                allowNextQuote = !allowNextQuote;
            } else {
                allowNextQuote = false;
            }
        }
        this.nextChar();
        return this.createToken(TokenKind.STRING);
    }

    private nextNumber (): Token {
        let atLeastOneNumber = false;
        this.startNewToken();
        if (this.currentChar === '-') {
            this.nextChar();
        }
        if (!this.isNumber(this.currentChar)) {
            throw this.createError('Expected Digit');
        }
        do {
            atLeastOneNumber = true;
            this.nextChar();
        } while (this.isNumber(this.currentChar));
        if (this.currentChar === '.') {
            this.nextChar();
        }
        while (this.isNumber(this.currentChar)) {
            this.nextChar();
        }
        if (this.currentChar === 'e' || this.currentChar === 'E') {
            this.nextChar();
            if (!this.isNumber(this.currentChar)) {
                throw this.createError('Expected Digit');
            }
            do {
                this.nextChar();
            } while (this.isNumber(this.currentChar));
        }
        return this.createToken(TokenKind.NUMBER);
    }

    private startNewToken (): void {
        this.startColumn = this.currentColumn;
        this.startLine = this.currentLine;
        this.tokenStartIndex = this.index;
    }

    private createToken(kind: TokenKind): Token {
        return {
            kind,
            text: this.input.slice(this.tokenStartIndex, this.index),
            lineStart: this.startLine,
            lineEnd: this.currentLine,
            columnStart: this.startColumn,
            columnEnd: this.currentColumn
        };
    }

    private charToTokenKind(chr: string): TokenKind {
        return {
            '{': TokenKind.CURLY_OPEN,
            '}': TokenKind.CURLY_CLOSE,
            '[': TokenKind.BRACKET_OPEN,
            ']': TokenKind.BRACKET_CLOSE,
            ',': TokenKind.COMMA,
            ':': TokenKind.COLON,
        }[chr] || null;
    }

    private nextChar(): string {
        if (this.currentChar === '\n') {
            this.currentLine++;
            this.currentColumn = 0;
        } else {
            this.currentColumn++;
        }
        this.currentChar = this.input[++this.index];
        return this.currentChar;
    }

    private canStartNumber(chr: string): boolean {
        return this.isNumber(chr) || chr === '.' || chr === '-';
    }

    private isNumber(chr: string): boolean {
        return /\d/.test(chr);
    }

    private isAlpha(chr: string): boolean {
        return /[a-zA-Z]/.test(chr);
    }

    private isOneCharToken(chr: string): boolean {
        return /[{}[\]:,]/.test(chr);
    }

    private isBlank (chr: string): boolean {
        return /\s/.test(chr);
    }

    private throwUnexpectedCharacterError() {
        throw this.createError(`Unexpected character: <${this.currentChar}>`);
    }

    private createError(msg: string): Error {
        return new Error(`Scanner error: ${msg}`);
    }
}

export enum TokenKind {
    STRING,
    NUMBER,
    BOOLEAN,
    NULL,
    BRACKET_OPEN,
    BRACKET_CLOSE,
    CURLY_OPEN,
    CURLY_CLOSE,
    COMMA,
    COLON,
    END_OF_INPUT
}

export interface Token {
    kind: TokenKind;
    text: string;
    lineStart: number;
    lineEnd: number;
    columnStart: number;
    columnEnd: number;
}
