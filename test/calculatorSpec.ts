/// <reference path="./index.d.ts" />

import Calculator from '../src/calculator'

describe("Calculator tests", () => {
    it("adds", () => {
        expect(2 + 40).toBe(42);
    })

    it("adds negative numbers", () => {
        let calculator = new Calculator()
        expect(calculator.add(-40, 82)).toBe(42);
    })
})