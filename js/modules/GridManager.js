define([
  "dojo/_base/declare",
  "dojo/_base/array",
  "dojo/_base/lang",
  "dojo/dom",
  "dojo/dom-attr",
  "dojo/Evented",
  
  "dojo/store/Memory",
  "dgrid/OnDemandGrid",
  "dgrid/Selection",

  // objects with module IDs and aliases
  "lists/esri-module-list",
  "lists/dojo-module-list",
  "lists/dijit-module-list",
  "lists/dojox-module-list",
  "lists/dgrid-module-list"
], function(
  declare, arrayUtils, lang, dom, domAttr, Evented,
  Memory, OnDemandGrid, Selection,
  esriModules, dojoModules, dijitModules, dojoxModules, dgridModules
) {
  var gm = declare([Evented], {
    dojoGrid: null,
    dojoSelection: [],
    dojoStore: null,
    esriGrid: null,
    esriSelection: [],
    esriStore: null,
    constructor: function(params) {
      lang.mixin(this, params);
      this.createDojoGrid();
      this.createEsriGrid();

      // fired by clicking on a checkbox, give proper context
      this.updateDojoPackages = lang.hitch(this, this.updateDojoPackages);
    },

    createDojoGrid: function() {
      // var dojoStore = new Memory({ data: dojoModules });
      var allDojo = this.concatDojoInfo();
      //dojoModules.concat(dgridModules).concat(dijitModules).concat(dojoxModules);
      this.dojoStore = new Memory({ data: allDojo });
      this.dojoGrid = declare([OnDemandGrid, Selection])({
        deselectOnRefresh: false, // keep selections when queries are applied
        selectionMode: "toggle",
        store: this.dojoStore,
        columns: {
          id: {
            label: "Dojo Modules",
            sortable: false
          }
        }
      }, this.dojoGridId);
      this.dojoGrid.startup();

      this.dojoGrid.on("dgrid-select", lang.hitch(this, function(e) {
        // console.log("select", e.rows, this);
        var previousSelectionCount = this.dojoSelection.length;
        arrayUtils.forEach(e.rows, function(row) {
          var module = this.getModule(row.id, this.dojoGrid);
          var moduleIdx = arrayUtils.indexOf(this.dojoSelection, module);
          if ( moduleIdx === -1 ) {
            this.dojoSelection.push(module);
          }
        }, this);
        var currentSelectionCount = this.dojoSelection.length;
        if ( previousSelectionCount !== currentSelectionCount ) {
          this.emit("change");
        }
      }));

      this.dojoGrid.on("dgrid-deselect", lang.hitch(this, function(e){
        // console.log("dojo deselect", e.rows);
        arrayUtils.forEach(e.rows, function(row) {
          var module = this.getModule(row.id, this.dojoGrid);
          var moduleIdx = arrayUtils.indexOf(this.dojoSelection, module);
          if ( moduleIdx > -1 ) {
            this.dojoSelection.splice(moduleIdx, 1);
          }
        }, this);
        this.emit("change");
      }));
    },

    createEsriGrid: function() {
      this.esriStore = new Memory({ data: esriModules });
      this.esriGrid = declare([OnDemandGrid, Selection])({
        deselectOnRefresh: false, // keep selections when queries are applied
        selectionMode: "toggle",
        store: this.esriStore,
        columns: {
          id: {
            label: "Esri Modules",
            sortable: false
          }
        }
      }, this.esriGridId);
      this.esriGrid.startup();

      this.esriGrid.on("dgrid-select", lang.hitch(this, function(e) {
        // console.log("select", e.rows, esriGrid.selection);
        var previousSelectionCount = this.esriSelection.length;
        arrayUtils.forEach(e.rows, function(row) {
          var module = this.getModule(row.id, this.esriGrid);
          var moduleIdx = arrayUtils.indexOf(this.esriSelection, module);
          if ( moduleIdx === -1 ) {
            this.esriSelection.push(module);
          }
        }, this);
        var currentSelectionCount = this.esriSelection.length;
        if ( previousSelectionCount !== currentSelectionCount ) {
          this.emit("change");
        }
      }));

      this.esriGrid.on("dgrid-deselect", lang.hitch(this, function(e){
        // console.log("esri deselect", e.rows);
        arrayUtils.forEach(e.rows, function(row) {
          var module = this.getModule(row.id, this.esriGrid);
          var moduleIdx = arrayUtils.indexOf(this.esriSelection, module);
          if ( moduleIdx > -1 ) {
            // console.log("\tremoving", module, moduleIdx);
            this.esriSelection.splice(moduleIdx, 1);
          }
        }, this);
        this.emit("change");
      }));
    },

    updateDojoPackages: function() {
      var allDojo = this.concatDojoInfo();
      var dojoStore = new Memory({ data: allDojo });
      this.dojoGrid.set("store", dojoStore);
    },

    // ugly...shouldn't directly references elements
    concatDojoInfo: function() {
      var all = [];
      if ( domAttr.get(dom.byId("dojoPackage"), "checked") ) {
        all = all.concat(dojoModules);
      }
      if ( domAttr.get(dom.byId("dijitPackage"), "checked") ) {
        all = all.concat(dijitModules);
      }
      if ( domAttr.get(dom.byId("dojoxPackage"), "checked") ) {
        all = all.concat(dojoxModules);
      }
      if ( domAttr.get(dom.byId("dgridPackage"), "checked") ) {
        all = all.concat(dgridModules);
      }
      return all;
    },

    getModule: function(mid, grid) {
      return grid.store.get(mid);
    }

  });

  return gm;
});