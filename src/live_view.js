define(["jquery", "underscore"], function($, _) { 

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
 
  // Contstructs a new live view from a template (css selector, html, or template url)
  // and, optional data.
  LiveView = function(template, data, callback) {
    var that = this
    if(typeof template === "string" && template.match(/.*\.html/)) {
      $.get(template, function(template) {
        that.initialize(template, data, callback)
      })
    } else {
      that.initialize(template, data, callback)
    }
  }

  LiveView.prototype.initialize = function(template, data, callback) {
    callback = callback || function() {}
    var that = this
    this.context = $(template)
    this.collections = {}
    this.data = data = data || {}
    this.id = data.id
    this.context.attr("data-id", this.id) 

    if($("form", this.context)) {
      this.form = new LiveViewForm(this)
    }
    //shorthand for an array of strings
    if(typeof data === "string") {
      data = {value: data}
    }

    this.substitutePartials(function() {
      that.getAttributesWithVariables()

      each(data, function(key, value) {
        that.set(key, value)
      }) 

      callback(that)
    })
  }

  LiveView.prototype.addCollection = function(key, value) {
    this.collections[key] = this[key] = new LiveViewCollection(this.getElementFromName(key, this.context), value, key)
  }

  LiveView.prototype.substitutePartials = function(callback) {
    var partials = $("[data-partial]")
      , length = partials.length
      , completed = 0
    if(length == 0) {
      callback()
    } else {
      partials.each(function(index, element) {
        template = $(element).attr("data-partial")
        $.get(template, function(r) {
          $(element).html(r.responseText)
          if((++completed) == length) {
            callback()
          }
        })
      })
    }
  }

  LiveView.prototype.getAttributesWithVariables = function() {
    var orig = []
    $("[data-var]", this.context).each(function(i, el) {
      var attrs = []
      orig.push({attrs: attrs, element: el})
      for(var i = 0; i < el.attributes.length; i++) {
         var attrib = el.attributes[i]
         if(attrib.specified == true) {
           var memo = { name: attrib.name
                      , value: attrib.value }
         }
         attrs.push(memo)
      } 
    })

    this.setAttributeOfElement = function(name, value) {
      _(orig).each(function(obj) {
        var element = $(obj.element)
        _(obj.attrs).each(function(memo) {
          regex = new RegExp("#{" + name + "}","g")
          if(memo.value.match(regex)) {
            element.attr(memo.name, memo.value.replace(regex, value.content))
          }
        })
      })
    }
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
    var that = this
    if(value == null) {
      value = ""
    }
    if(arguments.length !== 2) {
      each(name, this.set, this)
    } else {
      if(isArray(value)) {
        this.addCollection(name, value)
        return
      }

      var element = this.getElementFromName(name, this.context)

      if(typeof value == "boolean") {
        value = {visible: value}
      } else if(typeof value !== "object") {
        value = {content: value}
      } 

      this.setAttributeOfElement(name, value)

      element.each(function(index, element) {
        el = $(element)
        tagName = element.tagName
        each(value, function(key, value) {
          if(key === "content") {
            if(tagName.toLowerCase() == "input") {
              if(el.attr("type").toLowerCase() == "file") {
                el.attr("data-value", value)
              } else {
                el.val(value)
              }
            } else {
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

  var LiveViewCollection = function(container, data, name) {
    this.container = container
    this.collection = []
    this.views = {}
    this.events = {}
    this.name = name
    this.templates = container.children().remove()
    this.container.html("")
    this.append(data)
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
      id = data.id
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

  var LiveViewForm = function(view) {
    this.view = view
    var that = this
    this.bindValues()
  }

  LiveViewForm.prototype.bindValues = function() {
    var that = this
    $("input[data-value-bind]", this.context).live("change", function() {
      var element = $(this)
        , name = element.attr("data-value-bind")

      if(this.tagName.toLowerCase() == "input") {
        if(element.attr("type") == "file") {
          fileElement = $(this)
          file = this.files[0]
          reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = function (e) {
            that.view.set(name, e.target.result)
          }
        } else {
          that.view.set(name, element.value)
        }

      }
    }) 
  }

  return LiveView
})
