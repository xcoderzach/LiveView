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
    var view = new LiveView($("#templateCollection"));

    var thing = view.things.add({"variable": "value"});
    thing.set({"variable": "newValue"});
    assertEquals("Variable was not set", $("#templateIterable .variable").html(), "newValue");
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

    var item = template.things.getById("ac23f");
    assertEquals("Not deleted", "ac23f", item.data.id);
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
                 {"variable": 10},
                 {"variable": 2},
                 {"variable": 6}]
    });

    template.things.sort(function(data1, data2) {
      return data1.variable - data2.variable;
    });
    fail();
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
                 {"variable": 10},
                 {"variable": 2},
                 {"variable": 6}]
    });

    template.things.sort(function(data1, data2) {
      return data1.variable - data2.variable;
    });
  }; 
}());

