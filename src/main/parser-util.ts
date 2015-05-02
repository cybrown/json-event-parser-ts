import {IParserHandler} from './parser';

export class BaseParserHandler implements IParserHandler {
    onString(str: string) { }
    onNumber(num: number) { }
    onBoolean(bool: boolean) { }
    onNull() { }
    onObjectStart() { }
    onObjectEnd() { }
    onArrayStart() { }
    onArrayEnd() { }
    onKeyStart(key: string) { }
    onKeyEnd(key: string) { }
    onIndexStart(index: number) { }
    onIndexEnd(index: number) { }
}

export class ParserCreateObjectHandler implements IParserHandler {

    onString(str: string) {
        this.put(str);
    }

    onNumber(num: number) {
        this.put(num);
    }

    onBoolean(bool: boolean) {
        this.put(bool);
    }

    onNull() {
        this.put(null);
    }

    onObjectStart() {
        this.pushCurrent({});
    }

    onObjectEnd() {
        this.popCurrent();
    }

    onArrayStart() {
        this.pushCurrent([]);
    }

    onArrayEnd() {
        this.popCurrent();
    }

    onKeyStart(key: string) {
        this.pushCurrentKey(key);
    }

    onKeyEnd(key: string) {
        this.popCurrentKey();
    }

    onIndexStart(index: number) {

    }

    onIndexEnd(index: number) {

    }

    value = undefined;

    private get currentKey() {
        return this.keyStack[this.keyStack.length - 1];
    }

    private get current() {
        return this.objStack[this.objStack.length - 1];
    }

    private put(value: any) {
        if (this.current === undefined) {
            this.value = value;
        } else if (Array.isArray(this.current)) {
            this.current.push(value);
        } else {
            this.current[this.currentKey] = value;
        }
    }

    private objStack = [];

    private pushCurrent(value: any) {
        this.put(value);
        this.objStack.push(value);
    }

    private popCurrent() {
        this.objStack.pop();
    }

    private keyStack = [];

    private pushCurrentKey(key: string) {
        this.keyStack.push(key);
    }

    private popCurrentKey() {
        this.keyStack.pop();
    }
}

export class ParserLoggerHandler implements IParserHandler {

    onString(str: string) {
        this.log('String:', str);
    }

    onNumber(num: number) {
        this.log('Number:', num);
    }

    onBoolean(bool: boolean) {
        this.log('Boolean:', bool);
    }

    onNull() {
        this.log('Null');
    }

    onObjectStart() {
        this.log('Object start');
        this.incSpaces();
    }

    onObjectEnd() {
        this.decSpaces();
        this.log('Object end');
    }

    onArrayStart() {
        this.log('Array start');
        this.incSpaces();
    }

    onArrayEnd() {
        this.decSpaces();
        this.log('Array end');
    }

    onKeyStart(key: string) {
        this.log('Key start:', key);
        this.incSpaces();
    }

    onKeyEnd(key: string) {
        this.decSpaces();
        this.log('Key end:', key);
    }

    onIndexStart(index: number) {
        this.log('Index start:', index);
        this.incSpaces();
    }

    onIndexEnd(index: number) {
        this.decSpaces();
        this.log('Index end:', index);
    }

    log (...msg: any[]) {
        msg.unshift(this.getSpaces());
        console.log.apply(console, msg);
    }

    private spaces = '';

    private getSpaces() {
        return this.spaces;
    }

    private incSpaces () {
        this.spaces += '  ';
    }

    private decSpaces () {
        this.spaces = this.spaces.slice(0, -2);
    }
}

export class ParserCompositeHandler implements IParserHandler {

    onString(str: string) {
        this.handlers.forEach(handler => handler.onString(str));
    }

    onNumber(num: number) {
        this.handlers.forEach(handler => handler.onNumber(num));
    }

    onBoolean(bool: boolean) {
        this.handlers.forEach(handler => handler.onBoolean(bool));
    }

    onNull() {
        this.handlers.forEach(handler => handler.onNull());
    }

    onObjectStart() {
        this.handlers.forEach(handler => handler.onObjectStart());
    }

    onObjectEnd() {
        this.handlers.forEach(handler => handler.onObjectEnd());
    }

    onArrayStart() {
        this.handlers.forEach(handler => handler.onArrayStart());
    }

    onArrayEnd() {
        this.handlers.forEach(handler => handler.onArrayEnd());
    }

    onKeyStart(key: string) {
        this.handlers.forEach(handler => handler.onKeyStart(key));
    }

    onKeyEnd(key: string) {
        this.handlers.forEach(handler => handler.onKeyEnd(key));
    }

    onIndexStart(index: number) {
        this.handlers.forEach(handler => handler.onIndexStart(index));
    }

    onIndexEnd(index: number) {
        this.handlers.forEach(handler => handler.onIndexEnd(index));
    }

    private handlers: IParserHandler[] = [];

    add(handler: IParserHandler): ParserCompositeHandler {
        this.handlers.push(handler);
        return this;
    }
}
