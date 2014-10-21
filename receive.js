var client;
CentrlClient.connect(function() {
  client = this;
  this.subscribe('/topic/test', function(msg) {
    toastr.info(msg.body);
    // setTimeout(function() {
    //   client.unsubscribe('/topic/test');
    // }, 3000);
  })
});

/* More Complete Example showcasing overwriting default configuration. */

//CentralClient.connect({
//  debug: true
//}, function onConnect() {
//  client = this;
//  this.subscribe('/topic/test', function(msg) {
//    toastr.info(msg.body);
//  })
//})