LiveView API Documentation 
==========================

##LiveView

#####LiveView(template, data[, scope])

Constructs a new live view from a template. The `template` may be a template
url, css selector, or html.  `data` refers to the data with which the live view
is initialized. `scope` is an array of strings that describe the scope of the 
live view variables. If omitted, LiveView will assume the default scope, "main."

###changeTemplate

#####LiveView.changeTemplate(template) 

Changes the template used by the live view to the one specified. This can be
used to hotswap templates during development.

######TODO: Make hotswapping possible

###find

#####LiveView.find(selector)

Returns elements that match selector. Finds elements in current view as well as
elements in any polymorphic subviews.

###set

#####LiveView.set(name, value)
#####LiveView.set(JSONObject)

Sets the value or values of an element `name` to `value`. If a single object is
passed, set each key in `JSONObject` to its value.

```html
<div class="post"></div>
```

```javascript
LiveView.set("post", "An angry comment about your taste in movies.")
```
If live view was constructed with scopes, you can do the following:

```html
<div class = "title"></div>
<div class = "postTitle"></div>
```

```javascript
var view = new LiveView("template.html", {})
view.set("title", "Another post.")
```
This will set both .title and .postTitle, this can be used to disambiguate classes in subViews.

###remove

#####LiveView.remove()

Removes the live view, as well as all associated events, from the document.

###detach

#####LiveView.detach()

Removes the live view from the document while leaving events intact.

###attach

#####LiveView.attach(container)

Attaches live view to a particular container.

##LiveViewCollection

###showLoading

#####LiveViewCollection.showLoading() 

Appends a special loading element to the end of the collection if any such element exists.

###hideLoading

#####LiveViewCollection.hideLoading()

Removes the special loading element from the collection.

###get

#####LiveViewCollection.get(id)

Returns the view at index `id` in the collection.

###length

#####LiveViewCollection.length()

Returns the number of LiveViews in the collection.

###remove

#####LiveViewCollection.remove(id)

Removes a live view from the collection. Appends special empty view (if one is
defined) if last view is removed.

###removeAll

#####LiveViewCollection.removeAll()

Removes all live views from the collection, appends special empty view if one
exists.


###insert

#####LiveViewCollection.insert(document, index)

Inserts a new view at the `index` or, if no `index` is specified, the end of
the live view collection.  Returns a new live view when completed.

###append

#####LiveViewCollection.append(data)

Inserts a view or each of an array of views into the live view collection.
