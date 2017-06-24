document.addEventListener('DOMContentLoaded', function() {
    Clock.init();
    Clock.drawDisplay();
});

var Clock = {
    isActive: false,
    elements: {
        display: null,
        inputs: {},
        controlButtons: {}
    },
    svg: {
        paper: null,
        arc: null,
        bCircle: null,
        sCircle: null,
        timer: null,
        mod: null
    },
    limits: {
        'session-length': {
            min: 1,
            max: 120
        },
        'break-length': {
            min: 1,
            max: 120
        }
    },
    default: {
        'session-length': 25,
        'break-length': 5,
        colors: {
            'session': '#9aca64',
            'break': '#FFB300'
        }
    },
    temp: {
        mode: 'session',
        currentTime: 0,
        requiredTime: 0,
        counterTimer: null,
        errorInputTimer: null
    },
    utility: {}
};

Clock.init = function() {
    this.elements.display = document.getElementById('face');
    
    [].forEach.call(document.querySelectorAll('input'), (element) => {
        element.addEventListener('input', this.utility.inputsHandler);
        
        let type = element.getAttribute('data-type'), 
            section = element.getAttribute('data-section');
        
        this.elements.inputs[`${type}-${section}`] = element;
    });
    
    [].forEach.call(document.querySelectorAll('[data-action]'), (element) => {
        element.addEventListener('click', this.utility.buttonsHandler);
        
        let type = element.getAttribute('data-type'),
            action = element.getAttribute('data-action');
        
        if(type == 'control') {
            this.elements.controlButtons[`${action}`] = element;
        }
    });
}

Clock.start = function() {
    this.isActive = true;
    
    this.elements.controlButtons['start'].textContent = 'Pause';
    this.elements.controlButtons['start'].setAttribute('data-action', 'pause');
    
    //A user set the value in min, so we need to translate it to sec
    
    this.temp.requiredTime = Number(this.elements.inputs[`settings-${this.temp.mode}-length`].value);
    this.temp.requiredTime *= 60;
    
    this.temp.currentTime = this.temp.requiredTime;
    
    this.temp.counterTimer = setInterval(this.update.bind(this), 1000);
}

Clock.update = function() {
    this.temp.currentTime--;
    
    this.svg.timer.attr('text', formatTime(this.temp.currentTime));
    this.svg.arc.attr({
        path: describeArcByPercent(this.temp.currentTime / this.temp.requiredTime)
    });
    
    if(this.temp.currentTime == 0) {
        Clock.switch();
    }
}

function formatTime(sec) {
    let min = 0;
    
    min = Math.floor(sec / 60);
    sec -= min * 60;
    sec = sec < 10 ? `0${sec}` : sec;
    
    return `${min}:${sec}`;
}

Clock.pause = function() {
    this.elements.controlButtons['start'].textContent = 'Resume';
    this.elements.controlButtons['start'].setAttribute('data-action', 'resume');
    
    clearInterval(this.temp.counterTimer);
}
Clock.resume = function() {
    this.elements.controlButtons['start'].textContent = 'Pause';
    this.elements.controlButtons['start'].setAttribute('data-action', 'pause');
    
    this.temp.counterTimer = setInterval(this.update.bind(this), 1000);
}

Clock.switch = function() {
    if(this.temp.mode == 'session') {
        this.temp.mode = 'break';
    } else {
        this.temp.mode = 'session';
    }
    
    this.svg.mod.attr({
        'text': this.temp.mode.toUpperCase()
    });
    
    Clock.reset();
}

Clock.reset = function() {
    clearInterval(this.temp.counterTimer);
    
    this.isActive = false;
    
    this.svg.arc.attr({
        stroke: this.default.colors[this.temp.mode],
        path: describeArcByPercent(1) 
    });
    
    let time = Number(this.elements.inputs[`settings-${this.temp.mode}-length`].value);
    this.svg.timer.attr('text', formatTime(time * 60));
    
    this.elements.controlButtons['start'].textContent = 'Start';
    this.elements.controlButtons['start'].setAttribute('data-action', 'start');
}

// =============================================
// Draw
// =============================================


