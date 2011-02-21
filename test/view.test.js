(function() {
  ViewTest = TestCase("ViewTest");

  ViewTest.prototype.testSetVariable = function() {
    /*:DOC += <div id = "template"><span class = "variable"></span></div>*/
    var view = new LiveView($("#template").get(0));
    view.set("variable", "value");
    assertEquals("Variable was not set", $("#template .variable").html(), "value");
  };

  ViewTest.prototype.testSetAttribute = function() {
    /*:DOC += <div id = "template"><a class = "variable"></a></div>*/
    var view = new LiveView($("#template"));
    view.set("variable", {"content":"googs", "href": "http://google.com"});
    assertEquals("Variable was not set", $("#template .variable").attr("href"), "http://google.com");
  }; 

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
    });

    template.things.add({"variable": "A value"});

    assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "A variable");
    assertEquals("Variable was not set", $("#templateIterable li:nth-child(2) .variable").html(), "A value");
  }; 

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
    });

    var thing = template.things.add({"variable": "value"});
    thing.set({"variable": "newValue"});
    assertEquals("Variable was not set", $("#templateCollection .variable").html(), "newValue");
  }; 
  /* FRACK THIS TEST IT WORKS IN THE EXAMPLES WITH THE EXACT SAME CODE */
  ViewTest.prototype.testDeleteIterable = function() {
    /*:DOC += <div id = "templateDelete">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView($("#templateDelete"), {
      "things": [{"variable": "A variable"}]
    });

    template.things.remove(0);
    assertEquals("Not deleted", 0, $("#templateDelete .thing .variable").length);
  }; 

  ViewTest.prototype.testGetById = function() {
    /*:DOC += <div id = "templateWitIds">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView($("#templateWitIds"), {
      "things": [{"variable": "A variable", "id": "ac23f"}, 
                 {"variable": "Another variable", "id": "5c139"}]
    });

    var item = template.things.get("id", "ac23f");
    assertEquals("Got the right element", "ac23f", item.data.id);
  }; 

  ViewTest.prototype.testSort = function() {
    /*:DOC += <div id = "templateWitIds">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView($("#templateWitIds"), {
      "things": [{"variable": 1}, 
                 {"variable": 3},
                 {"variable": 2},
                 {"variable": 4}]
    });

    template.things.sort(function(data1, data2) {
      return data1.variable - data2.variable;
    });
    expectAsserts(4);
    for(var i = 0 ; i < template.things.length() ; i++) {
      assertEquals("not sorted", i + 1, template.things.get(i).data.variable);
    }
  };       
  ViewTest.prototype.testAddAfterSort = function() {
    /*:DOC += <div id = "templateWitIds">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var template = new LiveView($("#templateWitIds"), {
      "things": [{"variable": 1}, 
                 {"variable": 3},
                 {"variable": 2},
                 {"variable": 5}]
    });

    template.things.sort(function(data1, data2) {
      return data1.variable - data2.variable;
    });

    template.things.add({"variable": 4});

    expectAsserts(5);
    for(var i = 0 ; i < template.things.length() ; i++) {
      assertEquals("not sorted", i + 1, template.things.get(i).data.variable);
    }
  }; 
  ViewTest.prototype.testHidingElement = function() {
    /*:DOC += <div id = "template">
                <span class = "hideme"></span>
                <span class = "andme"></span>
              </div>*/
    var template = new LiveView($("#template"), {"hideme": false, "andme": false});

    assertEquals("Elements not hidden", 0, $("#template").children().length);
  }; 

  ViewTest.prototype.testHidingMaintainsOrder = function() {
    /*:DOC += <div id = "template">
                text
                <span class = "hideme"></span>
                texty
                <span class = "andme"></span>
                textyyy
                <span class = "alsome"></span>
                textyyyyyy
                <span class = "ninja"></span>
                textooooo
              </div>*/
    var template = new LiveView($("#template"), {"hideme": 1, "andme": 2, "alsome": 3, "ninja": 4});

    var oldHtml = $("#template").html();
    //hide in order
    template.set("hideme", false);
    template.set("andme", false);
    template.set("alsome", false);
    template.set("ninja", false);
    // make sure they're hidden
    assertEquals("Elements not hidden", 0, $("#template").children().length);
    // unhide them!
    template.set("hideme", true);
    template.set("ninja", true);
    template.set("alsome", true);
    template.set("andme", true);
    //like we never touched it...KABLAM
    assertEquals("Html was modified", oldHtml, $("#template").html());
  };  
}());

