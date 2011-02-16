(function() {

  ViewTest = TestCase("ViewTest");

  ViewTest.prototype.testSetVariable = function() {
    /*:DOC += <div id = "template"><span class = "variable"></span></div>*/
    var view = new LiveView($("#template").get(0));
    view.set("variable", "value");
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

    jstestdriver.console.log($("#templateIterable").get(0).innerHTML);

    assertEquals("Variable was not set", $("#templateIterable li:nth-child(1) .variable").html(), "value");
    assertEquals("Variable was not set", $("#templateIterable li:nth-child(2) .variable").html(), "value2");
  }; 
}());
