var RainbowLoad = require('../src/rainbow');

console.log('RainbowLoad', RainbowLoad);

RainbowLoad.show()

setTimeout(function() {RainbowLoad.hide()}, 2000);