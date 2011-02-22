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

  ViewTest.prototype.testSortBy = function() {
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

    template.things.sortBy("variable");
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
    fail("probably broke");
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
    fail("not implemented yet, maybe it won't be...it's hard!");
    assertEquals("Not Set", "bar", $("#template .updateme").html());
  };

  ViewTest.prototype.testDontInsertIfValueUnchanged = function() {
    fail("failtacular");
  };

  ViewTest.prototype.testLimit = function() {
    /*:DOC += <div id = "template">
                <ul class = "limits">
                  <li class = "limit">
                    <div class = "name"></div>
                  </li>
                </ul>
              </div> */ 
    var template = new LiveView($("#template"), {
      "limits": [{name: "Zach Smith"},
                 {name: "Zach Smith"},
                 {name: "Zach Smith"},
                 {name: "Some Loser"}]
    });

    template.limits.limit(3);

    assertEquals("Not limited", 3, $("#template .limit"));

    // shouldn't just let some loser in
    template.limits.add({name: "Another loser"});

    //is it still limited?
    assertEquals("Not limited", 3, $("#template .limit"));
  };

}());

