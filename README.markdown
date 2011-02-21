What is this?
=============

  LiveView trys to solve the same problems as traditional templating
systems, and then some.  Rather than generating static markup, LiveView
generates a living, breathing thing, that allows you to update the
your template and it's data on the fly.  All while preserving event 
handlers and any associated data.  This makes the view portion of 
creating realtime web apps a breeze!

When should I use this?
=======================
  
  When part of your web app is changing rapidly, it's super useful.

I have this html, make it live?
================

    <div id = "myView">
      <div class = "currentTime"></div>
    </div>

  Sure!
    // set it to the current time
    var view = new LiveView("#myView", {
      "currentTime": (new Date()).toDateString()
    });
    // and update it every second!
    setInterval(function() {
      view.set("currentTime", (new Date()).toDateString());
    }, 1000);
