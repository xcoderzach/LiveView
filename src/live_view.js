 var LiveView

(function($) {

  function each(data, fn, context) {
    var i
    for(i in data) {
      if(data.hasOwnProperty(i)) {
        fn.call(context, i, data[i])
      }
    }
  }

  function merge(obj1, obj2) {
    var i
    for(i in obj2) {
      if(obj2.hasOwnProperty(i)) {
        obj1[i] = obj2[i]
      }
    }
  }

  var isArray = Array.isArray || function (array) {
    return Object.prototype.toString.call(array) === '[object Array]'
  }
 
  // Contstructs a new live view from a template (css selector, or html)
  // and, optional data.
  LiveView = function(template, data) {
    this.context = $(template)
    this.collections = {}
    data = data || {}
    this._id = data._id
    this.context.attr("data-id", this._id) 
    if(this.context.attr("data-liveview") === "true") {
      this.bootstrap()
    } else {
      this.context.attr("data-liveview", true) 
    }
    //shorthand for an array of strings
    if(typeof data === "string") {
      data = {value: data}
    }
    each(data, function(key, value) { 
      if(isArray(value)) {
        this.collections[key] = this[key] = new LiveViewCollection(this.getElementFromName(key, this.context), value, key)
      } else {
        this.set(key, value)
      }
    }, this)
  }

  LiveView.prototype.serialize = function() {
    this.context.attr("data-liveview", true)
    each(this.collections, function(key, collection) {
      collection.serialize()
    })
  }  

  LiveView.prototype.bootstrap = function() {
    var that = this
    this.context.removeAttr("data-liveview")
    this.context.children("[data-liveview-collection]").each(function(index, element) {
      var name = $(element).attr("data-liveview-collection")
      that[name] = new LiveViewCollection($(element), [], name)
    })
  }

  // Given the name of the data a user passed in, return an element
  // to populate with that data
  LiveView.prototype.getElementFromName = function(name, context) {
    if($(context).is("." + name)) {
      return context
    }
    var elements = $("." + name, context)
    each(this.hiddenElements, function(index, obj) { 
      elements = elements.add($(obj.el).find("." + name))
    }, this)
    return elements
  }

  // Toggles whether a named item is attached on the page
  LiveView.prototype.toggle = function(name) {
    if(this.hiddenElements[name]) {
      this.set(name, true)
    } else {
      this.set(name, false)
    }
  }

  LiveView.prototype.setVisible = function(name, value) {
    var element = this.getElementFromName(name, this.context)
      , value
    //anything but strict false
    if (value === false) {
      $(element).hide()
    } else {
      $(element).show()
    }
  }

  // Sets the values of named element to value, also 
  // can take an object of name value pairs to bulk set
  LiveView.prototype.set = function(name, value) {
    if(arguments.length !== 2) {
      each(name, this.set, this)
    } else {
      var element = this.getElementFromName(name, this.context)

      if(value && value.hasOwnProperty("mapper")) {
        value = value.mapper(value)
        delete value.mapper
      }

      if(typeof value == "boolean") {
        value = {visible: value}
      } else if(typeof value !== "object") {
        value = {content: value}
      } 

      each(value, function(key, value) {
        if(key === "content") {
          element.html(value)
        } else if(key === "visible") {
          this.setVisible(name, value)
        } else if(key === "class") {
          element.attr("class", name + " " + value)
        } else {
          element.attr(key, value)
        }
      }, this)
    }
  }

  LiveView.prototype.remove = function() {
    this.context.remove()
  }

  LiveView.prototype.detach = function() {
    this.context.detach()
  }

  LiveView.prototype.attach = function(element) {
    this.context.appendTo(element)
  }

  LiveView.prototype.attach = function(container) {
    container.append(this.context)
  }

  var LiveViewCollection = function(container, data, name) {
    this.container = container
    this.collection = []
    this.views = {}
    this.events = {}
    this.name = name
    if(container.attr("data-liveview-collection")) {
      this.bootstrap()
    } else {
      this.templates = container.children().remove()
      this.container.html("")
    }
    this.append(data)
  }

  LiveViewCollection.prototype.serialize = function() {
    this.container.attr("data-liveview-collection", this.name)
    this.container.append($('<div class = "liveview-templates" style = "display:none;">').append(this.templates))
    each(this.collection, function(index, id) {
      this.views[id].serialize()
    }, this)
  }

  LiveViewCollection.prototype.bootstrap = function() {
    var that = this
    this.container.removeAttr("data-liveview-collection")
    this.templates = $(".liveview-templates", this.container).remove().children().remove()
    this.container.children("[data-liveview]").each(function(index, element) {
      that.appendView(new LiveView(element, {}))
    })
  }

  LiveViewCollection.prototype.getTemplate = function(type) {
    if(!type) {
      return $(this.templates[0])
    } else {
      return $(this.templates.filter("." + type)[0])
    }
  }

  // If one argument, returns view at that index
  // if two, returns first element with data
  // where key arg1 === arg2
  LiveViewCollection.prototype.get = function(id) {
      return this.views[id]
  }

  // number of live views in this collection
  LiveViewCollection.prototype.length = function() {
    return this.collection.length
  }
 
  LiveViewCollection.prototype.remove = function(id) {
    this.collection.splice(this.collection.indexOf(id), 1)
    var view = this.views[id]
    delete this.views[id]
    return view.remove()
  }

  // add it at the end
  // return a the new liveView when completed
  LiveViewCollection.prototype.insert = function(data, index) {
    var element
      , view
      , type
      , id

    if(!isArray(data)) {
      type = data.type || "";
      id = data._id
      element = this.getTemplate(type).clone(true)
      view = new LiveView(element, data)

      if(index === undefined) {
        this.appendView(view, id)
      } else {
        this.insertView(view, index, id)
      }
      return view
    } else {
      each(data, function(i, item) { this.append(item) }, this)
    }
  }

  LiveViewCollection.prototype.append = function(data) {
    if(!isArray(data)) {
      return this.insert(data)
    } else {
      each(data, function(i, item) { this.append(item) }, this)
    }
  } 

  LiveViewCollection.prototype.appendView = function(view, id) {
    this.container.append(view.context.detach())
    this.collection.push(id)
    this.views[id] = view
  }

  LiveViewCollection.prototype.insertView = function(view, index, id) {
    view.context.detach().insertBefore(this.container.children()[index])
    this.collection.splice(index, 0, index)
    this.views[id] = view
  } 

}(jQuery)) 
