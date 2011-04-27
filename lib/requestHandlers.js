function home(response) {
  console.log("Request handler 'home' was called.");
  response.writeHead(200, {"Content-Type": "text/html"});
  response.write("Welcome Home");
  response.end();
}

exports.home = home;
