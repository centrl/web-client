var sockjs = require('./vendor/sockjs-0.3.4.min');
var stomp = require('./vendor/stomp').Stomp;
var _ = require('./bower_components/lodash/dist/lodash');

function CentrlClient(config) {
  var defaultConfig = {
    debug: false,
    heartbeat: false,
    connectionHeaders: {
      login: 'guest',
      passcode: 'guest',
      host: '/'
    },
    headers: {},
    endpoint: "http://127.0.0.1:15674/stomp"
  }
  _.extend(this, defaultConfig, config)

  this.subscriptions = {};
}

CentrlClient.prototype._setup = function() {
  var ws = SockJS(this.endpoint);
  this.client = stomp.over(ws);

  if (this.debug) {
    this.client.debug = _.bind(this._debug, this);
  } else {
    this.client.debug = function() {}; //Drop messages
  }

  if (this.heartbeat) {
    this.client.heartbeat.incoming = this.heartbeat.incoming;
    this.client.heartbeat.outgoing = this.heartbeat.outgoing;
  } else {
    this.client.heartbeat.incoming = 0;
    this.client.heartbeat.outgoing = 0;
  }
}

CentrlClient.prototype._connect = function(onConnect, onError) {
  var self = this;
  
  this.client.connect(this.connectionHeaders, function connectionHandler() {
    self.onConnect(arguments);
    if (onConnect !== null) {
      onConnect.apply(self, arguments);
    }
  }, function errorHandler() {
    if (onError !== null) {
      onError.apply(self, arguments);
    } else {
      self.onError(arguments);
    }
  })
}

CentrlClient.prototype._debug = function() {
  console.log(arguments);
}

CentrlClient.connect = function connect(config, onConnect, onError) {
  //first parameter is a function, we are short-handing to just connecting
  if (typeof config === "function") {
    //Check for presence of second function for error handling.
    if (typeof onConnect === "function") {
      onError = onConnect;
    }
    onConnect = config;
    config = {};

    
  }

  //Setup default configuration, if we gave the short signature,
  //it will be an empty object
  config = config || {};   

  var client = new CentrlClient(config);

  if (typeof onConnect !== "function") {
    onConnect = null
  }

  if (typeof onError !== "function") {
    onError = null
  }

  client._setup();
  client._connect(onConnect, onError);
  return client;
}

CentrlClient.prototype.onConnect = function onConnect() {
  console.log('Connected');
  this.connected = true;
}

CentrlClient.prototype.onError = function onError(err) {
  console.error(err.body);
}

CentrlClient.prototype.subscribe = function subscribe(key, callback, headers) {
  if (!this.connected) {
    return console.error("We do not have a connection! The subscription failed.")
  }

  if (typeof key === "undefined") {
    return console.error("Failed to subscribe to key: " + key);
  }

  if (typeof callback !== "function" && typeof callback !== "undefined") {
    return console.error("The callback must be a function definition or undefined.");
  }

  headers = headers || {};
  this.subscriptions[key] = this.client.subscribe(key, callback, headers);
}

CentrlClient.prototype.unsubscribe = function unsubscribe(key) {
  if (typeof this.subscriptions[key] === "undefined") {
    return console.error("We were not subscribed to the key: " + key);
  }
  this.subscriptions[key].unsubscribe();
  this.subscriptions[key] = undefined;
}

module.exports = CentrlClient