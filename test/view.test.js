(function() {
  ViewTest = TestCase("ViewTest");

  ViewTest.prototype.testSetVariable = function() {
    /*:DOC += <div id = "template"><span class = "variable"></span></div>*/
    var view = new LiveView($("#template").get(0));
    view.update("variable", "value");
    assertEquals("Variable was not set", $("#template .variable").html(), "value");
  };

  ViewTest.prototype.testAddIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var view = new LiveView($("#templateIterable").get(0));

    view.add("thing", {"variable": "value"});
    view.add("thing", {"variable": "value2"});

    assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "value");
    assertEquals("Variable was not set", $("#templateIterable li:nth-child(2) .variable").html(), "value2");
  }; 

  ViewTest.prototype.testUpdateIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var view = new LiveView($("#templateIterable").get(0));

    var thing = view.add("thing", {"variable": "value"});
    thing.update({"variable": "newValue"});
    assertEquals("Variable was not set", $("#templateIterable .variable").html(), "newValue");
  }; 

  ViewTest.prototype.testDeleteIterable = function() {
    /*:DOC += <div id = "templateIterable">
                <ul class = "things">
                  <li class = "thing">
                    <span class = "variable"></span>
                  </li>
                </ul>
              </div>*/
    var view = new LiveView($("#templateIterable").get(0));

    var thing = view.add("thing", {"variable": "value"});
    var thing2 = view.add("thing", {"variable": "value2"});

    thing.remove();
    assertEquals("Not deleted", 1, $("#templateIterable .variable").length);
    assertEquals("Deleted wrong thing", $("#templateIterable .variable").html(), "value2");
  }; 

}());
