var connect = require("connect")

connect(
  connect.static(__dirname + '/html')
).listen(7357)
