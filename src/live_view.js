var LiveView;

(function($) {

  function each(data, fn, context) {
    var i;
    for(i in data) {
      if(data.hasOwnProperty(i)) {
        fn.call(context, i, data[i]);
      }
    }
  }

  function merge(obj1, obj2) {
    var i;
    for(i in obj2) {
      if(obj2.hasOwnProperty(i)) {
        obj1[i] = obj2[i];
      }
    }
  }

  var isArray = Array.isArray || function (array) {
    return Object.prototype.toString.call(array) === '[object Array]';
  };

  //put an element back
  function reattach(element, parent, placeholder) {
    parent.insertBefore(element, placeholder.nextSibling);
    parent.removeChild(placeholder);
  } 

  // Contstructs a new live view from a template (css selector, or html)
  // and, optional data.
  LiveView = function(template, data) {
    this.context = $(template);
    this.hiddenElements = {};
    this.data = {};
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
    var elements = $("." + name, context);
    each(this.hiddenElements, function(index, obj) { 
      elements = elements.add($(obj.el).find("." + name));
    }, this);
    return elements;
  };

  // Toggles whether a named item is visible on the page
  LiveView.prototype.toggle = function(name) {
    if(this.hiddenElements[name]) {
      this.set(name, true);
    } else {
      this.set(name, false);
    }
  };

  LiveView.prototype.setVisible = function(name, value) {
    var element = this.getElementFromName(name, this.context);
    if(this.hiddenElements[name] && value !== false && value.visible !== false) {
      var obj = this.hiddenElements[name];
      reattach(obj.el, obj.par, obj.placeholder);
      delete this.hiddenElements[name];
    } 
    if (value === false) {
      var p = element.parent().get(0);
      var e = element.get(0);
      var placeholder = document.createComment("placeholder");
      p.insertBefore(placeholder, e);
      element.detach();
      this.hiddenElements[name] = {
        placeholder: placeholder,
        par: p,
        el: e
      };
    } 
  };

  // Sets the values of named element to value, also 
  // can take an object of name value pairs to bulk set
  LiveView.prototype.set = function(name, value) {

    if(arguments.length !== 2) {
      each(name, this.set, this);
    } else {
      var element = this.getElementFromName(name, this.context);

      if(typeof value == "boolean") {
        value = {visible: value};
      } else if(typeof value !== "object") {
        value = {content: value};
      } 

      each(value, function(key, value) {
        if(key === "content") {
          element.html(value);
        } else if(key === "visible") {
          this.setVisible(name, value);
        } else if(key === "class") {
          element.attr("class", name + " " + value);
        } else {
          element.attr(key, value);
        }
      }, this);

      this.data[name] = this.data[name] || {toString: function() { return this.content || ""; }};
      merge(this.data[name], value);
    }
  };

  LiveView.prototype.remove = function() {
    this.context.remove();
  };

  LiveView.prototype.detach = function() {
    this.context.detach();
  };

  LiveView.prototype.attach = function(element) {
    this.context.appendTo(element);
  };

  LiveView.prototype.attach = function(container) {
    container.append(this.context);
  };

  var LiveViewCollection = function(container, data) {
    this.container = container;
    this.collection = [];
    this.events = {};
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
        if(this.collection[i].data[field].content === value) {
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

  LiveViewCollection.prototype.on = function(evt, fn) {
    this.events[evt] = this.events[evt] || [];
    this.events[evt].push(fn);
  };

  LiveViewCollection.prototype.emit = function(evt) {
    var args = [].splice.call(arguments, 1);
    each(this.events[evt], function(i, fn) {
      fn.apply(null, args);
    });
  };

  //detach all elements from the dom, to prepare to reorder
  //them
  LiveViewCollection.prototype.detachAll = function() {
    each(this.collection, function(i, view) {
      view.detach();
    });
  };

  LiveViewCollection.prototype.attachAll = function() {
    each(this.collection, function(i, view) {
      view.attach(this.container);
    }, this);
  };

  LiveViewCollection.prototype.reorder = function(newOrder) {
    var newCollection = [],
        i = 0,
        index;
    this.detachAll();
    for(i = 0 ; i < newOrder.length ; i++) {
      index = newOrder[i];
      newCollection[i] = this.collection[index];
    }
    this.collection = newCollection;
    this.attachAll();
  };

  // add an item to the collection if the collection is sorted
  // adds it in the right place, otherwise add it at the end
  // return a the new liveView when completed
  LiveViewCollection.prototype.add = function(data) {
    var element,
        view;
    if(!isArray(data)) {
      element = this.template.clone(true);
      view = new LiveView(element, data);

      this.container.append(element);
      this.collection.push(view);
      this.emit("add", element, data);
      return view;
    } else {
      each(data, function(i, item) { this.add(item); }, this);
    }
  };

}(jQuery));
