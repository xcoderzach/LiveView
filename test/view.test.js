(function() {

  ViewTest = TestCase("ViewTest")

  ViewTest.prototype.setup = function() {
    this.server = sinon.fakeServer.create()
    server.respondWith( "/views/tests/index.html"
                      , [ 400
                        , {}
                        , "<div><div class = \"thing\"></div><div class = \"thing2\"></div></div>"])
  }

  ViewTest.prototype.teardown = function() {
    this.server.restore()
  }

  ViewTest.prototype.testSetVariable = function() {
    /*:DOC += <div id = "template"><span class = "variable"></span></div>*/
    new LiveView("#template", {}, function(view) {
      view.set("variable", "value")
      assertEquals("Variable was not set", $("#template .variable").html(), "value")
    })
  }

  ViewTest.prototype.testSetAttribute = function() {
    /*:DOC += <div id = "template"><a class = "variable"></a></div>*/
    new LiveView($("#template"), {}, function(view) {
      view.set("variable", {"content":"googs", "href": "http://google.com"})
      assertEquals("Variable was not set", $("#template .variable").attr("href"), "http://google.com")
    })
  } 

  ViewTest.prototype.testAddIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    new LiveView("#templateIterable", {
      "things": [{"variable": "A variable"}]
    }, function(template) {
      template.things.append({"variable": "A value"})

      assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "A variable")
      assertEquals("Variable was not set", $("#templateIterable li:nth-child(2) .variable").html(), "A value")
    })
  } 

  ViewTest.prototype.testAddIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    new LiveView("#templateIterable", {
      "things": [{"variable": "A variable"},{"variable": "A variable"}]
    }, function(template) {
      template.things.insert({"variable": "An inserted variable"}, 0)
      assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "An inserted variable")
    })
  }   

  ViewTest.prototype.testUpdateIterable = function() {
    /*:DOC += <div id = "templateCollection">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    new LiveView("#templateCollection", {
      "things": []
    }, function(template) {
      var thing = template.things.append({"variable": "value"})
      thing.set({"variable": "newValue"})
      assertEquals("Variable was not set", $("#templateCollection .variable").html(), "newValue")
    })
  } 

  ViewTest.prototype.testDeleteIterable = function() {
    /*:DOC += <div id = "templateDelete">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    new LiveView($("#templateDelete"), {
      "things": [{"variable": "A variable", id: "identifier"}]
    }, function(template) {
      template.things.remove("identifier")
      assertEquals("Not deleted", 0, $("#templateDelete .thing .variable").length)
    })
  } 

  ViewTest.prototype.testHidingElement = function() {
    /*:DOC += <div id = "template">
                <span class = "hideme"></span>
                <span class = "andme"></span>
              </div>*/
    new LiveView($("#template"), {"hideme": false, "andme": false}, function(template) {
      assertEquals("Elements were removed not hidden", 2, $("#template span").length)
      assertEquals("Elements not hidden", 0, $("#template span:visible").length)
    })
  } 

  ViewTest.prototype.testSettingHiddenElement = function() {
    /*:DOC += <div id = "template">
                <span class = "hideme">
                  <div class = "updateme">
                  </div>
                </span>
              </div> */
    new LiveView($("#template"), {"hideme": true, "updateme": "foo"}, function(template) {
      template.set("hideme", false)
      template.set("updateme", "bar")
      template.set("hideme", true)
      assertEquals("Not Set", "bar", $("#template .updateme").html())
    })
  }

  ViewTest.prototype.testSetClassAttribute = function() {
    /*:DOC += <div id = "template">
                <div class = "variable"></div>
              </div>*/
    new LiveView($("#template"), {}, function(view) {
      view.set("variable", {"class": "add cool"})
      assertEquals("Variable was not set", $("#template .variable").attr("class"), "variable add cool") 
    })
  }

  ViewTest.prototype.testSetClassAttribute = function() {
    /*:DOC += <div id = "template">
                <div class = "variable"></div>
              </div>*/
    new LiveView($("#template"), {}, function(view) {
      view.set("variable", {"class": "add cool"})
      assertEquals("Variable was not set", $("#template .variable").attr("class"), "variable add cool") 
    })
  } 

  ViewTest.prototype.testSelfIsIterable = function() {
    /*:DOC += <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              */
    new LiveView(".things", {
      "things": [{"variable": "A variable"}]
    }, function() {
      assertEquals("Variable was not set", $(".things li:nth-child(1) .variable").html(), "A variable") 
    })
  } 

  ViewTest.prototype.testAddDifferentType = function() {
    /*:DOC += <div class = "template">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
                <div class = "notherthing">
                  <div class = "value"></div>
                </div>
              </div>
            */
    new LiveView(".things", {
      "things": [{"variable": "A variable"}]
    }, function(template) {
      var notherthing = new LiveView(".notherthing", {"value":"val"}, function(notherthing) {
        template.things.appendView(notherthing)
        assertEquals("Wrong value", "val", $(".things .notherthing .value").html())
      })
    })
  } 

  ViewTest.prototype.testPolymorphicBlocks = function() {
    /*:DOC += <div class = "template">
                 <ul class = "things">
                  <li class = "cool thing">
                    <span class = "coolio"></span>
                  </li>
                  <li class = "awesome thing">
                    <span class = "awesomeo"></span>
                  </li> 
                </ul>
              </div>
            */ 

    new LiveView(".things", {
      "things": [ {"type": "awesome", "awesomeo": "awesome thing"}
                , {"type": "cool", "coolio": "cool thing"} ]
    }, function() {
      assertEquals("Wrong value", "cool thing", $(".things .thing.cool .coolio").html())
      assertEquals("Wrong value", "awesome thing", $(".things .thing.awesome .awesomeo").html())
    })

  }

  ViewTest.prototype.testArrayShorthand = function() {
    /*:DOC += <div class = "template">
                 <ul class = "things">
                  <li class = "value">
                  </li>
                </ul>
            */ 

    new LiveView(".things", {
      "things": [ "one", "two" ]
    }, function(template) {
      template.things.append("three")

      assertEquals("Wrong value", "one", $(".things .value:nth-child(1)").html())
      assertEquals("Wrong value", "two", $(".things .value:nth-child(2)").html())
      assertEquals("Wrong value", "three", $(".things .value:nth-child(3)").html())
    })
  }

  ViewTest.prototype.testAttributeInterpolation = function() {
    /*:DOC += <div class = "template">
                <a href = "/things/#{id}" data-var></a>
              </div>
            */                
    new LiveView($(".template"), {id: 123}, function(template) {
      assertEquals("Wrong value", "/things/123", $(".template a").attr("href"))
    })
  } 

  ViewTest.prototype.testAttributeInterpolationMultipleTimes = function() {
    /*:DOC += <div class = "template">
                <a href = "/things/#{id}" data-var></a>
              </div>
            */                
    new LiveView($(".template"), {id: 123}, function(template) {
      template.set("id", 124)
      assertEquals("Wrong value", "/things/124", $(".template a").attr("href"))
    })
  } 
 

  ViewTest.prototype.testTemplateFile = function() {
    new LiveView("/views/tests/index.html", {id: 123}, function() {
      assertEquals("Wrong value", "derp", $(".thing").html())
      assertEquals("Wrong value", "herp", $(".thing2").html())
    })
  }

  ViewTest.prototype.testPartial = function() {
    /*:DOC += <div class = "template">
                <div data-partial = "/views/tests/index.html"></div>
              </div> */                
    new LiveView("/views/tests/index.html", {id: 123}, function() {
      assertEquals("Wrong value", "derp", $(".thing").html())
      assertEquals("Wrong value", "herp", $(".thing2").html())
    })
  } 

  ViewTest.prototype.testUpdateAttributeMultipleTime = function() {

  }

  ViewTest.prototype.testInputElement = function() {
    /*:DOC += <div id = "template">
                <input class = "thing">
              </div> */
    new LiveView("#template", {}, function(view) {
      view.set("thing", "myvalue")
      assertEquals("Variable was not set", $("#template .thing").val(), "myvalue")
    })
  }
 
}())
