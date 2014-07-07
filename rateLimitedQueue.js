exports.createQueue = createQueue;

function createQueue(rateLimit) {
    var queue = [];
    var gap = rateLimit.interval;
    var timeOfNextRequest = 0;
    var waiting = false;
    
    function next() {
        if (queue.length === 0) {
            waiting = false;
            return;
        }
        
        var now = getNow();
        if (now >= timeOfNextRequest) {
            timeOfNextRequest = now + gap;
            var func = queue.shift();
            func[0].apply(null, func[1]);
        }
        setTimeout(next, timeOfNextRequest - now);
        waiting = true;
    }
    
    function add(func) {
        var args = [].slice.call(arguments, 1);
        queue.push([func, args]);
        if (!waiting) {
            next();
        }
    }
    
    return {
        add: add
    };
}

function getNow() {
    return new Date().getTime();
}
