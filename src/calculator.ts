import { warning } from './services/log-service'

export default class Calculator {
    add(a: number, b: number): number {
        if (a < 0 || b < 0) warning('adding negative numbers');
        return a + b;
    }
}

/* bootstrap */js
function main() {
    let calc = new Calculator();
    let result = calc.add(21, 21);
    document.getElementById("message").innerHTML = `Calculator says 21 + 21 = ${result}`;
}

main();