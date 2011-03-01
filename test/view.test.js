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
                <span class = "hideme"></span>
                <span class = "andme"></span>
                <span class = "alsome"></span>
              </div>*/

    var template = new LiveView("#template", {"hideme": 1, "andme": 2, "alsome": 3});

    var visible = false;

    var setList = [ function() { template.set("hideme", visible); },
                    function() { template.set("andme", visible); },
                    function() { template.set("alsome", visible); } ];
    //gunna test all permuations of hiding and unhiding, so I can be sure it works!
    var p = [[1, 2, 3],
             [1, 3, 2],
             [2, 1, 3],
             [2, 3, 1],
             [3, 1, 2],
             [3, 2, 1]];
    var oldHtml;
    for(var i = 0; i < 6 ; i++) {
      for(var j = 0; j < 6 ; j++) {
        setP = p[i];
        unsetP = p[j];

        oldHtml = $("#template").html();
        //hide them!
        visible = false;
        setList[setP[0] -1]();
        setList[setP[1] -1]();
        setList[setP[2] -1]();
        // make sure they're hidden
        assertEquals("Elements not hidden", 0, $("#template").children().length);
        visible = true;
        // unhide them!
        setList[unsetP[0] -1]();
        setList[unsetP[1] -1]();
        setList[unsetP[2] -1]();
        //like we never touched it...KABLAM
        assertEquals("Html was modified", oldHtml, $("#template").html());
      }
    }
  };  

  ViewTest.prototype.testDataDoesntGetOverwrittenWhenAttributeIsUpdated = function() {
    /*:DOC += <div id = "template">
                <a class = "name"></a>
              </div> */ 
    var template = new LiveView($("#template"), {name: "Zach Smith"});
    template.set("name", {href: "mukari.com"});

    assertEquals("Data got clobbered", "mukari.com", template.data.name.href);
    assertEquals("Data got clobbered", "Zach Smith", template.data.name);  
    assertEquals("Data got clobbered", "Zach Smith", template.data.name.content);  
  };

  ViewTest.prototype.testSettingHiddenElement = function() {
    /*:DOC += <div id = "template">
                <span class = "hideme">
                  <div class = "updateme">
                  </div>
                </span>
              </div> */
    var template = new LiveView($("#template"), {"hideme": true, "updateme": "foo"});
    template.set("hideme", false);
    template.set("updateme", "bar");
    template.set("hideme", true);
    assertEquals("Not Set", "bar", $("#template .updateme").html());
  };

  ViewTest.prototype.testSetClassAttribute = function() {
    /*:DOC += <div id = "template">
                <div class = "variable"></div>
              </div>*/
    var view = new LiveView($("#template"));
    view.set("variable", {"class": "add cool"});
    assertEquals("Variable was not set", $("#template .variable").attr("class"), "variable add cool"); 
  };

  ViewTest.prototype.testDontInsertIfValueUnchanged = function() {
    fail("I'm not sure if this is even neccesary!");
  };

  ViewTest.prototype.testSetCustomOrdering = function() {
    fail("not implemented");
  };

}());

