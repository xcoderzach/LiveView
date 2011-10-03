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
    var view = new LiveView("#template")
    view.set("variable", "value")
    assertEquals("Variable was not set", $("#template .variable").html(), "value")
  }

  ViewTest.prototype.testSetAttribute = function() {
    /*:DOC += <div id = "template"><a class = "variable"></a></div>*/
    var view = new LiveView($("#template"))
    view.set("variable", {"content":"googs", "href": "http://google.com"})
    assertEquals("Variable was not set", $("#template .variable").attr("href"), "http://google.com")
  } 

  ViewTest.prototype.testAddIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView("#templateIterable", {
      "things": [{"variable": "A variable"}]
    })

    template.things.append({"variable": "A value"})

    assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "A variable")
    assertEquals("Variable was not set", $("#templateIterable li:nth-child(2) .variable").html(), "A value")
  } 

  ViewTest.prototype.testAddIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView("#templateIterable", {
      "things": [{"variable": "A variable"},{"variable": "A variable"}]
    })

    template.things.insert({"variable": "An inserted variable"}, 0)
    assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "An inserted variable")
  }   

  ViewTest.prototype.testUpdateIterable = function() {
    /*:DOC += <div id = "templateCollection">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView("#templateCollection", {
      "things": []
    })

    var thing = template.things.append({"variable": "value"})
    thing.set({"variable": "newValue"})
    assertEquals("Variable was not set", $("#templateCollection .variable").html(), "newValue")
  } 

  ViewTest.prototype.testDeleteIterable = function() {
    /*:DOC += <div id = "templateDelete">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView($("#templateDelete"), {
      "things": [{"variable": "A variable", _id: "identifier"}]
    })

    template.things.remove("identifier")
    assertEquals("Not deleted", 0, $("#templateDelete .thing .variable").length)
  } 

  ViewTest.prototype.testHidingElement = function() {
    /*:DOC += <div id = "template">
                <span class = "hideme"></span>
                <span class = "andme"></span>
              </div>*/
    var template = new LiveView($("#template"), {"hideme": false, "andme": false})

    assertEquals("Elements were removed not hidden", 2, $("#template span").length)
    assertEquals("Elements not hidden", 0, $("#template span:visible").length)
  } 

  ViewTest.prototype.testSettingHiddenElement = function() {
    /*:DOC += <div id = "template">
                <span class = "hideme">
                  <div class = "updateme">
                  </div>
                </span>
              </div> */
    var template = new LiveView($("#template"), {"hideme": true, "updateme": "foo"})
    template.set("hideme", false)
    template.set("updateme", "bar")
    template.set("hideme", true)
    assertEquals("Not Set", "bar", $("#template .updateme").html())
  }

  ViewTest.prototype.testSetClassAttribute = function() {
    /*:DOC += <div id = "template">
                <div class = "variable"></div>
              </div>*/
    var view = new LiveView($("#template"))
    view.set("variable", {"class": "add cool"})
    assertEquals("Variable was not set", $("#template .variable").attr("class"), "variable add cool") 
  }

  ViewTest.prototype.testSetClassAttribute = function() {
    /*:DOC += <div id = "template">
                <div class = "variable"></div>
              </div>*/
    var view = new LiveView($("#template"))
    view.set("variable", {"class": "add cool"})
    assertEquals("Variable was not set", $("#template .variable").attr("class"), "variable add cool") 
  } 

  ViewTest.prototype.testSelfIsIterable = function() {
    /*:DOC += <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              */
    var template = new LiveView(".things", {
      "things": [{"variable": "A variable"}]
    })

    assertEquals("Variable was not set", $(".things li:nth-child(1) .variable").html(), "A variable") 
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
    var template = new LiveView(".things", {
      "things": [{"variable": "A variable"}]
    })

    var notherthing = new LiveView(".notherthing", {"value":"val"})

    template.things.appendView(notherthing)

    assertEquals("Wrong value", "val", $(".things .notherthing .value").html())
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

    var template = new LiveView(".things", {
      "things": [ {"type": "awesome", "awesomeo": "awesome thing"}
                , {"type": "cool", "coolio": "cool thing"} ]
    })

    assertEquals("Wrong value", "cool thing", $(".things .thing.cool .coolio").html())
    assertEquals("Wrong value", "awesome thing", $(".things .thing.awesome .awesomeo").html())

  }

  ViewTest.prototype.testArrayShorthand = function() {
    /*:DOC += <div class = "template">
                 <ul class = "things">
                  <li class = "value">
                  </li>
                </ul>
            */ 

    var template = new LiveView(".things", {
      "things": [ "one", "two" ]
    })

    template.things.append("three")

    assertEquals("Wrong value", "one", $(".things .value:nth-child(1)").html())
    assertEquals("Wrong value", "two", $(".things .value:nth-child(2)").html())
    assertEquals("Wrong value", "three", $(".things .value:nth-child(3)").html())
  }

  ViewTest.prototype.testAttributeInterpolation = function() {
    /*:DOC += <div class = "template">
                <a href = "/things/#{id}" data-var></a>
              </div>
            */                
    var template = new LiveView($(".template"), {id: 123})

    assertEquals("Wrong value", "/things/123", $(".template a").attr("href"))
  } 

  ViewTest.prototype.testTemplateFile = function() {
    LiveView.fromFile("/views/tests/index.html", {id: 123}, function() {
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

}())
