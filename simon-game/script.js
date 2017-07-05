"use strict";

document.addEventListener('DOMContentLoaded', function() {
    [].forEach.call(document.querySelectorAll('[data-action]'), function(element) {
        element.addEventListener('click', buttonHandler);
    });
    
    [].forEach.call(document.querySelectorAll('[data-settings]'), function(element) {
        element.addEventListener('change', inputHandler);
    });
    
    [].forEach.call(document.querySelectorAll('[data-position]'), function(element) {
        element.addEventListener('click', quarterHandler);
    });
});

function buttonHandler(event) {
    let action = event.target.getAttribute('data-action');
    
    switch(action) {
        case 'start': {
            Game.showSection('game');
            Game.startNewGame();    
        } break; 
        case 'new-game': {
            Game.clear();
            Game.showSection('welcome');
        } break;
        default: {
            console.error(`Unknown action: ${action}`);
        }
    }
}

function inputHandler(event) {
    if(event.target.checked) {
        Game.strictMode = true;
    } else {
        Game.strictMode = false;
    }
}

function quarterHandler(event) {
    if(!Game.isWaitingForPlayer) {
        return;
    }
    
    Game.stopQuarter();
    Game.playQuarter(event.target.id);
    Game.checkQuarter(event.target.id)
}

var Game = {
    isWaitingForPlayer: false,
    sequence: [],
    currentPlayerStep: 0,
    strictMode: false,
    stepsToWin: 12,
    statistics: {
        steps: 0,
        errors: 0
    },
    default: {
        playTime: 1000,
        breakTime: 500,
        repeatTime: 1500,
        pauseTime: 2000
    },
    TIMER: {
        quarter: null,
        sequence: null,
        common: null
    }
};

Game.clear = function() {
    this.isWaitingForPlayer = false;
    this.sequence = [];
    this.currentPlayerStep = 0;
    this.statistics.steps = 0;
    this.statistics.errors = 0;
    
    document.getElementById('statistics').classList.remove('hide');
    document.getElementById('message').classList.add('hide');
    
    document.getElementById('steps').textContent = 0;
    document.getElementById('errors').textContent = 0;
    
    clearTimeout(this.TIMER.quarter);
    clearTimeout(this.TIMER.sequence);
    clearTimeout(this.TIMER.common);
}

Game.showSection = function(name) {
    switch(name) {
        case 'game': {
            document.getElementById('section-welcome').classList.add('hide');
            document.getElementById('section-game').classList.remove('hide');
        } break; 
        case 'welcome': {
            document.getElementById('section-game').classList.add('hide');
            document.getElementById('section-welcome').classList.remove('hide');
        } break;
        default: {
            console.error(`Unknown section name: ${name}`);
        }
    }
}

Game.startNewGame = function() {
    this.addStep();
    this.playSequence();
}

Game.addStep = function() {
    this.sequence.push(getRandom(0, 4));
    
    this.statistics.steps++;
    document.getElementById('steps').textContent = this.statistics.steps;
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

Game.playSequence = function() {
    let index = 0;
    
    (function play() {
        Game.playQuarter(Game.sequence[index]);
        
        if(index < Game.sequence.length - 1) {
            index++;
            Game.TIMER.sequence = setTimeout(play, Game.default.playTime + Game.default.breakTime);
        } else {
            setTimeout(function() {
                Game.isWaitingForPlayer = true;
                Game.currentPlayerStep = 0;
            }, Game.default.playTime);
        }
    })();
}

Game.playQuarter = function(index) {
    document.getElementById(index).classList.add('light');
    Game.TIMER.quarter = setTimeout(off, Game.default.playTime);
    
    function off() {
        document.getElementById(index).classList.remove('light');
    }
    
    Sound.play('quarter', index);
}

Game.stopQuarter = function() {   
    let element = document.querySelector('.big-circle__quarter.light');
    
    if(element !== null) {
        element.classList.remove('light');
    }
    
    clearTimeout(Game.TIMER.quarter);
}

Game.checkQuarter = function(id) {
    if(id == Game.sequence[Game.currentPlayerStep]) {
        //correct quarter
        if(Game.currentPlayerStep < Game.sequence.length - 1) {
            //continue
            Game.currentPlayerStep++;    
        } else {
            //end
            
            Game.isWaitingForPlayer = false;
            
            if(Game.sequence.length >= Game.stepsToWin) {
                //player has end the game
                
                Sound.play('win');
                
                document.getElementById('statistics').classList.add('hide');
                document.getElementById('message').classList.remove('hide');
            } else {
                //continue the game
                
                Game.TIMER.common = setTimeout(function() {
                    Game.addStep();
                    Game.playSequence();
                }, Game.default.pauseTime);    
            }   
        }
    } else {
        //wrong quarter
        
        Game.isWaitingForPlayer = false;
        Sound.play('error');
        
        this.statistics.errors++;
        document.getElementById('errors').textContent = this.statistics.errors;

        Game.TIMER.common = setTimeout(function() {
            if(Game.strictMode) {
                //exit
                Game.clear();
                Game.showSection('welcome');
            } else {
                //repeat sequence
                Game.playSequence();
            }      
        }, Game.default.repeatTime);
    }
}

var Sound = {
    context: new (window.AudioContext || window.webkitAudioContext)(),
    oscillator: null,
    gainNode: null
};

Sound.play = function(object, index) {
    const frequencies = {
        quarter: [196.00, 220.00, 246.94, 261.63],
        error: 659.25,
        win: 329.63
    };
    
    let frequencyValue, oscillatorType, duration;
    
    switch(object) {
        case 'quarter': {
            frequencyValue = frequencies.quarter[index];
            oscillatorType = 'sine';
            duration = 1;
        } break;
        case 'error': {
            frequencyValue = frequencies.error;
            oscillatorType = 'sine';
            duration = 1;
        } break; 
        case 'win': {
            frequencyValue = frequencies.win;
            oscillatorType = 'sine';
            duration = 2;
        } break;
        default: {
            console.error(`Unknown object: ${object}`);
        }
    }
    
    /* init */
    
    this.oscillator = this.context.createOscillator();
    this.gainNode = this.context.createGain();

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);
    this.oscillator.type = oscillatorType;
    
    /*  play */
    
    this.oscillator.frequency.value = frequencyValue;
    this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.01);
    this.oscillator.start(this.context.currentTime);
    
    /* stop */
    
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    this.oscillator.stop(this.context.currentTime + duration);
}