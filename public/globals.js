function loadJSON(callback) {
  var config = new XMLHttpRequest();
  config.overrideMimeType("application/json");
  config.open("GET", "/config.json", false);
  config.onreadystatechange = function() {
    if (config.readyState == 4 && config.status == "200") {
      callback(config.responseText);
    }
  };
  config.send(null);
}

loadJSON(function(response) {
  const settings = JSON.parse(response);
  window.APIaddress =
    settings.protocol + settings.hostname + ":" + settings.port;
});
