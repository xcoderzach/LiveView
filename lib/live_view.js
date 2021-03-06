var moment = require("moment")
  , cache  = require("/templates/cache")
  , _      = require("underscore")

function escapeForHTML(str) {
  return (str + "")
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    
}

// Constructs a new live view from a template (css selector, html, or template url)
// and, optional data.
var LiveView = function(template, data, scope) {
  var that = this
  this.scope = scope || ["main"]
  this.elementsByName = {}
  if(typeof template === "string" && template.match(/.*\.html/)) {
    if(cache[template]) {
      template = cache[template]
      that.initialize(template, data)
    }
  } else {
    that.initialize(template, data)
  }
}

LiveView.prototype.initialize = function(template, data) {
  var that = this

  this.collections = {}
  this.subViews = {}
  this.data = {}
  this.id = data.id 
  this.polymorphicTemplates = {}
  if(_.isArray(template)) {
    this.allContexts = $()
    this.allTemplates = _(template).map(function(context) {
      context = $(context)
      var templateClasses = context.attr("class").split(" ")
      _(templateClasses).each(function(templateClass) {
        that.polymorphicTemplates[templateClass] = context
      })
      that.allContexts = that.allContexts.add(context)
      return context
    })
    this.context = $(this.allTemplates[0])
  } else {
    this.context = $(template)
    this.allContexts = this.context
    this.allTemplates = [this.context]
  }
  this.getAttributesWithVariables()
  this.set(data) 
}

LiveView.prototype.changeTemplateFromPolymorphicKey = function(key, value) {
  value = _(value.toString()).capitalize()
  var polymorphicKey = key + value
    , that = this
    , newTemplate 

  //first check if it's actually a polymorphic key
  newTemplate = this.polymorphicTemplates[polymorphicKey]
  if(newTemplate && newTemplate != this.context) {
    this.changeTemplate(newTemplate)
  }
}

LiveView.prototype.changeTemplate = function(template) {
  var that = this
  if(this.context[0] != template[0]) {
    this.context.replaceWith(template)
    this.context = template
  }
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
        if(memo.name.match(/^on/)) {
          throw new Error("Don't use inline events, it's not secure and not supported")
        } 
        _(names).each(function(name) {
          var regex = new RegExp("#{" + name + "}","g")
          if(memo.value.match(regex)) {
            element.attr(memo.name, memo.value.replace(regex, value))
          }
        })
      })
    })
  }
}

//we need this method to get elements from polymorphic subviews
LiveView.prototype.find = function(selector) {
  var elements = $()
    , that = this
  _(this.allTemplates).each(function(context) {
    if(context.is(selector)) {
      elements = elements.add(context)
    }
    elements = elements.add($(selector, context))
  })
  return elements
}

// Given th name of the data a user passed in, return an element
// to populate with that data
LiveView.prototype.getElementFromName = function(name, prefix) {
  if(prefix == undefined) {prefix = ""}
  if(this.elementsByName[prefix + name]) {
    return this.elementsByName[prefix + name]
  }
  var elements = $()
    , that = this

  _(this.allTemplates).each(function(context) {
    var names = _(that.scope.concat(name)).reduceRight(function(memo, scope) {
      memo.unshift(scope + _.capitalize(_.first(memo) || ""))
      return memo
    }, [])
    _(names).each(function(n) {
      if(prefix){n=_.capitalize(n)}
      elements = elements.add($("." + prefix + n, context))
      if(context.is("." + prefix + n)) {
        elements = elements.add(context)
      }
    })
  })
  this.elementsByName[prefix + name] = elements
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

  if(arguments.length !== 2) {
    _.each(name, function(value, key) {
      that.set(key, value)
    })
  } else {
    if(_.isArray(value)) {
      this.addCollection(name, value)
      return
    }

    var isElements = this.getElementFromName(name, "is")
      , switchElements = isElements.add(this.getElementFromName(name, "has"))
      , notElements = this.getElementFromName(name, "no")
    if(switchElements.length) {
      if(!value) {
        switchElements.hide()
        notElements.show()
      } else {
        switchElements.show()
        notElements.hide()
      }
    }

    this.setAttributeOfElement(name, value)

    var element = this.getElementFromName(name)
    element.each(function(index, element) {
      var el = $(element)
        , format = el.attr("data-date-format")
        , now = el.attr("data-date-from-now")

      tagName = element.tagName
      if(tagName.toLowerCase() == "input" || tagName.toLowerCase() == "select") {
        if(el.attr("type") && el.attr("type").toLowerCase() == "file") {
          el.attr("data-value", value)
        } else if(el.attr("type").toLowerCase() == "checkbox" || el.attr("type").toLowerCase() == "radio") {
          el.attr("checked", value)
        } else {
          el.val(value)
        }
      } else {
        if (format) {
          var momentFormat = moment(parseInt(value))
          value = momentFormat.format(format)
        } else if (typeof now !== "undefined") {
          !function() {
            var n = name
              , v = value
            setTimeout(function() {
              that.set(n, v)
            }, 60000)
          }()

          var momentNow = moment(value)
          value = momentNow.fromNow()
        }
        el.html(escapeForHTML(value))
      }
    }) 
    this.data[name] = value
    if(value) {
      this.changeTemplateFromPolymorphicKey(name, value)
    }
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
  this.loading = container.find("." + name + "Loading").remove()
  this.templates = container.children().remove()

  this.container.html("")
  this.append(data)

  if (this.collection.length === 0) {
    this.container.append(this.empty)
  }
}

LiveViewCollection.prototype.showLoading = function() {
  if(this.loading) {
    this.empty.remove()
    this.container.append(this.loading)
  }
}

LiveViewCollection.prototype.hideLoading = function() {
  if(this.loading) {
    this.loading.remove()
    if(this.collection.length === 0) {
      this.container.append(this.empty)
    }
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
    , element
    , that = this

  if(!_.isArray(document)) {
    this.empty.remove()
    document = document || {}

    id = document.id
    view = new LiveView($.makeArray(this.templates.clone()), document, this.scope)

    if(typeof index === "undefined") {
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
  if(this.collection.length === 0) {
    index = 0
    this.container.append(view.context.detach())
  } else if (this.collection.length <= index) {
    this.container.append(view.context.detach())
  } else {
    view.context.insertBefore(this.container.children()[index])
  }
  this.collection.splice(index, 0, id)
  this.views[id] = view
} 

module.exports = LiveView
