LiveView v0.1
=============

Like templates, except alive!

Table of Contents
-----------------
  * [Introduction](#introduction)
  * [API docs](#api)
  * [Experimental API docs](#experimental)
  * [Examples](#examples)
  * [Tests](#tests)
  * [Contributing](#contributing)
  * [Contributors](#contributors)
  * [License](#license)Why?

<a name = "introduction"></a>

Introduction
------------

LiveView is a pure HTML clean templating engine that supports realtime
modification of data displayed through the template. Basically, it allows you
to make awesome, real-time web apps. __ALL__ of the awesome, real-time web
apps.

LiveView tries to solve the same problems as traditional templating systems and
then some. Rather than generating static markup, LiveView generates a DOM
structure that allows you to update your template and its data on the fly, all
while preserving event handlers and any associated data. This makes the view
portion of creating realtime web apps a breeze!

LiveView is the result of taking all of the techniques I was using to update
the DOM and wrapping them up in a nice template-like interface. It also depends
on jQuery. This could change, but I always use jQuery, so it's not high on my
priority list.

When parts of your web app change rapidly, it's super useful. If your pages
don't update very often, you can probably get away with just inserting HTML
fragment strings into the document.

If you want a system that doesn't clobber your events, associated data, and
element references, LiveView might be for you.

<a name="api"></a>

API docs
--------

You can find the API docs in the docs folder.


<a name = "experimental"></a>

Experimental API docs
---------------------

Experimental API docs will be made available when any part of the project isn't
experimental.


<a name = "examples"></a>

Examples
--------


###I have this html, make it live!


    <div id = "myView">
      <div class = "currentTime"></div>
    </div>

  Sure!

    // set it to the current time
    var view = new LiveView("#myView", {
      "currentTime": (new Date()).toTimeString()
    });
    // and update it every second!
    setInterval(function() {
      view.set("currentTime", (new Date()).toTimeString());
    }, 1000);

###Other templating systems allow me to use conditionals!

  It's true, conditionals are important, and we've got em! Here's an example.  

  Markup first:

    <div id = "conditional">
      <div class = "switch">
        You can't see me if switch is set to false!
      </div>
    </div>
  
  And then a bit of js:

    var view = new LiveView("#conditional", {
      switch: false //strict boolean false, NOT any falsy value
    });

  turn it back on:

    view.set("switch", true);
    // OR
    view.toggle("switch");

  One thing to note, is that conditionals are REMOVED from the document when
  they are set to false, they're not just set to display:none;.

###Dude I need to set the href attribute on a link
 
  Setting attributes is another one of those things that you'll probably need
  to do.  Luckily, you can!

    <div id = "attribute">
      <a href = "#{link}"></a>
      <img src = "#{imagesrc}" alt = "#{imagealt}">
    </div>

  And JS:

    var view = new LiveView("#attribute", {
      link: {href: "http://www.google.com", content: "The googz"}
      image: {src: "/images/mycoolpic.png", alt: "A sweet pic"}
    });

  Or: 

    <div id = "attribute">
      <a class = "link" href="#{theLink}"></a>
      <img class = "image">
    </div>

  And it works with any html attribute, need I say more?

###I have a list of blog posts, how do I show all of them?

  Naturally, any template system is going to have to handle blocks, or
  iterables, or each statements, whatever you want to call them.  Here's how
  you do it with LiveView.  

    <div id = "list">
      <ul class = "posts">
        <li class = "post"> <!-- I like having the class post, but it's not neccessary -->
          <div class = "title"></div>
        </li>
      </ul>
    </div>
  
  The markup must be a container div, with the class name the same as the data's name
  and ONE child element inside of it, which may or may not have a class, up to you.

  Some JS:

    var view = new LiveView("#list", {
      posts: [{title: "A post"}, 
              {title: "Another post"},
              {title: "ANOTHER ONE!"}]
    });

    // We can add them on the fly too!

    var post = view.posts.append({title: "Incoming Post"})
    //we can even change it!
    post.set("title", "Changed")

  That's it, consider it block'd.

<a name = "Contributing"></a>

Contributing
------------

Ideas, feature requests, bug reports, etc are very welcome.

###TODO Before we can release

  * scoping with thing.whatever syntax
  * get tests running with mocha
  * remove stupid features
  * documentation
  * IE8 Support

<a name = "contributors"></a>

Contributors
------------

  * Zach Smith @xcoderzach
  * Eugene Butler @EButlerIV

<a name = "license"></a>
 
License
-------

MIT Licensed (see LICENSE.txt)
