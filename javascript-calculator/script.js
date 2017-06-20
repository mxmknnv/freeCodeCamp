document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('keyup', pKeyboardHandler);
    
    [].forEach.call(document.querySelectorAll('.keyboard__key'), function(element) {
        element.addEventListener('click', vKeyboardHandler);
    });
    
    Calculator.init();
});

// ===================================
// Physical Keyboard Handler
// ===================================

function pKeyboardHandler(event) {
    const numberKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const functionKeys = ['Enter', '+', '-', '*', '/'];
    const decimalMarkKeys = ['.', ','];
    const sysKeys = ['Escape', 'Backspace'];
    const sysKeysToCommands = {
        'Escape': 'clear-all-input', 
        'Backspace': 'clear-current-input'
    };
    
    let value = event.key;
    
    if(numberKeys.includes(value)) {
        Calculator.addNumber(value);    
    }
    
    if(decimalMarkKeys.includes(value)) {
        Calculator.addFunction('decimalMark');    
    }
    
    if(functionKeys.includes(value)) {
        if(value == 'Enter') {
            Calculator.addFunction('calculate');        
        } else {
            Calculator.addFunction(value);    
        }    
    }
    
    if(sysKeys.includes(value)) {
        Calculator.sysCommand(sysKeysToCommands[value]);       
    }
}

// ===================================
// Virtual Keyboard Handler
// ===================================

function vKeyboardHandler(event) {
    let type = event.target.getAttribute('type'),
        value = event.target.getAttribute('value');
    
    switch(type) {
        case 'sys': {
            Calculator.sysCommand(value);
        } break;
        case 'func': {
            Calculator.addFunction(value);
        } break;
        case 'num': {
            Calculator.addNumber(value);
        } break;
        default: {
            console.error(`Unknown key type: ${type}`);
        }
    }  
}

var Calculator = {
    limits: {
        numberLength: 10
    },
    temp: {
        function: '',
        sign: '',
        number: '0',
        expression: '',
        decimalMark: false
    },
    displayElement: {
        function: null,
        sign: null,
        number: null,
        expression: null
    }
};

Calculator.init = function() {
    this.displayElement.function = document.getElementById('display__function');
    this.displayElement.sign = document.getElementById('display__sign');
    this.displayElement.number = document.getElementById('display__number');
    this.displayElement.expression = document.getElementById('display__expression');
}

Calculator.update = function(zeroFlag) {
    this.displayElement.function.textContent = this.temp.function;
    this.displayElement.sign.textContent = this.temp.sign;
    this.displayElement.number.textContent = this.temp.number;
    this.displayElement.expression.textContent = this.temp.expression;
    
    console.groupCollapsed('Calculator.update');
    console.log(`temp.function: ${this.temp.function}`);
    console.log(`temp.sign: ${this.temp.sign}`);
    console.log(`temp.number: ${this.temp.number}`);
    console.log(`temp.expression: ${this.temp.expression}`);
    console.log(`temp.decimalMark: ${this.temp.decimalMark}`);
    console.groupEnd();
}

Calculator.addNumber = function(num) {
    console.log(`Calculator.addNumber: ${num}`);
    
    if(this.temp.number.length >= this.limits.numberLength) {
        console.log(`The number is already too large, current limit: ${this.limits.numberLength} numerals`);
        return;
    }
   
    if(this.temp.number == '0') {
        this.temp.number = '';
    }
    
    this.temp.number += num;
    this.update();
}

Calculator.addFunction = function(func) {
    console.log(`Calculator.addFunction: ${func}`);
    
    const simpleFunctions = ['+', '-', '*', '/'];
    
    if(simpleFunctions.includes(func)) {
        if(this.temp.number == '0' && this.temp.expression.length == 0) {
            return;
        }
        
        if(this.temp.number.length == 0) {
            this.temp.function = func; 
        } else {
            let newExpression = ` ${this.temp.function} ${this.temp.sign}${this.temp.number}`;
        
            this.temp.function = func;
            this.temp.sign = '';
            this.temp.number = '';
            this.temp.expression += newExpression;
            this.temp.decimalMark = false; 
        }
    }
    
    if(func == 'sign') {
        if(this.temp.sign == '-') {
            this.temp.sign = '';
        } else {
            this.temp.sign = '-'; 
        } 
    }
    
    if(func == 'decimalMark') {
        if(this.temp.decimalMark) {
            return;
        }
        
        this.temp.decimalMark = true;
        
        if(this.temp.number.length == 0) {
            this.temp.number = '0.'; 
        } else {
            this.temp.number += '.'; 
        }  
    }
    
    if(func == 'calculate') {
        if(this.temp.number.length == 0 || this.temp.function.length == 0) {
            console.log('Nothing to calculate');
            return;
        }
        
        let newExpression = ` ${this.temp.function} ${this.temp.sign}${this.temp.number}`;
        let result = eval(this.temp.expression + newExpression)
                        .toPrecision(this.limits.numberLength)
                        .toString();
        
        console.log(`expression: ${this.temp.expression + newExpression}`);
        console.log(`result: ${result}`);
        
        /*
         We need to remove excess "0" from the end of the number
        */
        
        if(result.indexOf('.') > -1) {   
            while(result.length > 1) {
                let lastChar = result[result.length - 1];
                
                if(lastChar == '0') {
                    result = result.slice(0, -1); 
                    continue;
                }
                
                if(lastChar == '.') {
                    result = result.slice(0, -1); 
                    break;
                } else {
                    break;
                }
            }
        }
        
        this.temp.function = '';
        
        if(result < 0) {
            result *= (-1);
            result = result.toString();
            this.temp.sign = '-';
        } else {
            this.temp.sign = '';
        } 
        
        this.temp.number = result;
        this.temp.expression = ''; 
        this.temp.decimalMark = result.indexOf('.') == -1 ? false : true;
    }
    
    this.update();
}

Calculator.sysCommand = function(cmd) {
    switch(cmd) {
        case 'clear-current-input': {
            this.temp.sign = '';
            this.temp.number = '0';
            this.temp.decimalMark = false;  
        } break;        
        case 'clear-all-input': {
            this.temp.function = '';
            this.temp.sign = '';
            this.temp.number = '0';
            this.temp.expression = '';
            this.temp.decimalMark = false; 
        } break;
        default: {
            console.error(`Unknown cmd type: ${cmd}`);
        }
    }
    
    this.update();
}