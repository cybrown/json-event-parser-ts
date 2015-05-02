import {Parser} from '../main/parser';
import {Scanner} from '../main/scanner';
import {BaseParserHandler} from '../main/parser-util';

import * as assert from 'assert';

describe ('JSON event parser', () => {
    
    let parser: Parser;
    
    beforeEach(() => {
        const scanner = new Scanner();
        parser = new Parser(new Scanner(), new BaseParserHandler());
    });
    
    describe ('Booleans and null', () => {
        
        it ('should parse true', () => {
            parser.parse('true');
        });
        
        it ('should parse false', () => {
            parser.parse('false');
        });
        
        it ('should parse null', () => {
            parser.parse('null');
        });
    });
    
    describe ('Numbers', () => {
        
        describe ('Positive numbers', () => {
            
            it ('should parse integer like number', () => {
                parser.parse('123');
            });
            
            it ('should parse zero', () => {
                parser.parse('0');
            });
            
            it ('should parse floating number', () => {
                parser.parse('12.34');
            });
            
            it ('should not parse floating number without leading zero', () => {
                assert.throws(() => {
                    parser.parse('.21398');
                });
            });
            
            it ('sould parse with exponent', () => {
                parser.parse('1e2');
            });
            
            it ('sould not parse with exponent but without value', () => {
                assert.throws(() => {
                    parser.parse('1e');
                });
            });
        });
        
        describe ('Negative numbers', () => {
            
            it ('should parse a negative interger like number', () => {
                parser.parse('-123');
            });
            
            it ('should parse negative zero', () => {
                parser.parse('-0');
            });
            
            it ('should parse negative floating number', () => {
                parser.parse('-12.34');
            });
            
            it ('should not parse negative floating number without leading zero', () => {
                assert.throws(() => {
                    parser.parse('-.21398');
                });
            });
        });
        
        describe ('Errors', () => {
            
            it ('dot only number is an error', () => {
                assert.throws(() => {
                    parser.parse('.')
                }, 'digit');
            });
            
            it ('minus only number is an error', () => {
                assert.throws(() => {
                    parser.parse('-')
                }, 'digit');
            });
            
            it ('minus and dot only number is an error', () => {
                assert.throws(() => {
                    parser.parse('-.')
                }, 'digit');
            });
        });
    });
    
    describe ('Strings', () => {
        
        it ('empty string', () => {
            parser.parse('""');
        });
        
        it ('one char string', () => {
            parser.parse('"a"');
        });
        
        it ('middle string', () => {
            parser.parse('"aqdssd sqgqfdg qgqerg sd"');
        });
        
        it ('string with escaped quotes', () => {
            parser.parse('"hello \\"world\\""');
        });
    });
    
    describe ('Array', () => {
        
        it ('array of booleans', () => {
            parser.parse('[true, false, true]');
        });
        
        it ('array of numbers', () => {
            parser.parse('[1, 4, 8]');
        });
    });
    
    describe ('Object', () => {
        
        it ('object of booleans', () => {
            parser.parse('{"true": true, "false": false}');
        });
    });
});
