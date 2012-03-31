LiveView API Documentation 
==========================

###LiveView Constructor

#####LiveView(template, data, callback, scope)

Constructs a new live view from a template. The `template` may be a template
url, css selector, or html.  `data` refers to the data with which the live view
is initialized.  The `set` method is used to update the live view.  `scope` is
an array of strings that describes the scope, the elements over which the live
view can act, of the live view. If omitted, LiveView will assume the default
scope, "main."

###changeTemplate

#####LiveView.changeTemplate(template) 

Changes the template used by the live view to the one specified.

###find

#####LiveView.find(selector)

Returns elements of a certain type from polymorphic subviews.

###set

#####LiveView.set(name, value)

Sets the value or values of an element `name` to `value`.

###remove

#####LiveView.remove()

Removes the live view, as well as all associated events, from the document.

###detach

#####LiveView.detach()

Removes the live view from the document while leaving events intact.

###attach

#####LiveView.attach(element)

Attaches live view to a particular element.

###attach

#####LiveView.attach(container)

Attaches live view to a particular container.

###LiveViewCollection Constructor

#####LiveViewCollection(container, data, name, scope)

Constructs a new live view collection. Constructor requires a `container`
within the template to contain the view, `data`, a name for the collection, and
an optional `scope`.

###showLoading

#####LiveViewCollection.showLoading() 

Appends a special loading element to the end of the collection if one exists.

###hideLoading

#####LiveViewCollection.hideLoading()

Removes the special loading element from the collection.

###get

#####LiveViewCollection.get(id)

Returns the view at index `id`. If two arguments are used, function returns the
first element with data where key arg1 === arg2

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

Inserts each of an array of views into the live view collection.
