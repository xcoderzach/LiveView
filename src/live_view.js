(function() {
  var iterables = {};
  var LiveView = function(template) {
    this.template = $(template).clone(true).get(0);
    this.context = template;
  };

  LiveView.prototype.set = function(name, value) {
    $("." + name, this.context).html(value);
  };


  LiveView.prototype.add = function(name) {
    var iterable = iterables[name];
    $("." + name, this.template);
  };

}());
