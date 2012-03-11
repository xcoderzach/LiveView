var _ = require("underscore")
  , moment = require("moment")
  , cache = require("/templates/cache")

// Constructs a new live view from a template (css selector, html, or template url)
// and, optional data.
var LiveView = function(template, data, callback, scope) {
  var that = this
  this.scope = scope || ["main"]
  this.elementsByName = {}
  if(typeof template === "string" && template.match(/.*\.html/)) {
    if(cache[template]) {
      template = cache[template]
      that.initialize(template, data, callback)
    } else {
      $.get(template, function(template) {
        that.initialize(template, data, callback)
      })
    }
  } else {
    that.initialize(template, data, callback)
  }
}

LiveView.prototype.initialize = function(template, data, callback) {
  callback = callback || function() {}
  var that = this
  this.template = $(template).clone(true)
  this.context = $(template)
  this.collections = {}
  this.subViews = {}
  this.data = data = data || {}
  this.id = data.id

  //shorthand for an array of strings
  if(typeof data === "string") {
    data = { value: data }
  }

  this.getAttributesWithVariables()
  this.set(data) 
  callback(that)
}

LiveView.prototype.addCollection = function(key, value) {
  var element = this.getElementFromName(key)
  if(!this.collections[key]) {
    this.collections[key] = new LiveViewCollection(element, value, key, this.scope)
  } else {
    this.collections[key].removeAll()
    this.collections[key].append(value)
  } 
}

LiveView.prototype.col = LiveView.prototype.collection = function(key, value) {
  if(typeof value == "undefined" || value === null) {
    return this.collections[key]
  } else {
    this.addCollection(key, value)
  }
}                                

LiveView.prototype.getAttributesWithVariables = function() {
  var orig = []
  $("*", this.context).each(function(i, el) {
    var attrs = []
    orig.push({attrs: attrs, element: el})
    for(var i = 0; i < el.attributes.length; i++) {
      var attrib = el.attributes[i]
        , memo
      if(attrib.specified == true) {
        if(attrib.value.match(/#{.*}/)) {
          memo = { name: attrib.name
                 , value: attrib.value }
          attrs.push(memo)
        }
      }
    } 
  })

  this.setAttributeOfElement = function(name, value) {
    var names = _(this.scope.concat(name)).reduceRight(function(memo, scope) {
      memo.unshift(scope + _.capitalize(_.first(memo) || ""))
      return memo
    }, [])
    _(orig).each(function(obj) {
      var element = $(obj.element)
      _(obj.attrs).each(function(memo) {
        _(names).each(function(name) {
          var regex = new RegExp("#{" + name + "}","g")
          if(memo.value.match(regex)) {
            element.attr(memo.name, memo.value.replace(regex, value.content))
          }
        })
      })
    })
  }
}

// Given the name of the data a user passed in, return an element
// to populate with that data
LiveView.prototype.getElementFromName = function(name) {
  if(this.elementsByName[name]) {
    return this.elementsByName[name]
  }
  var context = this.context
  if($(context).is("." + name)) {
    return context
  }

  var names = _(this.scope.concat(name)).reduceRight(function(memo, scope) {
    memo.unshift(scope + _.capitalize(_.first(memo) || ""))
    return memo
  }, [])
  var elements = $()
  _(names).each(function(name) {
    elements = elements.add("." + name, context)
  })
  this.elementsByName[name] = elements
  return elements
}

LiveView.prototype.setVisible = function(name, value) {
  var element = this.getElementFromName(name)
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
  var that = this
    , obj
  if(value == null) {
    value = ""
  }
  if(arguments.length !== 2) {
    _.each(name, function(value, key) {
      that.set(key, value)
    })
  } else {
    if(_.isArray(value)) {
      this.addCollection(name, value)
      return
    }

    if(typeof value == "boolean") {
      value = {visible: value}
    } else if(typeof value !== "object") {
      value = {content: value}
    } 

    this.setAttributeOfElement(name, value)

    var element = this.getElementFromName(name)

    element.each(function(index, element) {
      var el = $(element)
        , format = el.attr("data-date-format")
      tagName = element.tagName
      _.each(value, function(value, key) {
        if(key === "content") {
          if(tagName.toLowerCase() == "input" || tagName.toLowerCase() == "select") {
            if(el.attr("type") && el.attr("type").toLowerCase() == "file") {
              el.attr("data-value", value)
            } else {
              el.val(value)
            }
          } else {
            if (format) {
              var momentFormat = moment(value)
              value = momentFormat.format(format)
            }
            el.html(value)
          }
        } else if(key === "visible") {
          that.setVisible(name, value)
        } else if(key === "class") {
          el.attr("class", name + " " + value)
        } else {
          el.attr(key, value)
        }
      })
    }) 
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

var LiveViewCollection = function(container, data, name, scope) {
  this.container = container
  this.collection = []
  this.name = name
  this.scope = scope.concat(_.singularize(name))
  this.views = {}
  this.events = {}

  this.name = name

  this.empty = container.find("." + name + "Empty").remove()
  this.templates = container.children().remove()

  this.container.html("")
  this.append(data)

  if (this.collection.length === 0) {
    this.container.append(this.empty)
  }
}

LiveViewCollection.prototype.getTemplate = function(type) {
  if(!type) {
    return $(this.templates[0])
  }
  var template = $(this.templates.filter("." + type)[0])
  if(template.length === 0) {
    return $(this.templates[0])
  } else {
    return template
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
  return this.collection.moment.jslength
}

LiveViewCollection.prototype.remove = function(id) {
  this.collection.splice(this.collection.indexOf(id), 1)
  var view = this.views[id]
  delete this.views[id]
  if(this.collection.length === 0) {
    this.container.append(this.empty)  
  }
  return view.remove()
}

LiveViewCollection.prototype.removeAll = function() {
  _.each(this.views, function(view) {
    view.remove()
  })
  this.collection = []
  this.container.html("")
  this.views = {}
  this.container.append(this.empty)  
}

// add it at the end
// return a the new liveView when completed
LiveViewCollection.prototype.insert = function(document, index) {
  var view
    , id
    , type
    , element
    , that = this

  if(!_.isArray(document)) {
    this.empty.remove()
    document = document || {}

    if(typeof document.get === "function") {
      type = document.get("type") || document.get("itemType") || ""
    } else {
      type = document.type || ""
    }

    id = document.id
    element = this.getTemplate(type).clone(true)
    view = new LiveView(element, document, function() {}, this.scope)  

    if(index === undefined) {
      this.appendView(view, id)
    } else {
      this.insertView(view, index, id)
    }
    return view
  } else {
    if(typeof document.each === "function") {
      document.each(function(item) { that.insert(item, index) })
    } else {
    _.each(document, function(item) { this.insert(item, index) }, this)
    }
  }
}

LiveViewCollection.prototype.append = function(data) {
  if(!_.isArray(data)) {
    return this.insert(data)
  } else {
    _.each(data, function(item) { this.append(item) }, this)
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

module.exports = LiveView
