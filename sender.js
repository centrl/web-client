var ws = SockJS('http://127.0.0.1:15674/stomp');
var client = Stomp.over(ws);
client.debug = function() {}
client.heartbeat.outgoing = 0;
client.heartbeat.incoming = 0;
var onConnect = function() {
  console.log("Connected");
  ThePaces()
}
var onMsg = function() {
  console.log(arguments);
}
var onError = function() {
  console.error("Error!");
  console.error(arguments);
}
client.connect('guest', 'guest', onConnect, onError, '/')

function ThePaces() {
  console.log("Beginning in five seconds...");
  setTimeout(function() {
    for (var i = 1; i <= 10; i++) {
      (function(i) {
        console.log("Waiting " + i + " seconds.");
        setTimeout(function() {
          console.log("Sending Message")
          client.send("/topic/test", {}, "Hello, Message Number " + i);  
        }, (i * 1000))
      })(i)
    }
  }, 5000); 
}