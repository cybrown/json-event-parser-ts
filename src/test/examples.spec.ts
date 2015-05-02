import {Parser} from '../main/parser';
import {Scanner} from '../main/scanner';
import {ParserCreateObjectHandler} from '../main/parser-util';

import * as assert from 'assert';

describe ('Examples', () => {

    let parser: Parser;
    let createObjectHandler: ParserCreateObjectHandler;

    beforeEach(() => {
        const scanner = new Scanner();
        createObjectHandler = new ParserCreateObjectHandler();
        parser = new Parser(new Scanner(), createObjectHandler);
    });

    it ('Not so long JSON string', () => {
        const str = '[{"hello": "world", "a":4.2}, {"hello": [1, null, "\\"ok\\" with quotes"], "a": -1}, {"numbers": [1, 0, 0, -1, 3.14, -0.42, 0.123, 1e2, 4E3], "emptyString": ""}]';
        parser.parse(str);
        assert.equal(JSON.stringify(createObjectHandler.value), JSON.stringify(JSON.parse(str)));
    });
    
    it ('Escaped characters', () => {
        const str = '"\\"\\\\\\/\\b\\f\\n\\r\\t"';
        parser.parse(str);
        assert.equal(createObjectHandler.value, JSON.parse(str));
    });
});
