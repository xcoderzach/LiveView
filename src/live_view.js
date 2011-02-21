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
  
  function collectNextNodes(element, parent) {
    var next = [];
    var el = element.nextSibling;
    while(el !== null) {
      next.push(el);
      el = el.nextSibling;
    }
    return next;
  }

  function collectNodes(attribute, element, parent) {
    var arr = [],
        el = element[attribute];
    while(el !== null) {
      arr.push(el);
      el = el[attribute];
    }
    return arr;
  }
 
  // When reattaching a hidden element we start at the sibling element
  // immediately before it, if that element is still attached, we put
  // our element before it, if there are no elements before it
  // we just prepend it to its parent
  function reattach(element, parent, next, prev) {
    var i;
    for(i = 0 ; i < next.length ; i++) {
      if($.contains(parent, next[i])) {
        parent.insertBefore(element, next[i]);
        return;
      }
    }
    for(i = 0 ; i < prev.length ; i++) {
      if($.contains(parent, prev[i])) {
        //this is actually insert after
        parent.insertBefore(element, prev[i].nextSibling);
        return;
      }
    } 
    // just put the element anywhere, since there are no  visible siblings
    parent.insertBefore(element, null);
  } 

  // Contstructs a new live view from a template (css selector, or html)
  // and, "optional" data
  LiveView = function(template, data) {
    var that = this;
    this.context = $(template);
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

  // Given the name of the data a user passed in, return an element
  // to populate with that data
  LiveView.prototype.getElementFromName = function(name, context) {
    return $("." + name, context);
  };

  // Toggles whether a named item is visible on the page
  LiveView.prototype.toggle = function(name) {
    if(this.hiddenElements[name]) {
      this.set(name, true);
    } else {
      this.set(name, false);
    }
  };
  // Sets the values of named element to value, also 
  // can take an object of name value pairs to bulk set
  LiveView.prototype.set = function(name, value) {

    if(arguments.length !== 2) {
      each(name, this.set, this);
    } else {
      // if we're setting a hidden element and it's not already hidden 
      // unhide it
      if(this.hiddenElements[name] && value !== false && value.hidden !== false) {
        var obj = this.hiddenElements[name];
        reattach(obj.el, obj.par, obj.next, obj.prev);
        delete this.hiddenElements[name];
      } 
      var element = this.getElementFromName(name, this.context);
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
        var next = collectNodes("nextSibling", e, p);
        var prev = collectNodes("previousSibling", e, p);
        element.detach();
        this.hiddenElements[name] = {
          next: next,
          prev: prev,
          par: p,
          el: e
        };
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

  // If one argument, returns view at that index
  // if two, returns first element with data
  // where key arg1 === arg2
  LiveViewCollection.prototype.get = function(index) {
    var i;
    if(arguments.length === 2) {
      var field = arguments[0];
      var value = arguments[1];
      for(i = 0 ; i < this.collection.length ; i++) {
        if(this.collection[i].data[field] === value) {
          return this.collection[i];
        }
      }
    } else {
      return this.collection[index];
    }
  };

  // number of live views in this collection
  LiveViewCollection.prototype.length = function() {
    return this.collection.length;
  };
 
  LiveViewCollection.prototype.remove = function(i) {
    return this.collection.splice(i, 1)[0].remove();
  };

  //wipe out everything no more jquery event listeners or associated data
  LiveViewCollection.prototype.removeAll = function() {
    var old = this.collection.splice(0);
    each(old, function(i, item) {
      item.remove();
    });
    return old;
  }; 

  //detach all event listeners but keep associated jquery data
  LiveViewCollection.prototype.detachAll = function() {
    var old = this.collection.splice(0);
    each(old, function(i, item) {
      item.detach();
    });
    return old;
  };

  // add an item to the collection if the collection is sorted
  // adds it in the right place, otherwise add it at the end
  // return a the new liveView when completed
  LiveViewCollection.prototype.add = function(data) {
    var element,
        view;
    if(isArray(data)) {
      each(data, function(i, item) { this.add(item); }, this);
    } else {
      element = this.template.clone(true);
      view = new LiveView(element, data);
      if(this.currentSortFunction) {
        for(var i = 0 ; i < this.collection.length; i++) {
          if(this.currentSortFunction(this.collection[i].data, data) > 0) {
            element.insertBefore(this.collection[i].context);
            this.collection.splice(i, 0, view);
            return view;
          }
        }
      }
      // if the above loop doesn't return, or the list isn't sorted
      // add it to the end 
      this.container.append(element);
      this.collection.push(view);
      return view;
    }
  };

  // sort using a function, the function takes two data parameters
  // bleh....
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

  // sortBy by is a convenience method, if you don't want
  // to write your own sort function. Sorts the field given,
  // alphabetically
  LiveViewCollection.prototype.sortBy = function(field, isAsc) {
    isAsc = (isAsc) ? -1 : 1;
    this.sort(function(x, y) {
      return x[field].localeCompare(y[field]) * isAsc;
    });
  };

  // limit the number of things we show, chop off
  // anything that doesn't fit!
  //
  // example
  //     collection.limit(10);
  // would only show the first ten items in a collection
  // anything else is still in memory, and would show up
  // if you changed the sort
  LiveViewCollection.limit = function(count) {
    throw("not implemented");
  };
}());