Clock.drawDisplay = function() {
    this.svg.paper = Snap(this.elements.display);

    this.svg.arc = this.svg.paper
        .path(describeArcByPercent(100))
        .attr({
            fill: 'none',
            stroke: this.default.colors[this.temp.mode], 
            strokeWidth: 30
        });
    
    //Colors
    //session: #9aca64
    //break: FFB300
    
    let shadow = this.svg.paper.filter(Snap.filter.shadow(3, 5, 0.4));
    
    this.svg.bCircle = this.svg.paper
        .circle(150, 150, 100)
        .attr({
            filter: shadow,
            fill: '#7fd2f8',
            stroke: 'none',
            strokeWidth: 0
        });
    
    this.svg.sCircle = this.svg.paper
        .circle(150, 150, 80)
        .attr({
            fill: '#61b6de',
            stroke: 'none',
            strokeWidth: 0
        });
    
    this.svg.timer = this.svg.paper
        .text(150, 150, "25:00")
        .attr({
            'font-size': '37',
            'font-family': 'Orbitron',
            fill: '#fff',
            'text-anchor': 'middle',
            'alignment-baseline': 'middle'
        });
    
    this.svg.mod = this.svg.paper
        .text(150, 180, this.temp.mode.toUpperCase())
        .attr({
            'font-size': '15',
            'font-family': 'Orbitron',
            fill: '#fff',
            'text-anchor': 'middle',
            'alignment-baseline': 'middle'
        });
}


function describeArcByPercent(percent) {
    let x = 150, y = 150, r = 115,
        startAngle = 0, endAngle = 0;
    
    endAngle = percent * -359.9999;
    
    return describeArc(x, y, r, startAngle, endAngle);
}

function describeArc(x, y, r, startAngle, endAngle) {
    let start = polarToCartesian(x, y, r, startAngle %= 360);
    let end = polarToCartesian(x, y, r, endAngle %= 360);
    let large = Math.abs(endAngle - startAngle) >= 180;
    
    //return `M${start.x},${start.y} A${r},${r} 0 ${large?1:0},1,${end.x},${end.y}`; //-- clockwise
    return `M${start.x},${start.y} A${r},${r} 0 ${large?1:0},0 ${end.x},${end.y}`; //-- counterclockwise
}

function polarToCartesian(cx, cy, r, angle) {
    angle = (angle - 90) * Math.PI / 180;
    
    return {
        x: cx + r * Math.cos(angle), 
        y: cy + r * Math.sin(angle)
    }
} 


// =============================================
// Utility
// =============================================


Clock.utility.inputsHandler = function(event) {
    let element = event.target;
    let section = element.getAttribute('data-section');
    let errorFlag = false;
    
    let value = element.value;
    
    if(isNaN(value)) {
        console.log(`The value (${value}) is not a number`);
        
        errorFlag = true;
        
        value = value.replace(/\D/g, '');
        
        if(value == '') {
            value = Clock.default[section];
        }
        
        console.log(`The new value is: ${value}`);
    }
    
    value = Number(value);
    
    if(value > Clock.limits[section].max) {
        console.log(`The value (${value}) is bigger than his max limit (${Clock.limits[section].max})`);
        
        errorFlag = true;
        value = Clock.limits[section].max;
        
        console.log(`The new value is: ${value}`);
    }
    
    if(value < Clock.limits[section].min) {
        console.log(`The value (${value}) is smaller than his min limit (${Clock.limits[section].min})`);
        
        errorFlag = true;;
        value = Clock.limits[section].min;
        
        console.log(`The new value is: ${value}`);
    }
    
    if(errorFlag) {
        element.value = value;
        addErrorInputAnimation(element);
    }
    
    //Update time value in clock-face
    
    if(!Clock.isActive && `${Clock.temp.mode}-length` == section) {
        Clock.svg.timer.attr('text', formatTime(value * 60));
    }
}

function addErrorInputAnimation(element) {
    clearTimeout(Clock.temp.errorInputTimer);
    element.classList.add('settings__value-error');
    
    Clock.temp.errorInputTimer = setTimeout(function() {
        element.classList.remove('settings__value-error');
    }, 1000);
}

Clock.utility.buttonsHandler = function (event) {
    let type = event.target.getAttribute('data-type');
    
    switch(type) {
        case 'settings': {
            Clock.utility.settingsButtonsHandler(event.target); 
        } break;
        case 'control': {
            Clock.utility.controlButtonsHandler(event.target);
        } break;
        default: {
            console.error(`Unknown type: ${type}`);
        }
    }  
}

Clock.utility.controlButtonsHandler = function(buttonElement) {
    let action = buttonElement.getAttribute('data-action');
    
    switch(action) {
        case 'start': {
            Clock.start();    
        } break;
        case 'pause': {
            Clock.pause();
        } break;
        case 'resume': {
            Clock.resume();
        } break;
        case 'switch': {
            Clock.switch();
        } break;
        case 'reset': {
            Clock.reset();
        } break;
        default: {
            console.error(`Unknown action: ${action}`);
        }
    }
}

Clock.utility.settingsButtonsHandler = function(buttonElement) {
    let action = buttonElement.getAttribute('data-action');
    let section = buttonElement.getAttribute('data-section');
    let inputElement = Clock.elements.inputs[`settings-${section}`];
    let value = Number(inputElement.value);
     
    if(action == 'less') {
        value -= 1;
    } 

    if(action == 'more') {
        value += 1;
    }

    inputElement.value = value;
    inputElement.dispatchEvent(new Event("input"));
}