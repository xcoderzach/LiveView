var LiveView;
(function() {

  function each(data, fn, context) {
    var i;
    for(i in data) {
      if(data.hasOwnProperty(i)) {
        fn.call(context, i, data[i]);
      }
    }
  }

  var isArray = Array.isArray || function (array) {
    return Object.prototype.toString.call(array) === '[object Array]';
  };
  
  function collectPreviousNodes(element, parent) {
    var prev = [];
    var el = element.previousSibling;
    while(el !== null) {
      prev.push(el);
      el = el.previousSibling;
    }
    return prev;
  }
 
  // When reattaching a hidden element we start at the sibling element
  // immediately before it, if that element is still attached, we put
  // our element before it, if there are no elements before it
  // we just prepend it to its parent
  function reattach(element, parent, siblings) {
    var i;
    for(i = 0 ; i < siblings.length ; i++) {
      $.contains(parent, siblings[i]); 
      parent.insertBefore(element, siblings[i].nextSibling);
      return;
    }
    element.prependTo(parent);
  } 


  LiveView = function(template, data) {
    var that = this;
    this.context = template;
    this.data = data || {};
    this.hiddenElements = {};
    each(data, function(key, value) { 
      if(isArray(value)) {
        this[key] = new LiveViewCollection(this.getElementFromName(key, this.context), value);
      } else {
        this.set(key, value);
      }
    }, this);
  };



  LiveView.prototype.getElementFromName = function(name, context) {
    return $("." + name, context);
  };

  LiveView.prototype.toggle = function(name) {
    if(this.hiddenElements[name]) {
      this.set(name, true);
    } else {
      this.set(name, false);
    }
  };

  LiveView.prototype.set = function(name, value) {
    // if we're setting a hidden element and it's not already hidden 
    // unhide it
    if(this.hiddenElements[name] && value !== false) {
      var obj = this.hiddenElements[name];
      reattach(obj.el, obj.par, obj.sibs);
      delete this.hiddenElements[name];
    } 
    var element = this.getElementFromName(name, this.context);
    if(arguments.length !== 2) {
      each(name, this.set, this);
    } else {
      this.data[name] = value;
      if(typeof value === "object") {
        each(value, function(key, value) {
          if(key === "content") {
            element.html(value);
          } else {
            element.attr(key, value);
          }
        }, this);
      } else if (value === false) {
        var p = element.parent().get(0);
        var e = element.get(0);
        var s = collectPreviousNodes(e, p);
        element.detach();
        this.hiddenElements[name] = {
          sibs: s,
          par: p,
          el: e
        }
      } else if(value === true) {
        //we already unhide the element so...do nothing!
      } else {
        element.html(value);
      }
    }
  };

  LiveView.prototype.remove = function() {
    this.context.remove();
  };

  LiveView.prototype.detach = function() {
    this.context.detach();
  };

  LiveView.prototype.attach = function(container) {
    container.append(this.context);
  };

  var LiveViewCollection = function(container, data) {
    this.container = container;
    this.collection = [];
    this.template = $(container.children()[0]).remove();
    this.container.html("");
    this.add(data);
  };


  LiveViewCollection.prototype.get = function(i) {
    return this.collection[i];
  };

  LiveViewCollection.prototype.remove = function(i) {
    return this.collection.splice(i, 1)[0].remove();
  };

  LiveViewCollection.prototype.removeAll = function() {
    var old = this.collection.splice(0);
    each(old, function(i, item) {
      item.remove();
    });
    return old;
  }; 

  LiveViewCollection.prototype.detachAll = function() {
    var old = this.collection.splice(0);
    each(old, function(i, item) {
      item.detach();
    });
    return old;
  };

  LiveViewCollection.prototype.add = function(data) {
    var element;
    if(isArray(data)) {
      each(data, function(i, item) { this.add(item); }, this);
    } else {
      element = this.template.clone(true);
      if(this.currentSortFunction) {
        for(var i = 0 ; i < this.collection.length; i++) {
          if(this.currentSortFunction(this.collection[i].data, data) > 0) {
            element.insertBefore(this.collection[i].context);
            this.collection.splice(i, 0, new LiveView(element, data));
            return;
          }
        }
      }
      // if the above loop doesn't return, or the list isn't sorted
      // add it to the end 
      this.container.append(element);
      this.collection.push(new LiveView(element, data));
    }
  };

  LiveViewCollection.prototype.sort = function(fn) {
    this.currentSortFunction = fn;
    var sorted = this.detachAll().sort(function(x, y) {
      return fn(x.data, y.data);
    });                           
    this.collection = sorted;
    each(sorted, function(i, item) {
      item.attach(this.container);
    }, this);
  };

  LiveViewCollection.sortBy = function(feild, isDesc) {
    this.clear.sort(function(x, y) {
      return fn(x.data, y.data);
    });
  };


}());
