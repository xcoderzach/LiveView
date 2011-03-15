LiveView v0.1
=============
Like templates, except alive!

Disclaimer
==========

  This is experimental, if you poke it too hard it might break.  You've been
  warned.

Why?
====

  I wanted a way to have templates that could be defined in semantic markup
  and, given JSON could generate my markup.

  I also wanted a way to create update and delete data that had been given to
  my templates on the fly.

#### The DOM isn't a string! Don't treat it like one!

What?
=====

  Rather than create a seperate language for templating, LiveView uses a 
  stricter subset of html.  

  LiveView trys to solve the same problems as traditional templating systems,
  and then some.  Rather than generating static markup, LiveView generates a
  living, breathing thing, that allows you to update the your template and it's
  data on the fly.  All while preserving event handlers and any associated
  data.  This makes the view portion of creating realtime web apps a breeze!

  LiveView is the result of taking all of the techniques I was using to update
  the DOM and wrapped in a nice template like interface.  

  It also depends on jquery, this could change, but I always use jQuery so
  it's not high on my priority list.

When should I use this?
=======================
  
  When parts of your web app are changing rapidly, it's super useful.  LiveView
  is best suited for realtime web applications.  If your page doesn't update
  very often you can probably get away with just inserting HTML fragment
  strings into the document.  

  If you want a system that doesn't clobber your events, associated data, and
  element references, LiveView might be for you.


I have this html, make it live!
===============================

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

Other templating systems allow me to use conditionals!
======================================================

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

Dude I need to set the href attribute on a link 
===============================================

  Setting attributes is another one of those things that you'll probably need
  to do.  Luckily, you can!

    <div id = "attribute">
      <a class = "link"></a>
      <img class = "image">
    </div>

  And JS:

    var view = new LiveView("#attribute", {
      link: {href: "http://www.google.com", content: "The googz"}
      image: {src: "/images/mycoolpic.png", alt: "A sweet pic"}
    });

  And it works with any html attribute, need I say more?

I have a list of blog posts, how do I show all of them?
=======================================================

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

    var post = view.posts.append({title: "Incoming Post"});
    //we can even change it!
    post.set("title", "Changed");

  That's it, consider it block'd.

So I've got these blocks, but they're in the wrong order! 
=========================================================

  Then sort them!

     <div id = "sort">
      <ul class = "numbers">
        <li class = "number">
          <div class = "digits"></div>
        </li>
      </ul>
    </div>
    
  Some JS:

    var view = new LiveView("#list", {
      numbers: [{digits: 2}, 
                {digits: 1},
                {digits: 3}]
    }); 

    view.numbers.sortBy("digits");
    //or the other direction
    view.numbers.sortBy("digits", true);

  The best part about sorting, is that lists stay sorted!

    view.numbers.create({digits: 4});
    view.numbers.create({digits: 0});

  These will be put in their proper order!

License
=======

MIT Licensed (see LICENSE.txt)

TODO
====

1. It would be nice if there were callbacks or something, "name.afterUpdate",
   "things.afterCreate", "name.beforeRemove", etc or just a afterUpdate
   beforeUpdate type thing which passes in a name and an element
2. Use some kind of document generator/comment format
2. Serialization: "package up" the current state so we can transport it from
   the server.
2. Implement limit
3. Open Source it
4. have limits be a data-attrib? maybe? or not?
5. forms, do we want to do somethin wif em?
6. shorthand for just setting attributes "name.href" "name#href" "name|href"?
