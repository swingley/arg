// bring this thing to life...
require([
  "dojo/_base/array",
  "dojo/_base/declare",
  "dojo/dom",
  "dojo/dom-attr",
  "dojo/dom-style",

  "dojo/on",
  "dojo/query",
  "dojo/Stateful",
  "dojo/string",

  "extras/GridManager",
  "extras/TextSelector",
  "extras/formatters",

  // load templates for require only and full html page
  "dojo/text!templates/require-only.txt",
  "dojo/text!templates/full-html.txt"
], function(
  arrayUtils, declare, dom, domAttr, domStyle, 
  on, query, Stateful, string,
  GridManager, TextSelector, formatters,
  requireOnly, fullHtml
) {
  // creates two dgrids:  one for esri, one for dojo
  // pass IDs of dom elements where grids will be created
  var gm = new GridManager({
    dojoGridId: "dojo-list",
    esriGridId: "esri-list"
  });
  gm.on("change", updateRequire);

  // simple require() template as well as full html doc template
  var templates = {
    fullHtml: {
      content: fullHtml,
      pad: "        "
    },
    requireOnly: {
      content: requireOnly,
      pad: "  "
    }
  };
  var config = new Stateful();
  config.set("templates", templates);
  config.watch("current", updateTemplate);
  
  // utility class to format module IDs and aliases
  
  config.set("current", "requireOnly");

  // click anywhere in the require to select all of it for easy copying
  var textSelector = new TextSelector({ id: "output" });

  var moduleFilter = dom.byId("module-filter");
  moduleFilter.focus();
  on(moduleFilter, "keyup", filterModules);

  // show/hide settings
  on(dom.byId("settings"), "click", function() {
    domStyle.set(dom.byId("settingsPane"), "display", "block");
  });
  on(dom.byId("settingsClose"), "click", function() {
    domStyle.set(dom.byId("settingsPane"), "display", "none");
  });

  // monitor radio buttons that specify which template to use
  query("input[type=radio]").forEach(function(radio) {
    on(radio, "change", function() {
      if ( config.get("templates").hasOwnProperty(this.value) ) {
        config.set("current", this.value);
      } else {
        console.log("radio button change::unknown template");
      }
    });
  });

  // monitor check boxes and update grid with dojo modules accordingly
  query("input[type=checkbox]").forEach(function(checkbox) {
    on(checkbox, "change", gm.updateDojoPackages);
  });

  function updateRequire() {
    var templateName = config.get("current");
    var template = config.get("templates")[templateName];
    var content = template.content;
    var pad = template.pad;
    var mids = formatters.mids(gm.esriSelection, gm.dojoSelection, pad); 
    var aliases = formatters.aliases(gm.esriSelection, gm.dojoSelection, pad); 

    var updated = string.substitute(content, [mids, aliases]);
    dom.byId("output").innerHTML = updated;
  }

  function updateTemplate(property, oldVal, newVal) {
    // console.log("update template", arguments);
    if ( !config.get("templates").hasOwnProperty(newVal) ) {
      console.log("unknown template", newVal);
      return;
    }
    updateRequire();
  }

  function filterModules(e) {
    // selected is a string of module IDs appened to the query passed to the store
    // this is done so that selected modules aren't hidden
    var selected = "";
    if ( gm.esriSelection.length ) {
      selected = selected + "|" + arrayUtils.map(gm.esriSelection, function(m) {
        return m.id;
      }).join("|");
    }
    if ( gm.dojoSelection.length ) {
      selected = selected + "|" + arrayUtils.map(gm.dojoSelection, function(m) {
        return m.id;
      }).join("|");
    }
    // console.log("selected", selected);
    gm.esriGrid.set("query", {
      id: new RegExp(this.value + selected, "i") 
    });
    gm.dojoGrid.set("query", {
      id: new RegExp(this.value + selected, "i") 
    });
  }
});